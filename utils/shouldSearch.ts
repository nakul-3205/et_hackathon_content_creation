// utils/shouldSearch.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("⚠️ GEMINI_API_KEY is missing. shouldSearch will always return false.");
}

const genAI = new GoogleGenerativeAI(apiKey || "");

export async function shouldSearch(query: string): Promise<boolean> {
  if (!apiKey) return false;

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `
Do you need to perform a real-time web search to answer this query accurately? Respond with "yes" or "no" only.  

Respond with "yes" if any of the following are true:
- The question involves current events, trending topics, or recent data.
- The question asks for exact numbers, statistics, or up-to-date information.
- The question requires verifying facts that may have changed recently.
- The question requests you to perform websearch.
- The question is asking to find something over the internet.

Respond with "no" if the answer can be given accurately from general knowledge without searching.

Query: "${query}"
`;

  try {
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        maxOutputTokens: 3,
        temperature: 0,
      },
    });

    const answer = result.response.text().trim().toLowerCase();
    return answer.startsWith("y");
  } catch (err) {
    console.error("shouldSearch error:", err);
    return false;
  }
}
