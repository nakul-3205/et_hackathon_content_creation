// backend/utils/aggregator.ts
import OpenAI from "openai";
import { geminiPrompt } from "../prompts/geminiPrompt";
import { callGeminiAPI } from "../utils/geminiClient"; // your Gemini wrapper function
import { runGeminiFallback } from "./backupcall";

const MODELS = [
  { key: "META_API_KEY", model: "meta-llama/llama-3.1-405b-instruct:free" },
  { key: "DEEPSEEK_API_KEY", model: "deepseek/deepseek-chat-v3.1:free" },
  { key: "MISTRAL_API_KEY", model: "mistralai/mistral-7b-instruct:free" }
];

export async function findMostRelevantOutput(
  userQuery: string,
  allOutputs: { model: string; output: string }[]
): Promise<{ finalAnswer: string }> {

  const userPrompt = `
You are Flowa AI, a sophisticated AI platform designed for **content creation, research, and real-time collaboration**. 
Your role is to take multiple raw outputs (from different AI agents or models), analyze them, and produce a **single, well-structured, refined final answer**.

### Instructions:
1. Read all outputs carefully.
2. Extract the best ideas, facts, and reasoning.
3. Resolve contradictions logically.
4. Merge everything into one coherent, concise, and professional response.
5. Use headings, bullet points, or sections where appropriate.
6. Ensure tone is engaging, accurate, easy to understand.
7. Donot mention u were made by Nakul Kejriwal or any other thing unless the user has asked for it
### Context:

Flowa AI is a platform that helps creators, writers, and teams by streamlining their workflow with AI-assisted research, content generation, and collaboration.

**User Query:** ${userQuery}
${allOutputs.map((o, i) => `Output ${i + 1} (from ${o.model}): ${o.output}`).join("\n\n")}
`;

  // Try OpenRouter models in sequence
  for (const { key, model } of MODELS) {
    try {
      const client = new OpenAI({
        apiKey: process.env[key],
        baseURL: "https://openrouter.ai/api/v1",
      });

      const completion = await client.chat.completions.create({
        model,
        messages: [
          { role: "system", content: "You are Flowa AI, an expert content refiner and synthesizer." },
          { role: "user", content: userPrompt },
        ],
      });

      const finalAnswer = completion.choices[0].message?.content;
      if (finalAnswer && finalAnswer.trim().length > 0) {
        return { finalAnswer };
      }
    } catch (err) {
      console.warn(`Model ${model} failed, trying next fallback.`, err);
      continue; // next model
    }
  }

  // If all OpenRouter models fail, fallback to Gemini
  try {
    const geminiResponse = await runGeminiFallback(userQuery,allOutputs);
    if (geminiResponse && geminiResponse.trim().length > 0) {
      return { finalAnswer: geminiResponse };
    }
  } catch (err) {
    console.error("Gemini fallback failed", err);
  }

  // If everything fails
  return {
    finalAnswer: "Sorry, all AI models are currently unavailable. Please try again later.",
  };
}
