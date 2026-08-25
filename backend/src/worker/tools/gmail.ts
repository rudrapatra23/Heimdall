import { google } from "googleapis";

function gmailClient(accessToken: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return google.gmail({ version: "v1", auth });
}

export async function listUnreadEmails(accessToken: string, maxResults = 5) {
  const gmail = gmailClient(accessToken);
  const res = await gmail.users.messages.list({
    userId: "me",
    q: "is:unread",
    maxResults,
  });
  const messages = res.data.messages ?? [];
  const full = await Promise.all(
    messages.map((m) =>
      gmail.users.messages.get({
        userId: "me",
        id: m.id!,
        format: "metadata",
        metadataHeaders: ["Subject", "From", "Date"], 
      })
    )
  );
  return full.map((r) => {
    const headers = r.data.payload?.headers ?? [];
    const get = (name: string) => headers.find((h) => h.name === name)?.value ?? "";
    return {
      id: r.data.id,
      subject: get("Subject"),
      from: get("From"),
      date: get("Date"),
      // truncate snippet 
      snippet: (r.data.snippet ?? "").slice(0, 200),
    };
  });
}

export async function getEmailBody(accessToken: string, messageId: string) {
  const gmail = gmailClient(accessToken);
  const res = await gmail.users.messages.get({ userId: "me", id: messageId, format: "full" });

  const plainText = findPart(res.data.payload, "text/plain");
  const htmlText = findPart(res.data.payload, "text/html");

  let body = "";
  if (plainText) {
    body = plainText;
  } else if (htmlText) {
    // crude HTML stripping, it avoids pulling in a full HTML parser
    body = htmlText.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  } else {
    body = res.data.snippet ?? "";
  }

  return body.slice(0, 2000);
}

/** Recursively search a (possibly multipart/nested) Gmail payload for a mime type, base64-decoded. */
function findPart(payload: any, mimeType: string): string | null {
  if (!payload) return null;
  if (payload.mimeType === mimeType && payload.body?.data) {
    return Buffer.from(payload.body.data, "base64").toString("utf-8");
  }
  for (const part of payload.parts ?? []) {
    const found = findPart(part, mimeType);
    if (found) return found;
  }
  return null;
}

export async function sendEmail(
  accessToken: string,
  to: string,
  subject: string,
  body: string,
  threadId?: string
) {
  const gmail = gmailClient(accessToken);
  const raw = Buffer.from(
    `To: ${to}\r\nSubject: ${subject}\r\nContent-Type: text/plain; charset="UTF-8"\r\n\r\n${body}`
  )
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  return gmail.users.messages.send({
    userId: "me",
    requestBody: { raw, threadId },
  });
}
