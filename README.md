# 🌊 Flowa AI — Enterprise Content Operations Platform

> **ET AI Hackathon 2026 · Problem Statement 1: AI for Enterprise Content Operations**

An AI agent system that automates the full lifecycle of enterprise content — **creation, compliance review, localization, and multi-channel distribution** — with a human-in-the-loop approval gate before publishing.

---

## ✨ What it does

Flowa AI runs a 4-stage multi-agent pipeline, where each agent has a distinct specialised role:

| Stage | Agent | Role |
|---|---|---|
| 1 — Writer | **DeepSeek** | Drafts content from a brief + optional internal knowledge base |
| 2 — Compliance | **Gemini** | Reviews for brand tone, legal risk, regulatory compliance, sensitivity |
| 3 — Localization | **Mistral** | Culturally adapts content for target market and language |
| 4 — Publisher | **GPT-OSS** | Formats output per channel (Blog, LinkedIn, Twitter/X, Email, Instagram, WhatsApp) |
| ⛳ Gate | Human | Approval required before content is released — full audit trail logged |

---

## 🏗 Architecture

```
User Brief + Knowledge Base
         │
         ▼
┌─────────────────────────────────────┐
│         Safety Layer (existing)     │  ← Prompt moderation, ban system
└─────────────────┬───────────────────┘
                  │
         ┌────────▼────────┐
         │  Writer Agent   │  DeepSeek — drafts content
         └────────┬────────┘
                  │  draft
         ┌────────▼────────────┐
         │  Compliance Agent   │  Gemini — scores 0-100, flags issues, auto-revises
         └────────┬────────────┘
                  │  revised draft
         ┌────────▼──────────────┐
         │  Localization Agent   │  Mistral — market + language adaptation
         └────────┬──────────────┘
                  │  localized content
         ┌────────▼──────────────┐
         │   Publisher Agent     │  GPT-OSS — formats per channel
         └────────┬──────────────┘
                  │
         ┌────────▼──────────────┐
         │  Human Approval Gate  │  ← REQUIRED before publish
         │  Audit trail stored   │  MongoDB · approver · timestamp · notes
         └───────────────────────┘
```

---

## 📁 Project structure

```
flowa-ai/
├── agents/                   # AI model wrappers (unchanged)
├── prompts/
│   ├── writerPrompt.ts       # NEW — content drafting instructions
│   ├── compliancePrompt.ts   # NEW — brand/legal/regulatory review
│   ├── localizationPrompt.ts # NEW — market + language adaptation
│   └── publisherPrompt.ts    # NEW — per-channel formatting
├── lib/
│   ├── contentPipeline.ts    # NEW — 4-stage orchestration engine
│   └── aggregator.ts         # Original — kept for general chat
├── models/
│   ├── ContentJob.ts         # NEW — persists pipeline results + audit trail
│   └── Chat.ts               # Original — kept for chat history
├── app/
│   ├── api/
│   │   ├── content/          # NEW — POST to run pipeline
│   │   │   └── approve/      # NEW — POST to approve/reject
│   │   └── query/            # Original — general chat endpoint
│   └── (frontend)/
│       ├── content/          # NEW — full pipeline UI
│       └── chat/             # Original — multi-model chat
```

---

## 🔄 Pipeline flow

1. User submits a content brief — specifies content type, target market, language, channels, and optional internal knowledge base data.
2. Safety layer checks for malicious content. Flagged briefs are blocked and logged.
3. **Stage 1 — Writer (DeepSeek)** drafts content using the brief + any injected knowledge base.
4. **Stage 2 — Compliance (Gemini)** scores the draft 0–100, flags HIGH/MEDIUM/LOW issues across Brand, Legal, Regulatory, and Sensitivity. Auto-generates a revised draft.
5. **Stage 3 — Localization (Mistral)** culturally adapts the compliant draft for the target market and language.
6. **Stage 4 — Publisher (GPT-OSS)** formats the final content for each selected channel with appropriate length, tone, and posting time suggestions.
7. **Human approval gate** — reviewer sees all stages, compliance score, and channel outputs. Approve or reject with a note. Decision is logged with actor identity and timestamp.

---

## ⚙️ Getting started

```bash
git clone https://github.com/your-username/flowa-ai.git
cd flowa-ai
npm install
cp env.sample .env.local   # fill in all values
npx prisma migrate dev
npm run dev
```

- Pipeline UI: http://localhost:3000/content
- Original chat: http://localhost:3000/chat

---

## 📊 Impact model

| Metric | Manual | Flowa AI | Reduction |
|---|---|---|---|
| Brief → draft | 4–8 hrs | ~30 sec | ~99% |
| Compliance review | 2–4 hrs | ~15 sec | ~99% |
| Localization | 1–3 days | ~20 sec | ~99% |
| Channel formatting | 1–2 hrs/channel | ~20 sec | ~98% |
| **Full cycle time** | **2–5 days** | **~90 sec + human review** | **~98%** |

Assumptions: 10-person team, 20 jobs/week, $50/hr avg.
→ Estimated **$15,000–$40,000/month** in labor cost reduction per team.

---

## 🔒 Compliance guardrails

- Input moderation on all briefs (existing system)
- Brand governance — Gemini scores outgoing content before it reaches humans
- Legal risk detection — flags unsubstantiated claims, superlatives, competitor mentions
- Regulatory awareness — GDPR, SEBI, FMCG advertising standards
- Human-in-the-loop — no content is ever auto-published
- Full audit trail — every decision stored with actor identity and timestamp

---

## 🛠 Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4, shadcn/ui |
| Auth | Clerk |
| Primary DB | MongoDB (Mongoose) |
| Secondary DB | PostgreSQL (Prisma) |
| Cache / Queue | Redis (Upstash), BullMQ |
| AI — Writer | DeepSeek (via OpenRouter) |
| AI — Compliance | Gemini 2.0 Flash |
| AI — Localization | Mistral |
| AI — Publisher | GPT-OSS (via OpenRouter) |
| Web Search | Tavily API |
| Deployment | Docker, Render |
# et_hackathon_content_creation
