import { OgImage, size, contentType } from "./lib/og-image";

export const runtime = "nodejs";

export const alt = "MailPilot - AI-Powered Email Assistant: Control Gmail with natural language";

export { size, contentType };

export default async function Image() {
  return OgImage();
}
