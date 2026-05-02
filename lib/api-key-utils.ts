import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { decrypt } from "@/lib/crypto";

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
    return decryptedKey;
  } catch (error) {
    console.error("Error decrypting user API key:", error);
    return null;
  }
}
