// lib/logFlaggedPrompt.ts
import { checkAndBanUser } from './ban';
import {prisma} from './prisma'

interface FlaggedPromptData {
userId: string;      // From Clerk
firstName: string;   // From Clerk
lastName: string;    // From Clerk
email: string;       // From Clerk
prompt: string;      // The flagged prompt text
}

export async function logFlaggedPrompt(data: FlaggedPromptData) {
try {

const result = await prisma.flaggedPrompt.create({
    data: {
    userId: data.userId,
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    prompt: data.prompt,
    },
});

console.log("Flagged prompt logged successfully:", result.id);
const banResult = await checkAndBanUser({
    userId: data.userId,
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
  });

  return {
    flaggedPrompt: result,
    banStatus: banResult, 
  };
// return result;
} catch (error) {
console.error("Error logging flagged prompt:", error);
throw new Error("Failed to log flagged prompt to Neon");
}
}
