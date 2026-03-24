'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, XCircle, Clock, AlertTriangle, ChevronDown, ChevronRight, Bot, Shield, Globe, Send, ThumbsUp, ThumbsDown, Copy, RotateCcw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

// ── Types ────────────────────────────────────────────────────────────────────

interface ComplianceIssue {
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  type: 'BRAND' | 'LEGAL' | 'REGULATORY' | 'SENSITIVITY';
  description: string;
  suggestion: string;
}

interface ChannelOutput {
  content: string;
  charCount: number;
  scheduledSlot: string;
}

interface PipelineResult {
  jobId: string;
  stages: {
    writer: { status: string; agent: string; draft: string; wordCount: number; durationMs: number };
    compliance: { status: string; agent: string; complianceStatus: string; score: number; issues: ComplianceIssue[]; revisedDraft: string; durationMs: number };
    localization: { status: string; agent: string; localizedContent: string; adaptations: string[]; durationMs: number };
    publisher: { status: string; agent: string; channelOutputs: Record<string, ChannelOutput>; durationMs: number };
  };
  approvalGate: { required: boolean; approved: boolean | null; approvedBy: string | null; approvedAt: string | null; notes: string | null };
  totalDurationMs: number;
  error: string | null;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const CONTENT_TYPES = ['Blog Post', 'Social Media Campaign', 'Email Newsletter', 'Press Release', 'Product Description', 'Sales Collateral', 'Case Study', 'Video Script'];
const CHANNELS = ['Blog', 'LinkedIn', 'Twitter/X', 'Email', 'Instagram', 'WhatsApp'];
const MARKETS = ['Global', 'India', 'USA', 'UK', 'Southeast Asia', 'Middle East', 'Europe'];
const LANGUAGES = ['English', 'Hindi', 'Tamil', 'Bengali', 'Arabic', 'Spanish', 'French', 'German'];

// ── Sub-components ────────────────────────────────────────────────────────────

function StageCard({
  label, icon, agent, status, durationMs, children,
}: {
  label: string; icon: React.ReactNode; agent: string; status: string;
  durationMs?: number; children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  const statusIcon = () => {
    if (status === 'done') return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    if (status === 'running') return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
    if (status === 'failed') return <XCircle className="w-4 h-4 text-red-500" />;
    if (status === 'awaiting_approval') return <Clock className="w-4 h-4 text-amber-500" />;
    return <div className="w-4 h-4 rounded-full border-2 border-gray-300" />;
  };

  const statusColor = () => {
    if (status === 'done') return 'border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900';
    if (status === 'running') return 'border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-900';
    if (status === 'failed') return 'border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900';
    if (status === 'awaiting_approval') return 'border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900';
    return 'border-gray-200 bg-gray-50 dark:bg-gray-900/20 dark:border-gray-800';
  };

  return (
    <div className={`rounded-xl border ${statusColor()} transition-all`}>
      <div
        className="flex items-center gap-3 p-4 cursor-pointer select-none"
        onClick={() => children && setOpen(!open)}
      >
        <div className="text-gray-600 dark:text-gray-400">{icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{label}</span>
            <span className="text-xs text-gray-500 bg-gray-200 dark:bg-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full">{agent}</span>
          </div>
          {durationMs ? (
            <p className="text-xs text-gray-500 mt-0.5">{(durationMs / 1000).toFixed(1)}s</p>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          {statusIcon()}
          {children && (status === 'done' || status === 'awaiting_approval') && (
            open ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </div>
      {open && children && (
        <div className="border-t border-inherit px-4 pb-4 pt-3">
          {children}
        </div>
      )}
    </div>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const colors: Record<string, string> = {
    HIGH: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    MEDIUM: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    LOW: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  };
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors[severity] || ''}`}>{severity}</span>;
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ContentPipelinePage() {
  const [brief, setBrief] = useState('');
  const [contentType, setContentType] = useState('Blog Post');
  const [targetMarket, setTargetMarket] = useState('Global');
  const [targetLanguage, setTargetLanguage] = useState('English');
  const [selectedChannels, setSelectedChannels] = useState<string[]>(['Blog', 'LinkedIn']);
  const [knowledgeBase, setKnowledgeBase] = useState('');
  const [showKb, setShowKb] = useState(false);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PipelineResult | null>(null);
  const [error, setError] = useState('');

  const [approvalNote, setApprovalNote] = useState('');
  const [approving, setApproving] = useState(false);
  const [activeChannel, setActiveChannel] = useState('');

  const toggleChannel = (ch: string) => {
    setSelectedChannels(prev =>
      prev.includes(ch) ? prev.filter(c => c !== ch) : [...prev, ch]
    );
  };

  const runPipeline = async () => {
    if (!brief.trim()) return;
    setLoading(true);
    setResult(null);
    setError('');
    setActiveChannel('');

    try {
      const res = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brief, contentType, targetMarket, targetLanguage, channels: selectedChannels, knowledgeBase }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Pipeline failed');
      setResult(data);
      if (data.stages?.publisher?.channelOutputs) {
        setActiveChannel(Object.keys(data.stages.publisher.channelOutputs)[0] || '');
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Something went wrong';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const submitApproval = async (approved: boolean) => {
    if (!result) return;
    setApproving(true);
    try {
      const res = await fetch('/api/content/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: result.jobId, approved, notes: approvalNote }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(prev => prev ? {
        ...prev,
        approvalGate: { ...prev.approvalGate, approved, approvedBy: data.approvedBy, approvedAt: data.approvedAt, notes: approvalNote },
        stages: { ...prev.stages, publisher: { ...prev.stages.publisher, status: approved ? 'done' : 'pending' } }
      } : prev);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Approval failed';
      setError(msg);
    } finally {
      setApproving(false);
    }
  };

  const copyToClipboard = (text: string) => navigator.clipboard.writeText(text);

  const complianceColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Content Pipeline</h1>
          <p className="text-sm text-gray-500 mt-1">AI-powered creation → compliance → localization → distribution</p>
        </div>

        {/* Brief form */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Content brief</label>
            <textarea
              value={brief}
              onChange={e => setBrief(e.target.value)}
              placeholder="Describe what content you need. E.g. 'Announce our new AI-powered analytics product targeting mid-size SaaS companies. Key benefits: 40% faster reporting, plug-and-play with Salesforce.'"
              rows={4}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Content type</label>
              <select
                value={contentType}
                onChange={e => setContentType(e.target.value)}
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none"
              >
                {CONTENT_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Target market</label>
              <select
                value={targetMarket}
                onChange={e => setTargetMarket(e.target.value)}
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none"
              >
                {MARKETS.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Target language</label>
            <select
              value={targetLanguage}
              onChange={e => setTargetLanguage(e.target.value)}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none"
            >
              {LANGUAGES.map(l => <option key={l}>{l}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Channels</label>
            <div className="flex flex-wrap gap-2">
              {CHANNELS.map(ch => (
                <button
                  key={ch}
                  onClick={() => toggleChannel(ch)}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                    selectedChannels.includes(ch)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-blue-400'
                  }`}
                >
                  {ch}
                </button>
              ))}
            </div>
          </div>

          <div>
            <button
              className="text-sm text-blue-600 dark:text-blue-400 flex items-center gap-1"
              onClick={() => setShowKb(!showKb)}
            >
              {showKb ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              Add internal knowledge base (optional)
            </button>
            {showKb && (
              <textarea
                value={knowledgeBase}
                onChange={e => setKnowledgeBase(e.target.value)}
                placeholder="Paste product specs, reports, or internal data the Writer agent should reference..."
                rows={4}
                className="w-full mt-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>

          <Button
            onClick={runPipeline}
            disabled={loading || !brief.trim() || selectedChannels.length === 0}
            className="w-full"
          >
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Running pipeline…</> : 'Run content pipeline'}
          </Button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl px-4 py-3 text-sm text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {/* Pipeline stages */}
        {result && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Pipeline stages</h2>
              <span className="text-xs text-gray-400">Total: {(result.totalDurationMs / 1000).toFixed(1)}s · Job {result.jobId}</span>
            </div>

            {/* Stage 1: Writer */}
            <StageCard label="Stage 1 — Writer" icon={<Bot className="w-5 h-5" />} agent={result.stages.writer.agent} status={result.stages.writer.status} durationMs={result.stages.writer.durationMs}>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{result.stages.writer.wordCount} words</span>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800 p-3 text-sm prose prose-sm dark:prose-invert max-h-48 overflow-y-auto">
                  <ReactMarkdown>{result.stages.writer.draft}</ReactMarkdown>
                </div>
              </div>
            </StageCard>

            {/* Stage 2: Compliance */}
            <StageCard label="Stage 2 — Compliance review" icon={<Shield className="w-5 h-5" />} agent={result.stages.compliance.agent} status={result.stages.compliance.status} durationMs={result.stages.compliance.durationMs}>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className={`text-2xl font-bold ${complianceColor(result.stages.compliance.score)}`}>{result.stages.compliance.score}<span className="text-base font-normal">/100</span></span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${result.stages.compliance.complianceStatus === 'APPROVED' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'}`}>
                    {result.stages.compliance.complianceStatus}
                  </span>
                </div>
                {result.stages.compliance.issues.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Issues flagged</p>
                    {result.stages.compliance.issues.map((issue, i) => (
                      <div key={i} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 space-y-1">
                        <div className="flex items-center gap-2">
                          <SeverityBadge severity={issue.severity} />
                          <span className="text-xs text-gray-500">{issue.type}</span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{issue.description}</p>
                        <p className="text-xs text-gray-500 flex items-start gap-1"><AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />{issue.suggestion}</p>
                      </div>
                    ))}
                  </div>
                )}
                {result.stages.compliance.revisedDraft && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Revised draft</p>
                    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800 p-3 text-sm max-h-48 overflow-y-auto prose prose-sm dark:prose-invert">
                      <ReactMarkdown>{result.stages.compliance.revisedDraft}</ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            </StageCard>

            {/* Stage 3: Localization */}
            <StageCard label="Stage 3 — Localization" icon={<Globe className="w-5 h-5" />} agent={result.stages.localization.agent} status={result.stages.localization.status} durationMs={result.stages.localization.durationMs}>
              <div className="space-y-3">
                {result.stages.localization.adaptations.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Adaptations made</p>
                    <ul className="space-y-1">
                      {result.stages.localization.adaptations.map((a, i) => (
                        <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                          <span className="text-green-500 mt-0.5">✓</span> {a}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800 p-3 text-sm max-h-48 overflow-y-auto prose prose-sm dark:prose-invert">
                  <ReactMarkdown>{result.stages.localization.localizedContent}</ReactMarkdown>
                </div>
              </div>
            </StageCard>

            {/* Stage 4: Publisher */}
            <StageCard label="Stage 4 — Channel distribution" icon={<Send className="w-5 h-5" />} agent={result.stages.publisher.agent} status={result.stages.publisher.status} durationMs={result.stages.publisher.durationMs}>
              {Object.keys(result.stages.publisher.channelOutputs).length > 0 && (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {Object.keys(result.stages.publisher.channelOutputs).map(ch => (
                      <button
                        key={ch}
                        onClick={() => setActiveChannel(ch)}
                        className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${activeChannel === ch ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'}`}
                      >
                        {ch}
                      </button>
                    ))}
                  </div>
                  {activeChannel && result.stages.publisher.channelOutputs[activeChannel] && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{result.stages.publisher.channelOutputs[activeChannel].charCount} chars · Slot: {result.stages.publisher.channelOutputs[activeChannel].scheduledSlot}</span>
                        <button onClick={() => copyToClipboard(result.stages.publisher.channelOutputs[activeChannel].content)} className="flex items-center gap-1 hover:text-blue-600">
                          <Copy className="w-3.5 h-3.5" /> Copy
                        </button>
                      </div>
                      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800 p-3 text-sm max-h-64 overflow-y-auto whitespace-pre-wrap font-mono text-xs">
                        {result.stages.publisher.channelOutputs[activeChannel].content}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </StageCard>

            {/* Human-in-the-loop approval gate */}
            {result.approvalGate.required && result.approvalGate.approved === null && (
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-600" />
                  <h3 className="font-semibold text-amber-800 dark:text-amber-200">Human approval required</h3>
                </div>
                <p className="text-sm text-amber-700 dark:text-amber-300">Review the pipeline output above before content is released to channels. Add any notes for the audit trail.</p>
                <textarea
                  value={approvalNote}
                  onChange={e => setApprovalNote(e.target.value)}
                  placeholder="Optional: add reviewer notes for audit trail..."
                  rows={2}
                  className="w-full rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
                <div className="flex gap-3">
                  <Button onClick={() => submitApproval(true)} disabled={approving} className="flex-1 bg-green-600 hover:bg-green-700">
                    {approving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ThumbsUp className="w-4 h-4 mr-2" />}
                    Approve & publish
                  </Button>
                  <Button onClick={() => submitApproval(false)} disabled={approving} variant="outline" className="flex-1 border-red-300 text-red-600 hover:bg-red-50">
                    <ThumbsDown className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </div>
            )}

            {/* Approval decision shown */}
            {result.approvalGate.approved !== null && (
              <div className={`rounded-2xl border p-4 flex items-start gap-3 ${result.approvalGate.approved ? 'bg-green-50 dark:bg-green-950/20 border-green-300 dark:border-green-800' : 'bg-red-50 dark:bg-red-950/20 border-red-300 dark:border-red-800'}`}>
                {result.approvalGate.approved ? <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" /> : <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />}
                <div className="text-sm">
                  <p className="font-medium">{result.approvalGate.approved ? 'Content approved — published to channels' : 'Content rejected — pipeline stopped'}</p>
                  <p className="text-gray-500 mt-1">
                    By {result.approvalGate.approvedBy} · {result.approvalGate.approvedAt}
                  </p>
                  {result.approvalGate.notes && <p className="mt-1 text-gray-600 dark:text-gray-400">"{result.approvalGate.notes}"</p>}
                </div>
              </div>
            )}

            {/* Run again */}
            <button
              onClick={() => { setResult(null); setError(''); }}
              className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1.5 mx-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Start new job
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
