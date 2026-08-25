import { groqChat, type ChatMessage, type ToolDef } from "./groq-client";
import { getEmailBody, listUnreadEmails, sendEmail } from "./tools/gmail";
import { buildUserContext } from "./memory-service";
import { getValidAccessToken } from "./tools/token";
import { recordInteractionEvent } from "../heimdall/engine";
import type { Domain } from "../heimdall/types";

const HEIMDALL_URL = process.env.HEIMDALL_API_URL ?? "http://localhost:4000/heimdall";

interface PreferenceResponse {
  found: boolean;
  value: number | string;
  confidence: number;
  source: "explicit" | "inferred";
  evidence_count: number;
  last_updated: string;
  locked: boolean;
}

async function getPreference(
  userId: string,
  domain: string,
  key: string
): Promise<PreferenceResponse | null> {
  try {
    const res = await fetch(`${HEIMDALL_URL}/preferences/${userId}/${domain}/${key}`);
    if (res.status === 404) return null;
    return (await res.json()) as PreferenceResponse;
  } catch (err) {
    console.warn(`[agent] Failed to fetch preference ${domain}/${key}:`, err);
    return null;
  }
}

async function reportEvent(body: Record<string, unknown>) {
  try {
    await fetch(`${HEIMDALL_URL}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (err) {
    console.warn("[agent] reportEvent failed (non-fatal):", err);
  }
}

const tools: ToolDef[] = [
  {
    type: "function",
    function: {
      name: "list_unread_emails",
      description: "List the user's unread Gmail messages.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "get_email_body",
      description:
        "Fetch the body text of one email by message id (truncated to ~2000 chars). Only call this if the subject/snippet from list_unread_emails isn't enough to answer the request -- most summaries don't need it.",
      parameters: {
        type: "object",
        properties: { messageId: { type: "string" } },
        required: ["messageId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "send_email",
      description: "Send or reply to an email.",
      parameters: {
        type: "object",
        properties: {
          to: { type: "string" },
          subject: { type: "string" },
          body: { type: "string" },
          threadId: { type: "string" },
        },
        required: ["to", "subject", "body"],
      },
    },
  },
];

/** Placeholder heuristic -- swap for a real classifier or a Groq call later. */
function estimateToneScore(body: string): number {
  const casualMarkers = /\b(hey|thanks!|cheers|lol|btw)\b/i.test(body);
  return casualMarkers ? 0.8 : 0.3;
}

/**
 * Runs one task end-to-end: check for the user's preferred tone, hand it to
 * the model as context, let the model use tools, and report what happened
 * back to Heimdall.
 */
export async function runEmailTask(
  userId: string,
  accessToken: string,
  userInstruction: string
): Promise<string> {
  const tonePref = await getPreference(userId, "communication", "tone");

  const toneGuidance = tonePref
    ? `The user's learned tone preference (confidence ${tonePref.confidence}): ${
        typeof tonePref.value === "number" && tonePref.value < 0.5
          ? "short, direct, casual"
          : "formal, detailed"
      }. ${tonePref.confidence < 0.4 ? "Confidence is low -- lean neutral and let the user edit freely." : ""}`
    : "No learned tone preference yet -- default to a neutral, professional tone.";

  const messages: ChatMessage[] = [
    {
      role: "system",
      content: `You are the execution agent for this user's personal assistant. You can read and send Gmail on their behalf using the provided tools. ${toneGuidance} Always confirm the exact recipient, subject, and body before sending -- do not invent email addresses.`,
    },
    { role: "user", content: userInstruction },
  ];

  let lastExecutedTool: { name: string; args: any } | null = null;

  for (let step = 0; step < 5; step++) {
    let response;
    try {
      response = await groqChat(messages, tools);
    } catch (err) {
      console.error("[agent] runEmailTask groqChat failed:", err);
      if (lastExecutedTool?.name === "send_email") {
        return `Sent the email to ${lastExecutedTool.args.to} with subject "${lastExecutedTool.args.subject}".`;
      }
      return "Sorry, something went wrong while processing your request.";
    }

    const choice = response.choices[0];
    if (!choice) break;

    const toolCalls = choice.message.tool_calls;
    if (!toolCalls || toolCalls.length === 0) {
      return choice.message.content ?? "Done.";
    }

    messages.push(choice.message);

    for (const call of toolCalls) {
      const args = JSON.parse(call.function.arguments);
      let result: unknown;

      try {
        if (call.function.name === "list_unread_emails") {
          result = await listUnreadEmails(accessToken);
        } else if (call.function.name === "get_email_body") {
          result = await getEmailBody(accessToken, args.messageId);
        } else if (call.function.name === "send_email") {
          result = await sendEmail(accessToken, args.to, args.subject, args.body, args.threadId);
          lastExecutedTool = { name: "send_email", args };

          reportEvent({
            user_id: userId,
            domain: "communication",
            preference_key: "tone",
            event_type: "suggestion_accepted",
            raw_value: { tone_score: estimateToneScore(args.body) },
            context: { channel: "email" },
            source: "inferred",
          }).catch((err) => {
            console.warn("[agent] reportEvent background error:", err);
          });
        } else {
          result = { error: "Unknown tool" };
        }
      } catch (toolErr) {
        result = { error: (toolErr as Error).message };
      }

      messages.push({
        role: "tool",
        tool_call_id: call.id,
        content: JSON.stringify(result),
      });
    }
  }

  return "Task did not complete within the step limit.";
}

/**
 * General-purpose Groq agent for handling any Telegram user message.
 */
export async function runChatTask(
  userId: string,
  userMessage: string
): Promise<string> {
  const userContext = await buildUserContext(userId);

  let accessToken: string | null = null;
  try {
    accessToken = await getValidAccessToken(userId);
  } catch {
    // Gmail not connected
  }

  const activeTools = accessToken ? tools : [];
  const hasTools = activeTools.length > 0;

  const systemPrompt = `You are Sery, a smart personal assistant accessible via Telegram.
${
  hasTools
    ? "You can read and send emails on the user's behalf using the provided tools."
    : "Gmail is not currently connected for this user, so you cannot read, list, or send emails right now."
}
You remember the user's preferences, facts, and current context.

${userContext}

Guidelines:
- Be concise and natural unless the user's stored preferences say otherwise.
${
  hasTools
    ? "- For email tasks, use the available tools. Generate the email content yourself from the user's intent — do not ask them to write it.\n- After sending an email, confirm what was sent."
    : "- If the user asks about email, tell them they need to connect Gmail first via the web app. Do not attempt to call any email-related tool -- none are available this turn."
}
- Never invent email addresses — if you don't know the recipient's address, say so and ask.
- Do not ask the user to use special commands or buttons.`;

  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userMessage },
  ];

  let lastExecutedTool: { name: string; args: any } | null = null;

  for (let step = 0; step < 5; step++) {
    let response;
    try {
      response = await groqChat(messages, hasTools ? activeTools : undefined);
    } catch (err) {
      console.error("[agent] runChatTask groqChat failed:", err);

      // Graceful fallback if side-effect action already executed successfully
      if (lastExecutedTool?.name === "send_email") {
        return `Sent the email to ${lastExecutedTool.args.to}. (Encountered a rate-limit hiccup generating confirmation, but the email went through successfully.)`;
      }
      return "Sorry, something went wrong. Please try again.";
    }

    const choice = response.choices[0];
    if (!choice) break;

    const toolCalls = choice.message.tool_calls;
    if (!toolCalls || toolCalls.length === 0) {
      return choice.message.content ?? "Sorry, I could not generate a response.";
    }

    messages.push(choice.message);

    for (const call of toolCalls) {
      const args = JSON.parse(call.function.arguments);
      let result: unknown;

      try {
        if (call.function.name === "list_unread_emails") {
          result = await listUnreadEmails(accessToken!);
        } else if (call.function.name === "get_email_body") {
          result = await getEmailBody(accessToken!, args.messageId);
        } else if (call.function.name === "send_email") {
          result = await sendEmail(
            accessToken!,
            args.to,
            args.subject,
            args.body,
            args.threadId
          );
          lastExecutedTool = { name: "send_email", args };

          // Non-blocking telemetry reporting
          recordInteractionEvent({
            user_id: userId,
            domain: "communication" as Domain,
            preference_key: "tone",
            event_type: "suggestion_accepted",
            raw_value: { tone_score: estimateToneScore(args.body) },
            context: { channel: "email" },
            source: "inferred",
            weight: 1,
          }).catch((err) => {
            console.warn("[agent] recordInteractionEvent failed (non-fatal):", err);
          });
        } else {
          result = { error: "Unknown tool" };
        }
      } catch (toolErr) {
        result = { error: (toolErr as Error).message };
      }

      messages.push({
        role: "tool",
        tool_call_id: call.id,
        content: JSON.stringify(result),
      });
    }
  }

  return "Sorry, I ran out of steps trying to complete your request.";
}