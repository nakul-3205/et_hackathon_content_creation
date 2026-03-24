import mongoose, { Schema, model, models } from "mongoose";

const ComplianceIssueSchema = new Schema({
  severity: { type: String, enum: ["HIGH", "MEDIUM", "LOW"] },
  type: { type: String, enum: ["BRAND", "LEGAL", "REGULATORY", "SENSITIVITY"] },
  description: String,
  suggestion: String,
});

const ContentJobSchema = new Schema(
  {
    jobId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    brief: { type: String, required: true },
    contentType: String,
    targetMarket: String,
    targetLanguage: String,
    channels: [String],

    stages: {
      writer: {
        status: String,
        agent: String,
        draft: String,
        wordCount: Number,
        durationMs: Number,
      },
      compliance: {
        status: String,
        agent: String,
        complianceStatus: String,
        score: Number,
        issues: [ComplianceIssueSchema],
        revisedDraft: String,
        durationMs: Number,
      },
      localization: {
        status: String,
        agent: String,
        localizedContent: String,
        adaptations: [String],
        durationMs: Number,
      },
      publisher: {
        status: String,
        agent: String,
        channelOutputs: { type: Map, of: Schema.Types.Mixed },
        durationMs: Number,
      },
    },

    approvalGate: {
      required: { type: Boolean, default: true },
      approved: { type: Boolean, default: null },
      approvedBy: { type: String, default: null },
      approvedAt: { type: String, default: null },
      notes: { type: String, default: null },
    },

    totalDurationMs: Number,
    finalContent: String,
    error: { type: String, default: null },
  },
  { timestamps: true }
);

const ContentJob = models.ContentJob || model("ContentJob", ContentJobSchema);
export default ContentJob;
