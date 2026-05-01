import type { gmail_v1 } from "googleapis";
import type {
  GmailFilter,
  SendEmailPayload,
  Attachment,
  EmailAddress,
  EmailBody,
} from "./gmail.types";

function quoteQueryValue(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";

  if (/^[\w./@+-]+$/.test(trimmed)) {
    return trimmed;
  }

  return `"${trimmed.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function sanitizeHeaderValue(value: string): string {
  return value.replace(/[\r\n]+/g, " ").trim();
}

function encodeHeaderValue(value: string): string {
  const sanitized = sanitizeHeaderValue(value);

  if (/^[\x00-\x7F]*$/.test(sanitized)) {
    return sanitized;
  }

  return `=?UTF-8?B?${Buffer.from(sanitized, "utf8").toString("base64")}?=`;
}

function encodeAddress(address: string): string {
  return sanitizeHeaderValue(address);
}

function decodeBase64Url(data: string): string {
  return Buffer.from(data, "base64url").toString("utf-8");
}

function encodeBase64(data: string): string {
  return Buffer.from(data, "utf8")
    .toString("base64")
    .replace(/(.{76})/g, "$1\r\n");
}

function normalizeAttachmentContent(content: string, encoding: "base64" | "raw" = "raw"): string {
  const base64Content =
    encoding === "base64"
      ? content.replace(/\s/g, "")
      : Buffer.from(content, "utf8").toString("base64");

  return base64Content.replace(/(.{76})/g, "$1\r\n");
}

export function buildGmailQuery(filters: GmailFilter): string {
  const parts: string[] = [];

  if (filters.label) {
    parts.push(`label:${filters.label.toLowerCase()}`);
  }
  if (filters.from) {
    parts.push(`from:${quoteQueryValue(filters.from)}`);
  }
  if (filters.to) {
    parts.push(`to:${quoteQueryValue(filters.to)}`);
  }
  if (filters.subject) {
    parts.push(`subject:${quoteQueryValue(filters.subject)}`);
  }
  if (filters.after) {
    parts.push(`after:${quoteQueryValue(filters.after)}`);
  }
  if (filters.before) {
    parts.push(`before:${quoteQueryValue(filters.before)}`);
  }
  if (filters.unread !== undefined) {
    parts.push(filters.unread ? "is:unread" : "is:read");
  }
  if (filters.starred !== undefined) {
    parts.push(filters.starred ? "is:starred" : "-is:starred");
  }
  if (filters.hasAttachment === true) {
    parts.push("has:attachment");
  }
  if (filters.query) {
    parts.push(filters.query.trim());
  }

  return parts.filter(Boolean).join(" ");
}

export function parseEmailHeaders(headers: gmail_v1.Schema$MessagePartHeader[] | undefined) {
  const result: Record<string, string> = {};

  if (!headers) return result;

  for (const header of headers) {
    if (header.name && header.value) {
      result[header.name.toLowerCase()] = header.value;
    }
  }

  return result;
}

export function extractEmailAddress(headerValue: string): EmailAddress {
  const value = headerValue.trim();
  const match = value.match(/^(?:"?([^"<]*)"?\s*)?<([^<>@\s]+@[^<>\s]+)>$/);

  if (match) {
    const name = match[1]?.trim() || "";
    const email = match[2].trim();
    return { name, email };
  }

  const bareEmailMatch = value.match(/([^<>,\s]+@[^<>,\s]+)/);
  if (bareEmailMatch) {
    return { name: "", email: bareEmailMatch[1].trim() };
  }

  return { name: "", email: value };
}

export function extractEmailAddresses(headerValue: string): EmailAddress[] {
  const addresses: string[] = [];
  let current = "";
  let inQuotes = false;
  let angleDepth = 0;

  for (const char of headerValue) {
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (!inQuotes && char === "<") {
      angleDepth += 1;
    } else if (!inQuotes && char === ">") {
      angleDepth = Math.max(0, angleDepth - 1);
    }

    if (char === "," && !inQuotes && angleDepth === 0) {
      if (current.trim()) addresses.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  if (current.trim()) {
    addresses.push(current.trim());
  }

  return addresses.map(extractEmailAddress);
}

export function extractEmailBody(payload: gmail_v1.Schema$MessagePart): EmailBody {
  let text = "";
  let html = "";

  if (payload.body?.data) {
    const data = decodeBase64Url(payload.body.data);

    if (payload.mimeType === "text/html") {
      html = data;
    } else if (payload.mimeType === "text/plain" || !payload.mimeType) {
      text = data;
    }
  }

  if (payload.parts) {
    for (const part of payload.parts) {
      const result = extractEmailBody(part);
      text += result.text;
      html += result.html;
    }
  }

  return { text, html };
}

export function extractAttachments(payload: gmail_v1.Schema$MessagePart): Attachment[] {
  const attachments: Attachment[] = [];

  function extractFromPart(part: gmail_v1.Schema$MessagePart) {
    if (part.filename && part.body?.attachmentId) {
      attachments.push({
        id: part.body.attachmentId,
        filename: part.filename,
        mimeType: part.mimeType || "application/octet-stream",
        size: part.body.size || 0,
      } satisfies Attachment);
    }

    if (part.parts) {
      for (const subPart of part.parts) {
        extractFromPart(subPart);
      }
    }
  }

  extractFromPart(payload);
  return attachments;
}

export function createMimeMessage(payload: SendEmailPayload): string {
  const lines: string[] = [];
  lines.push(`To: ${payload.to.map(encodeAddress).join(", ")}`);
  if (payload.cc && payload.cc.length > 0) {
    lines.push(`Cc: ${payload.cc.map(encodeAddress).join(", ")}`);
  }
  if (payload.bcc && payload.bcc.length > 0) {
    lines.push(`Bcc: ${payload.bcc.map(encodeAddress).join(", ")}`);
  }
  lines.push(`Subject: ${encodeHeaderValue(payload.subject)}`);
  if (payload.inReplyTo) {
    lines.push(`In-Reply-To: ${sanitizeHeaderValue(payload.inReplyTo)}`);
  }
  if (payload.references && payload.references.length > 0) {
    lines.push(`References: ${payload.references.map(sanitizeHeaderValue).join(" ")}`);
  }
  lines.push("MIME-Version: 1.0");

  if (payload.attachments && payload.attachments.length > 0) {
    const boundary = `mixed_${crypto.randomUUID()}`;
    lines.push(`Content-Type: multipart/mixed; boundary="${boundary}"`);
    lines.push("");
    lines.push(`--${boundary}`);
    appendBodyPart(lines, payload);
    lines.push("");

    for (const attachment of payload.attachments) {
      lines.push(`--${boundary}`);
      lines.push(
        `Content-Type: ${attachment.mimeType || "application/octet-stream"}; name="${encodeHeaderValue(attachment.filename)}"`
      );
      lines.push("Content-Transfer-Encoding: base64");
      lines.push(
        `Content-Disposition: attachment; filename="${encodeHeaderValue(attachment.filename)}"`
      );
      lines.push("");
      lines.push(
        normalizeAttachmentContent(attachment.content, attachment.contentTransferEncoding)
      );
      lines.push("");
    }

    lines.push(`--${boundary}--`);
  } else {
    appendBodyPart(lines, payload);
  }

  return lines.join("\r\n");
}

function appendBodyPart(lines: string[], payload: SendEmailPayload): void {
  if (payload.htmlBody) {
    const boundary = `alternative_${crypto.randomUUID()}`;
    lines.push(`Content-Type: multipart/alternative; boundary="${boundary}"`);
    lines.push("");
    lines.push(`--${boundary}`);
    lines.push("Content-Type: text/plain; charset=utf-8");
    lines.push("Content-Transfer-Encoding: base64");
    lines.push("");
    lines.push(encodeBase64(payload.body));
    lines.push("");
    lines.push(`--${boundary}`);
    lines.push("Content-Type: text/html; charset=utf-8");
    lines.push("Content-Transfer-Encoding: base64");
    lines.push("");
    lines.push(encodeBase64(payload.htmlBody));
    lines.push("");
    lines.push(`--${boundary}--`);
    return;
  }

  lines.push("Content-Type: text/plain; charset=utf-8");
  lines.push("Content-Transfer-Encoding: base64");
  lines.push("");
  lines.push(encodeBase64(payload.body));
}
