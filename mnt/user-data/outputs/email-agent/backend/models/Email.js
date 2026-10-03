const mongoose = require('mongoose');

const emailSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    from: {
      type: String,
      required: true,
    },
    to: [String],
    cc: [String],
    bcc: [String],
    subject: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    htmlBody: String,
    timestamp: {
      type: Date,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    archived: {
      type: Boolean,
      default: false,
    },
    starred: {
      type: Boolean,
      default: false,
    },
    externalId: String, // Gmail ID or Outlook ID
    analysis: {
      category: {
        type: String,
        enum: ['urgent', 'work', 'personal', 'newsletter', 'security', 'admin', 'other'],
        default: 'other',
      },
      priority: {
        type: String,
        enum: ['high', 'medium', 'low'],
        default: 'medium',
      },
      summary: String,
      flagged: Boolean,
      flagReason: String,
      analyzedAt: Date,
    },
    attachments: [
      {
        filename: String,
        size: Number,
        contentType: String,
      },
    ],
  },
  { timestamps: true }
);

// Index for faster queries
emailSchema.index({ userId: 1, timestamp: -1 });
emailSchema.index({ userId: 1, read: 1 });
emailSchema.index({ userId: 1, 'analysis.category': 1 });

module.exports = mongoose.model('Email', emailSchema);
