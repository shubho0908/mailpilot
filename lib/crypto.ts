import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const TAG_POSITION = SALT_LENGTH + IV_LENGTH;
const ENCRYPTED_POSITION = TAG_POSITION + TAG_LENGTH;

function getEncryptionKey(): Buffer {
  const key = process.env.API_KEY_ENCRYPTION_KEY;
  if (!key) {
    throw new Error(
      "API_KEY_ENCRYPTION_KEY environment variable is not set. " +
        "Please generate a key by running: bun scripts/generate-encryption-key.ts"
    );
  }

  if (!/^[a-f0-9]{64}$/i.test(key)) {
    throw new Error(
      "API_KEY_ENCRYPTION_KEY must be a 64-character hex string. " +
        "Please generate a valid key by running: bun scripts/generate-encryption-key.ts"
    );
  }

  return Buffer.from(key, "hex");
}

export function encrypt(plaintext: string): string {
  if (!plaintext || plaintext.length === 0) {
    throw new Error("Cannot encrypt empty plaintext");
  }

  const key = getEncryptionKey();
  const salt = crypto.randomBytes(SALT_LENGTH);
  const iv = crypto.randomBytes(IV_LENGTH);

  const derivedKey = crypto.pbkdf2Sync(key, salt, 100000, KEY_LENGTH, "sha256");

  const cipher = crypto.createCipheriv(ALGORITHM, derivedKey, iv);

  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");

  const tag = cipher.getAuthTag();

  const combined = Buffer.concat([salt, iv, tag, Buffer.from(encrypted, "hex")]);

  return combined.toString("hex");
}

export function decrypt(encryptedHex: string): string {
  if (!encryptedHex || encryptedHex.length === 0) {
    throw new Error("Cannot decrypt empty encrypted payload");
  }

  const key = getEncryptionKey();
  const minimumHexLength = (SALT_LENGTH + IV_LENGTH + TAG_LENGTH) * 2;

  if (!/^[a-f0-9]+$/i.test(encryptedHex) || encryptedHex.length < minimumHexLength) {
    throw new Error("Invalid encrypted API key payload");
  }

  const combined = Buffer.from(encryptedHex, "hex");

  const salt = combined.subarray(0, SALT_LENGTH);
  const iv = combined.subarray(SALT_LENGTH, TAG_POSITION);
  const tag = combined.subarray(TAG_POSITION, ENCRYPTED_POSITION);
  const encrypted = combined.subarray(ENCRYPTED_POSITION);

  const derivedKey = crypto.pbkdf2Sync(key, salt, 100000, KEY_LENGTH, "sha256");

  const decipher = crypto.createDecipheriv(ALGORITHM, derivedKey, iv);
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(encrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  const plaintext = decrypted.toString("utf8");

  if (!plaintext || plaintext.length === 0) {
    throw new Error("Decryption resulted in empty plaintext");
  }

  return plaintext;
}
