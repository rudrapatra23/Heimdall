/**
 * Tests for natural-language memory learning.
 * Uses Bun's built-in test runner: `bun test src/heimdall/__tests__/memory.test.ts`
 *
 * All external I/O (Groq API, DB) is mocked so tests are fast and offline.
 */

import { describe, it, expect, mock, beforeEach } from "bun:test";

// ─── Mock groqChat ─────────────────────────────────────────────────────────────
// Must be done before the modules that import it are loaded.

const mockGroqChatImpl = mock((): Promise<any> => Promise.resolve({ choices: [] }));

mock.module("../../worker/groq-client", () => ({
  groqChat: mockGroqChatImpl,
}));

// ─── Mock DB layer ─────────────────────────────────────────────────────────────

const mockRecordInteractionEvent = mock((): Promise<any> => Promise.resolve({ id: "pref-1" }));
const mockInsertMemory = mock((): Promise<any> => Promise.resolve({ id: "mem-1" }));
const mockUpsertTemporaryContext = mock((): Promise<any> => Promise.resolve());
const mockListPreferences = mock((): Promise<any> => Promise.resolve([]));
const mockListMemories = mock((): Promise<any> => Promise.resolve([]));
const mockGetActiveTemporaryContext = mock((): Promise<any> => Promise.resolve([]));

mock.module("../../heimdall/engine", () => ({
  recordInteractionEvent: mockRecordInteractionEvent,
  getPreferenceForAgent: mock(() => Promise.resolve(null)),
}));

mock.module("../../heimdall/db", () => ({
  insertMemory: mockInsertMemory,
  upsertTemporaryContext: mockUpsertTemporaryContext,
  listPreferences: mockListPreferences,
  listMemories: mockListMemories,
  getActiveTemporaryContext: mockGetActiveTemporaryContext,
  getPreference: mock(() => Promise.resolve(null)),
  upsertPreference: mock(() => Promise.resolve({})),
  insertEvent: mock(() => Promise.resolve()),
  getEventHistory: mock(() => Promise.resolve([])),
  findSimilarMemories: mock(() => Promise.resolve([])),
}));

// ─── Mock Gmail + token tools ──────────────────────────────────────────────────

const mockSendEmail = mock(() => Promise.resolve({ data: { id: "msg_123" } }));
const mockListUnreadEmails = mock(() => Promise.resolve([]));
const mockGetEmailBody = mock(() => Promise.resolve("email body text"));
const mockGetValidAccessToken = mock(() => Promise.resolve("fake-access-token"));

mock.module("../../worker/tools/gmail", () => ({
  sendEmail: mockSendEmail,
  listUnreadEmails: mockListUnreadEmails,
  getEmailBody: mockGetEmailBody,
}));

mock.module("../../worker/tools/token", () => ({
  getValidAccessToken: mockGetValidAccessToken,
}));

// ─── Helpers ───────────────────────────────────────────────────────────────────

/** Make groqChat return a memory extraction JSON response */
function mockExtraction(json: object) {
  mockGroqChatImpl.mockImplementationOnce(() =>
    Promise.resolve({
      choices: [
        {
          message: { role: "assistant", content: JSON.stringify(json) },
          finish_reason: "stop",
        },
      ],
    })
  );
}

/** Make groqChat return a plain text chat response (no tools) */
function mockChatText(text: string) {
  mockGroqChatImpl.mockImplementationOnce(() =>
    Promise.resolve({
      choices: [
        {
          message: { role: "assistant", content: text, tool_calls: undefined },
          finish_reason: "stop",
        },
      ],
    })
  );
}

/** Make groqChat return a tool-call response */
function mockToolCall(toolName: string, args: object) {
  mockGroqChatImpl.mockImplementationOnce(() =>
    Promise.resolve({
      choices: [
        {
          message: {
            role: "assistant",
            content: null,
            tool_calls: [
              {
                id: "call_1",
                type: "function",
                function: { name: toolName, arguments: JSON.stringify(args) },
              },
            ],
          },
          finish_reason: "tool_calls",
        },
      ],
    })
  );
}

const TEST_USER_ID = "test-user-123";

// ─── Import modules under test (after mocks are set up) ───────────────────────
const { extractMemoryFromMessage } = await import("../../worker/memory-extractor");
const { learnFromMessage, buildUserContext } = await import("../../worker/memory-service");
const { runChatTask } = await import("../../worker/agent");

// ══════════════════════════════════════════════════════════════════════════════
// SUITE 1: Memory Extractor — LLM classification
// ══════════════════════════════════════════════════════════════════════════════

describe("Memory Extractor — extractMemoryFromMessage", () => {
  it("classifies a programming-language preference", async () => {
    mockExtraction({
      category: "preference",
      content: "User is learning Go",
      domain: "general",
      preference_key: "programming_language",
      value: "Go",
      is_correction: false,
      old_value: null,
    });
    const result = await extractMemoryFromMessage("I'm learning Go");
    expect(result).not.toBeNull();
    expect(result!.category).toBe("preference");
    expect(result!.value).toBe("Go");
    expect(result!.preference_key).toBe("programming_language");
  });

  it("classifies a response-style preference", async () => {
    mockExtraction({
      category: "preference",
      content: "User prefers concise responses",
      domain: "communication",
      preference_key: "response_style",
      value: "concise",
      is_correction: false,
      old_value: null,
    });
    const result = await extractMemoryFromMessage("I prefer concise responses");
    expect(result!.category).toBe("preference");
    expect(result!.domain).toBe("communication");
    expect(result!.preference_key).toBe("response_style");
  });

  it("classifies a work-schedule habit", async () => {
    mockExtraction({
      category: "habit",
      content: "User usually works at night",
      domain: "scheduling",
      preference_key: "work_schedule",
      value: "nights",
      is_correction: false,
      old_value: null,
    });
    const result = await extractMemoryFromMessage("I usually work at night");
    expect(result!.category).toBe("habit");
    expect(result!.domain).toBe("scheduling");
    expect(result!.value).toBe("nights");
  });

  it("classifies a career goal", async () => {
    mockExtraction({
      category: "goal",
      content: "User wants to become a backend engineer",
      domain: "general",
      preference_key: null,
      value: "backend engineer",
      is_correction: false,
      old_value: null,
    });
    const result = await extractMemoryFromMessage("I want to become a backend engineer");
    expect(result!.category).toBe("goal");
    expect(result!.domain).toBe("general");
  });

  it("classifies temporary context (debugging task)", async () => {
    mockExtraction({
      category: "temp_context",
      content: "User is currently debugging Gmail OAuth",
      domain: "general",
      preference_key: "current_task",
      value: "debugging Gmail OAuth",
      is_correction: false,
      old_value: null,
    });
    const result = await extractMemoryFromMessage("I'm debugging Gmail OAuth right now");
    expect(result!.category).toBe("temp_context");
    expect(result!.preference_key).toBe("current_task");
  });

  it("returns null for irrelevant statements (eating pizza)", async () => {
    mockExtraction({
      category: "irrelevant",
      content: null,
      domain: "general",
      preference_key: null,
      value: null,
      is_correction: false,
      old_value: null,
    });
    const result = await extractMemoryFromMessage("I'm eating pizza");
    expect(result).toBeNull();
  });

  it("classifies a contradiction/correction", async () => {
    mockExtraction({
      category: "correction",
      content: "User now prefers Go over Python",
      domain: "general",
      preference_key: "programming_language",
      value: "Go",
      is_correction: true,
      old_value: "Python",
    });
    const result = await extractMemoryFromMessage("I used to prefer Python, now I prefer Go");
    expect(result!.category).toBe("correction");
    expect(result!.is_correction).toBe(true);
    expect(result!.old_value).toBe("Python");
    expect(result!.value).toBe("Go");
  });

  it("returns null when Groq returns empty content", async () => {
    mockGroqChatImpl.mockImplementationOnce(() =>
      Promise.resolve({ choices: [{ message: { role: "assistant", content: "" }, finish_reason: "stop" }] })
    );
    const result = await extractMemoryFromMessage("hello");
    expect(result).toBeNull();
  });

  it("returns null and logs when JSON parse fails", async () => {
    mockGroqChatImpl.mockImplementationOnce(() =>
      Promise.resolve({ choices: [{ message: { role: "assistant", content: "not json" }, finish_reason: "stop" }] })
    );
    const result = await extractMemoryFromMessage("hello");
    expect(result).toBeNull();
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// SUITE 2: Memory Service — routing extracted memory to correct store
// ══════════════════════════════════════════════════════════════════════════════

describe("Memory Service — learnFromMessage", () => {
  beforeEach(() => {
    mockRecordInteractionEvent.mockClear();
    mockInsertMemory.mockClear();
    mockUpsertTemporaryContext.mockClear();
  });

  it("routes preference → preference engine with explicit_statement", async () => {
    mockExtraction({
      category: "preference",
      content: "User prefers concise responses",
      domain: "communication",
      preference_key: "response_style",
      value: "concise",
      is_correction: false,
      old_value: null,
    });
    const result = await learnFromMessage(TEST_USER_ID, "I prefer concise responses");

    expect(mockRecordInteractionEvent).toHaveBeenCalledTimes(1);
    expect(mockRecordInteractionEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: TEST_USER_ID,
        event_type: "explicit_statement",
        preference_key: "response_style",
        domain: "communication",
        source: "explicit",
      })
    );
    expect(result).toContain("preference");
    expect(mockInsertMemory).not.toHaveBeenCalled();
  });

  it("routes fact → long_term_memories", async () => {
    mockExtraction({
      category: "fact",
      content: "User works as a backend engineer",
      domain: "general",
      preference_key: null,
      value: "backend engineer",
      is_correction: false,
      old_value: null,
    });
    const result = await learnFromMessage(TEST_USER_ID, "I am a backend engineer");

    expect(mockInsertMemory).toHaveBeenCalledTimes(1);
    expect(mockInsertMemory).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: TEST_USER_ID, source: "explicit" })
    );
    expect(result).not.toBeNull();
    expect(mockRecordInteractionEvent).not.toHaveBeenCalled();
  });

  it("routes goal → long_term_memories", async () => {
    mockExtraction({
      category: "goal",
      content: "User wants to become a backend engineer",
      domain: "general",
      preference_key: null,
      value: "backend engineer",
      is_correction: false,
      old_value: null,
    });
    await learnFromMessage(TEST_USER_ID, "I want to become a backend engineer");

    expect(mockInsertMemory).toHaveBeenCalledTimes(1);
    expect(mockRecordInteractionEvent).not.toHaveBeenCalled();
  });

  it("routes temp_context → temporary_context table with TTL", async () => {
    mockExtraction({
      category: "temp_context",
      content: "User is debugging Gmail OAuth",
      domain: "general",
      preference_key: "current_task",
      value: "debugging Gmail OAuth",
      is_correction: false,
      old_value: null,
    });
    const result = await learnFromMessage(TEST_USER_ID, "I'm debugging Gmail OAuth right now");

    expect(mockUpsertTemporaryContext).toHaveBeenCalledTimes(1);
    expect(mockUpsertTemporaryContext).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: TEST_USER_ID,
        key: "current_task",
        ttl_hours: 4,
      })
    );
    expect(result).toContain("context");
    expect(mockRecordInteractionEvent).not.toHaveBeenCalled();
    expect(mockInsertMemory).not.toHaveBeenCalled();
  });

  it("returns null and stores nothing for irrelevant messages", async () => {
    mockExtraction({
      category: "irrelevant",
      content: null,
      domain: "general",
      preference_key: null,
      value: null,
      is_correction: false,
      old_value: null,
    });
    const result = await learnFromMessage(TEST_USER_ID, "I'm eating pizza");

    expect(result).toBeNull();
    expect(mockRecordInteractionEvent).not.toHaveBeenCalled();
    expect(mockInsertMemory).not.toHaveBeenCalled();
    expect(mockUpsertTemporaryContext).not.toHaveBeenCalled();
  });

  it("routes correction → engine with weight=4 (overrides locked pref)", async () => {
    mockExtraction({
      category: "correction",
      content: "User now prefers Go over Python",
      domain: "general",
      preference_key: "programming_language",
      value: "Go",
      is_correction: true,
      old_value: "Python",
    });
    await learnFromMessage(TEST_USER_ID, "I used to prefer Python, now I prefer Go");

    expect(mockRecordInteractionEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        event_type: "explicit_statement",
        preference_key: "programming_language",
        weight: 4,
      })
    );
  });

  it("returns null when extraction returns null (no learnable content)", async () => {
    mockGroqChatImpl.mockImplementationOnce(() =>
      Promise.resolve({ choices: [{ message: { role: "assistant", content: "not json" }, finish_reason: "stop" }] })
    );
    const result = await learnFromMessage(TEST_USER_ID, "hello");
    expect(result).toBeNull();
    expect(mockRecordInteractionEvent).not.toHaveBeenCalled();
  });

  it("falls back to domain=general for unknown domains from LLM", async () => {
    mockExtraction({
      category: "preference",
      content: "User likes cats",
      domain: "pets", // not a valid domain
      preference_key: "pet_preference",
      value: "cats",
      is_correction: false,
      old_value: null,
    });
    await learnFromMessage(TEST_USER_ID, "I love cats");
    expect(mockRecordInteractionEvent).toHaveBeenCalledWith(
      expect.objectContaining({ domain: "general" })
    );
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// SUITE 3: buildUserContext — context formatting for Groq prompt
// ══════════════════════════════════════════════════════════════════════════════

describe("Memory Service — buildUserContext", () => {
  it("returns placeholder when no data exists", async () => {
    mockListPreferences.mockResolvedValueOnce([]);
    mockListMemories.mockResolvedValueOnce([]);
    mockGetActiveTemporaryContext.mockResolvedValueOnce([]);

    const ctx = await buildUserContext(TEST_USER_ID);
    expect(ctx).toContain("No stored preferences");
  });

  it("includes preferences in context string", async () => {
    mockListPreferences.mockResolvedValueOnce([
      { domain: "communication", preference_key: "response_style", value: "concise", confidence: 1.0, source: "explicit" },
    ] as any);
    mockListMemories.mockResolvedValueOnce([]);
    mockGetActiveTemporaryContext.mockResolvedValueOnce([]);

    const ctx = await buildUserContext(TEST_USER_ID);
    expect(ctx).toContain("response_style");
    expect(ctx).toContain("concise");
  });

  it("includes memories and temp context", async () => {
    mockListPreferences.mockResolvedValueOnce([]);
    mockListMemories.mockResolvedValueOnce([
      { content: "User is a backend engineer", domain: "general", source: "explicit" },
    ] as any);
    mockGetActiveTemporaryContext.mockResolvedValueOnce([
      { key: "current_task", value: "debugging OAuth", expires_at: new Date(Date.now() + 3_600_000).toISOString() },
    ] as any);

    const ctx = await buildUserContext(TEST_USER_ID);
    expect(ctx).toContain("backend engineer");
    expect(ctx).toContain("current_task");
    expect(ctx).toContain("debugging OAuth");
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// SUITE 4: Telegram → Groq → response flow
// ══════════════════════════════════════════════════════════════════════════════

describe("Telegram → Groq → response flow (runChatTask)", () => {
  beforeEach(() => {
    mockListPreferences.mockResolvedValue([]);
    mockListMemories.mockResolvedValue([]);
    mockGetActiveTemporaryContext.mockResolvedValue([]);
    mockGetValidAccessToken.mockClear();
  });

  it("returns Groq text for a plain question", async () => {
    mockGetValidAccessToken.mockRejectedValueOnce(new Error("no gmail"));
    mockChatText("The capital of France is Paris.");

    const response = await runChatTask(TEST_USER_ID, "What is the capital of France?");
    expect(response).toBe("The capital of France is Paris.");
  });

  it("returns fallback message when Groq returns no choices", async () => {
    mockGetValidAccessToken.mockRejectedValueOnce(new Error("no gmail"));
    mockGroqChatImpl.mockImplementationOnce(() =>
      Promise.resolve({ choices: [] })
    );
    const response = await runChatTask(TEST_USER_ID, "test");
    expect(typeof response).toBe("string");
  });

  it("injects user context into system prompt (contains preference data)", async () => {
    mockListPreferences.mockResolvedValueOnce([
      { domain: "communication", preference_key: "response_style", value: "concise", confidence: 1.0, source: "explicit" },
    ] as any);
    mockListMemories.mockResolvedValueOnce([]);
    mockGetActiveTemporaryContext.mockResolvedValueOnce([]);
    mockGetValidAccessToken.mockRejectedValueOnce(new Error("no gmail"));

    let capturedMessages: any[] = [];
    (mockGroqChatImpl as any).mockImplementationOnce((messages: any) => {
      capturedMessages = messages;
      return Promise.resolve({
        choices: [{ message: { role: "assistant", content: "OK", tool_calls: undefined }, finish_reason: "stop" }],
      });
    });

    await runChatTask(TEST_USER_ID, "hello");
    const systemMsg = capturedMessages[0]?.content ?? "";
    expect(systemMsg).toContain("response_style");
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// SUITE 5: Natural-language email generation → Gmail tool → outcome
// ══════════════════════════════════════════════════════════════════════════════

describe("Natural-language email → Gmail tool → outcome", () => {
  beforeEach(() => {
    mockListPreferences.mockResolvedValue([]);
    mockListMemories.mockResolvedValue([]);
    mockGetActiveTemporaryContext.mockResolvedValue([]);
    mockSendEmail.mockClear();
    mockRecordInteractionEvent.mockClear();
  });

  it("generates email content and sends via Gmail, then returns confirmation", async () => {
    mockGetValidAccessToken.mockResolvedValueOnce("fake-token");

    // Step 1: Groq decides to call send_email
    mockToolCall("send_email", {
      to: "john@example.com",
      subject: "Running late",
      body: "Hi John, just letting you know I'll be a bit late. See you soon!",
    });
    // Step 2: After tool result, Groq returns confirmation text
    mockChatText("Done! I've emailed John to let him know you'll be late.");

    mockSendEmail.mockResolvedValueOnce({ data: { id: "msg_123" } } as any);
    mockRecordInteractionEvent.mockResolvedValueOnce({ id: "ev-1" } as any);

    const response = await runChatTask(TEST_USER_ID, "Email John and tell him I'll be late");

    expect(mockSendEmail).toHaveBeenCalledTimes(1);
    expect(mockSendEmail).toHaveBeenCalledWith(
      "fake-token",
      "john@example.com",
      expect.any(String),
      expect.stringContaining("late"),
      undefined
    );
    // Tone preference event should be recorded after send
    expect(mockRecordInteractionEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: TEST_USER_ID,
        domain: "communication",
        preference_key: "tone",
        event_type: "suggestion_accepted",
      })
    );
    expect(response).toContain("late");
  });

  it("gracefully handles Gmail tool errors and returns error message to Groq", async () => {
    mockGetValidAccessToken.mockResolvedValueOnce("fake-token");

    mockToolCall("send_email", {
      to: "nobody@example.com",
      subject: "Test",
      body: "Test body",
    });
    mockSendEmail.mockRejectedValueOnce(new Error("Gmail auth failed"));
    mockChatText("Sorry, I couldn't send that email. Gmail reported an error.");

    const response = await runChatTask(TEST_USER_ID, "Send a test email to nobody");
    expect(typeof response).toBe("string");
    // The error was passed to Groq as a tool result — Groq generated a response
  });

  it("skips Gmail tools when no access token available", async () => {
    mockGetValidAccessToken.mockRejectedValueOnce(new Error("no credentials"));
    mockChatText("You need to connect Gmail first before I can send emails.");

    const response = await runChatTask(TEST_USER_ID, "Send an email to john");
    // No tools were offered, so send_email was never called
    expect(mockSendEmail).not.toHaveBeenCalled();
    expect(typeof response).toBe("string");
  });
});
