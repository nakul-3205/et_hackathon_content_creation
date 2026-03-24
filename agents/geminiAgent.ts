// backend/agents/geminiAgent.ts

import { GoogleGenerativeAI } from "@google/generative-ai";
import { geminiPrompt } from "@/prompts/geminiprompt";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  
});


export async function streamGeminiResponse(
  userPrompt: string,
  context: string = ""
): Promise<string> {
  try {
    
    const finalPrompt = geminiPrompt(userPrompt, context);

    const stream = await model.generateContentStream({
      contents: [
        {
          role: "user",
          parts: [{ text: finalPrompt }],
        },
      ],
    });

    let finalText = "";
    for await (const chunk of stream.stream) {
      finalText += chunk.text();
    }

    return finalText || "No response from Gemini";
  } catch (err) {
    console.error("GeminiAgent error:", err);
    return "Error: Failed to get response from Gemini.";
  }
}
