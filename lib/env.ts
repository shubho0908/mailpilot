import crypto from "crypto";

export function requireEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
}

export function generateEncryptionKey(): string {
  const key = crypto.randomBytes(32);
  return key.toString("hex");
}
