    import { gptOSSPrompt } from "@/prompts/gptOSSPrompts";

    const GPT_OSS_API_URL = "https://openrouter.ai/api/v1/chat/completions";
    const API_KEY = process.env.GPT_API_KEY || "";

    export async function GPTOSSAgent(
    userInput: string,
    context: string = ""
    ): Promise<string> {
    try {
        const prompt = gptOSSPrompt();

        const messages = [
        { role: "system", content: prompt },
        ...(context ? [{ role: "system", content: `Context: ${context}` }] : []),
        { role: "user", content: userInput }
        ];

        const payload = {
        model: "qwen/qwen3-235b-a22b:free",
        messages,
        max_tokens: 1024,
        temperature: 0.7
        };

        const response = await fetch(GPT_OSS_API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${API_KEY}`
        },
        body: JSON.stringify(payload)
        });

        if (!response.ok) {
        const text = await response.text();
        console.error("GPT-OSS API error response:", text);
        throw new Error(`GPT-OSS API error: ${response.statusText}`);
        }

        const data = await response.json();

        const messageContent =
        data?.choices?.[0]?.message?.content || "No response from Qwen";

        return messageContent;
    } catch (err) {
        console.error("Qwen error:", err);
        return "Error: Failed to get response from GPT-OSS.";
    }
    }
