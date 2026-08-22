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

export async function groqChat(
  messages: ChatMessage[],
  tools?: ToolDef[]
): Promise<GroqChatResponse> {
  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      tools,
      tool_choice: tools ? "auto" : undefined,
    }),
  });
  if (!res.ok) {
    throw new Error(`Groq API error ${res.status}: ${await res.text()}`);
  }
  return (await res.json()) as GroqChatResponse;
}