// backend/agents/IAgent.ts
export interface IAgent {
    generate(prompt: string): Promise<string>;
}
