import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { decrypt } from "@/lib/crypto";
import { createLogger } from "@/lib/logger";

const logger = createLogger("api-key-utils");

export async function getUserOpenAIKey(userId: string): Promise<string | null> {
  try {
    const userData = await db.query.user.findFirst({
      where: eq(user.id, userId),
      columns: {
        openaiApiKey: true,
      },
    });

    if (!userData?.openaiApiKey) {
      return null;
    }

    const decryptedKey = decrypt(userData.openaiApiKey);

    if (!decryptedKey || !decryptedKey.startsWith("sk-")) {
      return null;
    }

    return decryptedKey;
  } catch (error) {
    logger.warn("Failed to resolve user OpenAI API key", { error });
    return null;
  }
}
