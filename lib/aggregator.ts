import { isMaliciousPrompt } from "@/utils/promptModerator";
import { logFlaggedPrompt } from "./logFlaggedPrompt";
import { FLAG_WARNING_MESSAGE } from "./WarningMessage";


// /backend/lib/aggregator.ts
type AgentResponse = {
  model: string;
  output: string;
};

export async function aggregateResponse(
  userQuery: string,
  context: string = "",
  user?: { userId: string; firstName: string; lastName: string; email: string }
): Promise<{
  finalAnswer: string;

}> {
  let enrichedQuery = userQuery;

  try {
    const isMalicious=isMaliciousPrompt(enrichedQuery)
    if(isMalicious.isMalicious==true){
      console.warn('malicious prompt detected',enrichedQuery)
      if(user){
      await logFlaggedPrompt({
        userId: user?.userId,
        firstName: user?.firstName,
        lastName: user?.lastName,
        email: user?.email,
        prompt: enrichedQuery
      })}
      const warning=FLAG_WARNING_MESSAGE
      return {finalAnswer: warning}
    }

    // Lazy import utilities
    const { shouldSearch } = await import("@/utils/shouldSearch");
    const { webSearch } = await import("./webSearch");
    const { findMostRelevantOutput } = await import("@/utils/similarity")

    // Lazy import agents
    const { deepSeekAgent } = await import("@/agents/DeepSeekAgent");
    const { streamGeminiResponse } = await import("@/agents/geminiAgent");
    const { GPTOSSAgent } = await import("@/agents/GPTOSSAgent");
    const { llamaAgent } = await import("@/agents/LlamaAgent");
    const { MistralAgent } = await import("@/agents/MistralAgent");

    // Step 1: Decide if web search is needed
    const needsSearch = await shouldSearch(userQuery);
    if (needsSearch) {
      const searchResults = await webSearch(userQuery);
      enrichedQuery = `
User Query: ${userQuery}

Web Search Results:
${JSON.stringify(searchResults, null, 2)}
`;
    }

    // Step 2: Call all agents in parallel
    const [deepSeek, gptOSS, mistral, llama, gemini] = await Promise.allSettled([
      deepSeekAgent(enrichedQuery, context),
      GPTOSSAgent(enrichedQuery, context),
      MistralAgent(enrichedQuery, context),
      llamaAgent(enrichedQuery, context),
      streamGeminiResponse(enrichedQuery, context),
    ]);

    // Step 3: Normalize results
    const allOutputs: AgentResponse[] = [
      { model: "DeepSeek", output: deepSeek.status === "fulfilled" ? deepSeek.value : "" },
      { model: "GPT-OSS", output: gptOSS.status === "fulfilled" ? gptOSS.value : "" },
      { model: "Mistral", output: mistral.status === "fulfilled" ? mistral.value : "" },
      { model: "LLaMA", output: llama.status === "fulfilled" ? llama.value : "" },
      { model: "Gemini", output: gemini.status === "fulfilled" ? gemini.value : "" },
    ].filter(item => item.output && item.output.trim() !== "");

    if (allOutputs.length === 0) {
      throw new Error("All agents failed to return a response.");
    }
    console.log(allOutputs)

    // Step 4: Pick best output
    const bestOutput = await findMostRelevantOutput(userQuery, allOutputs);

    return {
      finalAnswer: bestOutput.finalAnswer.toString(),
      
    };
  } catch (err) {
    console.error("Aggregator error:", err);
    return {
      finalAnswer: "Sorry, something went wrong while processing your query.",
      
    };
  }
}
