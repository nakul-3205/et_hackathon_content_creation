    // src/lib/websearch.ts

    import fetch from "node-fetch";

    const TAVILY_API_KEY = process.env.TAVILY_API_KEY as string;
    const TAVILY_ENDPOINT = "https://api.tavily.com/search";

    /**
     * Perform a web search using Tavily API
     * @param query User's search query
     * @param maxResults Number of results to fetch
     */
    export async function webSearch(query: string, maxResults: number = 5) {
    if (!TAVILY_API_KEY) {
        throw new Error("Missing Tavily API key. Set TAVILY_API_KEY in .env");
    }
console.log('tavily hit')
    try {
        const response = await fetch(TAVILY_ENDPOINT, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${TAVILY_API_KEY}`,
        },
        body: JSON.stringify({
            query,
            num_results: maxResults,
        }),
        });

        if (!response.ok) {
        throw new Error(`Tavily API error: ${response.statusText}`);
        }

        const data = await response.json();
        console.log(data)

        // Simplify and return relevant info
        return data.results.map((r) => ({
        title: r.title,
        url: r.url,
        snippet: r.snippet,
        ref:'WebSearch was used and here is the result of websearch'
        }));
    } catch (error) {
        console.error("Web search failed:", error);
        return [];
    }
    }
