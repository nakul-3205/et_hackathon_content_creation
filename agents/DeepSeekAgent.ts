import { deepSeekPrompt } from "@/prompts/deepSeekPrompt";

const DEEPSEEK_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const API_KEY = process.env.DEEPSEEK_API_KEY || "";

export async function deepSeekAgent(
  userInput: string,
  context: string = ""
): Promise<string> {
  try {
    const prompt = deepSeekPrompt();

    const messages = [
      { role: "system", content: prompt },
      ...(context ? [{ role: "system", content: `Context: ${context}` }] : []),
      { role: "user", content: userInput }
    ];

    const payload = {
      model: "deepseek/deepseek-chat-v3.1:free",
      messages,
      max_tokens: 1024,
      temperature: 0.7
    };

    const response = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
        "HTTP-Referer": process.env.SITE_URL || "",
        "X-Title": process.env.SITE_NAME || ""
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("DeepSeek API error response:", text);
      throw new Error(`DeepSeek API error: ${response.statusText}`);
    }

    const data = await response.json();

    const messageContent: string =
      data?.choices?.[0]?.message?.content || "No response from DeepSeek";

    return messageContent;
  } catch (err) {
    console.error("DeepSeekAgent error:", err);
    return "Error: Failed to get response from DeepSeek.";
  }
}
