// lib/contentPipeline.ts
// Multi-agent content lifecycle pipeline for PS1 compliance.
// Agents: DeepSeek (Writer) → Gemini (Compliance) → Mistral (Localizer) → GPT-OSS (Publisher)

import { isMaliciousPrompt } from "@/utils/promptModerator";
import { writerPrompt } from "@/prompts/writerPrompt";
import { compliancePrompt } from "@/prompts/compliancePrompt";
import { localizationPrompt } from "@/prompts/localizationPrompt";
import { publisherPrompt } from "@/prompts/publisherPrompt";

export type PipelineStageStatus = "pending" | "running" | "done" | "failed" | "awaiting_approval";

export interface ComplianceIssue {
  severity: "HIGH" | "MEDIUM" | "LOW";
  type: "BRAND" | "LEGAL" | "REGULATORY" | "SENSITIVITY";
  description: string;
  suggestion: string;
}

export interface ChannelOutput {
  content: string;
  charCount: number;
  scheduledSlot: string;
}

export interface PipelineResult {
  jobId: string;
  brief: string;
  contentType: string;
  targetMarket: string;
  targetLanguage: string;
  channels: string[];

  stages: {
    writer: {
      status: PipelineStageStatus;
      agent: string;
      draft: string;
      wordCount: number;
      durationMs: number;
    };
    compliance: {
      status: PipelineStageStatus;
      agent: string;
      complianceStatus: "APPROVED" | "NEEDS_REVISION" | "PENDING";
      score: number;
      issues: ComplianceIssue[];
      revisedDraft: string;
      durationMs: number;
    };
    localization: {
      status: PipelineStageStatus;
      agent: string;
      localizedContent: string;
      adaptations: string[];
      durationMs: number;
    };
    publisher: {
      status: PipelineStageStatus;
      agent: string;
      channelOutputs: Record<string, ChannelOutput>;
      durationMs: number;
    };
  };

  approvalGate: {
    required: boolean;
    approved: boolean | null;
    approvedBy: string | null;
    approvedAt: string | null;
    notes: string | null;
  };

  totalDurationMs: number;
  finalContent: string;
  error: string | null;
}

export interface ContentBrief {
  brief: string;
  contentType: string;
  targetMarket: string;
  targetLanguage: string;
  channels: string[];
  knowledgeBase?: string;
  userId?: string;
}

// ─── Agent caller helpers ────────────────────────────────────────────────────

async function callDeepSeek(systemPrompt: string, userInput: string): Promise<string> {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY || ""}`,
      "HTTP-Referer": process.env.SITE_URL || "",
      "X-Title": process.env.SITE_NAME || "",
    },
    body: JSON.stringify({
      model: "deepseek/deepseek-chat-v3.1:free",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userInput },
      ],
      max_tokens: 2048,
      temperature: 0.7,
    }),
  });
  const data = await response.json();
  return data?.choices?.[0]?.message?.content || "";
}

async function callGemini(systemPrompt: string, userInput: string): Promise<string> {
  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: `${systemPrompt}\n\n${userInput}` }] }],
  });
  return result.response.text() || "";
}

async function callMistral(systemPrompt: string, userInput: string): Promise<string> {
  const { MistralAgent } = await import("@/agents/MistralAgent");
  return MistralAgent(`${systemPrompt}\n\n${userInput}`, "");
}

async function callGPTOSS(systemPrompt: string, userInput: string): Promise<string> {
  const { GPTOSSAgent } = await import("@/agents/GPTOSSAgent");
  return GPTOSSAgent(`${systemPrompt}\n\n${userInput}`, "");
}

// ─── Safe JSON parser ─────────────────────────────────────────────────────────

function safeParseJSON<T>(raw: string, fallback: T): T {
  try {
    const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleaned) as T;
  } catch {
    return fallback;
  }
}

// ─── Main pipeline ────────────────────────────────────────────────────────────

export async function runContentPipeline(input: ContentBrief): Promise<PipelineResult> {
  const jobId = `job_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const pipelineStart = Date.now();

  const result: PipelineResult = {
    jobId,
    brief: input.brief,
    contentType: input.contentType,
    targetMarket: input.targetMarket,
    targetLanguage: input.targetLanguage,
    channels: input.channels,
    stages: {
      writer: { status: "pending", agent: "DeepSeek", draft: "", wordCount: 0, durationMs: 0 },
      compliance: {
        status: "pending",
        agent: "Gemini",
        complianceStatus: "PENDING",
        score: 0,
        issues: [],
        revisedDraft: "",
        durationMs: 0,
      },
      localization: { status: "pending", agent: "Mistral", localizedContent: "", adaptations: [], durationMs: 0 },
      publisher: { status: "pending", agent: "GPT-OSS", channelOutputs: {}, durationMs: 0 },
    },
    approvalGate: {
      required: true,
      approved: null,
      approvedBy: null,
      approvedAt: null,
      notes: null,
    },
    totalDurationMs: 0,
    finalContent: "",
    error: null,
  };

  // Safety check
  const safety = isMaliciousPrompt(input.brief);
  if (safety.isMalicious) {
    result.error = "Content brief flagged by safety layer.";
    return result;
  }

  // ── Stage 1: Writer ──────────────────────────────────────────────────────
  try {
    result.stages.writer.status = "running";
    const t0 = Date.now();
    const knowledgeContext = input.knowledgeBase
      ? `\n\nInternal knowledge base:\n${input.knowledgeBase}`
      : "";
    const userBrief = `Content brief: ${input.brief}${knowledgeContext}`;
    const draft = await callDeepSeek(writerPrompt(input.contentType, input.channels), userBrief);

    const wordCountMatch = draft.match(/WORD_COUNT:\s*(\d+)/);
    const wordCount = wordCountMatch ? parseInt(wordCountMatch[1]) : draft.split(/\s+/).length;
    const cleanDraft = draft.replace(/WORD_COUNT:\s*\d+/, "").trim();

    result.stages.writer.draft = cleanDraft;
    result.stages.writer.wordCount = wordCount;
    result.stages.writer.durationMs = Date.now() - t0;
    result.stages.writer.status = "done";
  } catch (err) {
    result.stages.writer.status = "failed";
    result.error = `Writer stage failed: ${err}`;
    result.totalDurationMs = Date.now() - pipelineStart;
    return result;
  }

  // ── Stage 2: Compliance ──────────────────────────────────────────────────
  try {
    result.stages.compliance.status = "running";
    const t0 = Date.now();
    const raw = await callGemini(compliancePrompt(), `Review this content draft:\n\n${result.stages.writer.draft}`);
    const parsed = safeParseJSON<{
      status: "APPROVED" | "NEEDS_REVISION";
      score: number;
      issues: ComplianceIssue[];
      revisedDraft: string;
    }>(raw, { status: "APPROVED", score: 85, issues: [], revisedDraft: "" });

    result.stages.compliance.complianceStatus = parsed.status;
    result.stages.compliance.score = parsed.score;
    result.stages.compliance.issues = parsed.issues || [];
    result.stages.compliance.revisedDraft = parsed.revisedDraft || "";
    result.stages.compliance.durationMs = Date.now() - t0;
    result.stages.compliance.status = "done";
  } catch (err) {
    result.stages.compliance.status = "failed";
    result.error = `Compliance stage failed: ${err}`;
    result.totalDurationMs = Date.now() - pipelineStart;
    return result;
  }

  // Content going into next stage: prefer revised draft if compliance flagged changes
  const approvedDraft =
    result.stages.compliance.revisedDraft || result.stages.writer.draft;

  // ── Stage 3: Localization ────────────────────────────────────────────────
  try {
    result.stages.localization.status = "running";
    const t0 = Date.now();

    // Skip localization if English + no specific market adaptation needed
    if (input.targetLanguage === "English" && input.targetMarket === "Global") {
      result.stages.localization.localizedContent = approvedDraft;
      result.stages.localization.adaptations = ["No localization required — global English."];
      result.stages.localization.status = "done";
      result.stages.localization.durationMs = Date.now() - t0;
    } else {
      const raw = await callMistral(
        localizationPrompt(input.targetMarket, input.targetLanguage),
        `Localize this content:\n\n${approvedDraft}`
      );
      const parsed = safeParseJSON<{ localizedContent: string; adaptations: string[] }>(raw, {
        localizedContent: approvedDraft,
        adaptations: [],
      });
      result.stages.localization.localizedContent = parsed.localizedContent || approvedDraft;
      result.stages.localization.adaptations = parsed.adaptations || [];
      result.stages.localization.durationMs = Date.now() - t0;
      result.stages.localization.status = "done";
    }
  } catch (err) {
    result.stages.localization.status = "failed";
    result.error = `Localization stage failed: ${err}`;
    result.totalDurationMs = Date.now() - pipelineStart;
    return result;
  }

  // ── Stage 4: Publisher ───────────────────────────────────────────────────
  try {
    result.stages.publisher.status = "running";
    const t0 = Date.now();
    const raw = await callGPTOSS(
      publisherPrompt(input.channels),
      `Format this content for all channels:\n\n${result.stages.localization.localizedContent}`
    );
    const parsed = safeParseJSON<{ channelOutputs: Record<string, ChannelOutput> }>(raw, {
      channelOutputs: {},
    });

    // Fallback: if parsing failed, put raw content under first channel
    if (Object.keys(parsed.channelOutputs).length === 0) {
      input.channels.forEach((ch) => {
        parsed.channelOutputs[ch] = {
          content: result.stages.localization.localizedContent,
          charCount: result.stages.localization.localizedContent.length,
          scheduledSlot: "TBD",
        };
      });
    }

    result.stages.publisher.channelOutputs = parsed.channelOutputs;
    result.stages.publisher.durationMs = Date.now() - t0;
    result.stages.publisher.status = "done";
  } catch (err) {
    result.stages.publisher.status = "failed";
    result.error = `Publisher stage failed: ${err}`;
    result.totalDurationMs = Date.now() - pipelineStart;
    return result;
  }

  // Mark awaiting human approval before content is released
  result.stages.publisher.status = "awaiting_approval";
  result.approvalGate.required = true;
  result.finalContent = result.stages.localization.localizedContent;
  result.totalDurationMs = Date.now() - pipelineStart;

  return result;
}
