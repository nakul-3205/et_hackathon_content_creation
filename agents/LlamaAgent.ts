import OpenAI from "openai";
import { llamaPrompt } from "@/prompts/LlamaPrompt";

const client = new OpenAI({
  apiKey: process.env.META_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

export async function llamaAgent(userQuery: string, context: string) {
  try {
    const response = await client.chat.completions.create({
      model: "meta-llama/llama-3.1-405b-instruct:free",
      messages: [
        {
          role: "system",
          content: llamaPrompt(),
        },
        {
          role: "user",
          content: `${userQuery}\n\nContext: ${context}`,
        },
      ],
      temperature: 0.6,
      max_tokens: 800,
    });

    return response.choices[0].message?.content || "No response from LLaMA.";
  } catch (error) {
    console.error("Error in LLaMA Agent:", error);
    return "Error calling LLaMA 3.1 Agent.";
  }
}
