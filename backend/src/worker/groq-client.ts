const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

const MODEL = process.env.GROQ_MODEL ?? "llama-3.1-8b-instant";

export interface ToolDef {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

export interface ChatMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string | null;
  tool_call_id?: string;
  tool_calls?: any[];
}

export interface GroqChatResponse {
  choices: {
    message: ChatMessage;
    finish_reason: string;
  }[];
}

function parseRetryAfterMs(errBody: string): number {
  // Groq embeds "try again in 1.095s" in the response body
  const match = errBody.match(/try again in ([\d.]+)s/i);
  if (match) {
    return Math.ceil(parseFloat(match[1]) * 1000) + 150; // extra buffer
  }
  return 1500;
}

export async function groqChat(
  messages: ChatMessage[],
  tools?: ToolDef[],
  maxRetries = 3
): Promise<GroqChatResponse> {
  let lastErr: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const res = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        tools: tools && tools.length > 0 ? tools : undefined,
        tool_choice: tools && tools.length > 0 ? "auto" : undefined,
      }),
    });

    if (res.ok) {
      return (await res.json()) as GroqChatResponse;
    }

    const bodyText = await res.text();

    if (res.status === 429 && attempt < maxRetries) {
      const waitMs = parseRetryAfterMs(bodyText);
      console.warn(
        `[groq-client] 429 rate limit reached. Waiting ${waitMs}ms before retry (${attempt + 1}/${maxRetries})...`
      );
      await new Promise((resolve) => setTimeout(resolve, waitMs));
      continue;
    }

    lastErr = new Error(`Groq API error ${res.status}: ${bodyText}`);
    break;
  }

  throw lastErr ?? new Error("Unknown error executing Groq request.");
}