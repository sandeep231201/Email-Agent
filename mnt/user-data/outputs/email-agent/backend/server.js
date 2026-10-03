require('dotenv').config();
require('express-async-errors');

const express = require('express');
const cors = require('cors');
const { Anthropic } = require('@anthropic-ai/sdk');
const logger = require('./config/logger');

const app = express();

const sendAnthropicError = (res, err, fallbackResult = null) => {
  const detail = err?.error?.error?.message || err?.message || 'Anthropic API error';
  const message = detail.toLowerCase().includes('credit balance')
    ? 'Anthropic API unavailable: low credit balance. Please check billing or update the API key.'
    : detail;

  res.write(`data: ${JSON.stringify({ type: 'error', message })}\n\n`);
  if (fallbackResult) {
    res.write(`data: ${JSON.stringify({ type: 'done', result: fallbackResult })}\n\n`);
  }
  res.end();
};

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Health check (no middleware)
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Demo endpoints (no authentication required)
app.get('/api/demo/emails', (req, res) => {
  const MOCK_EMAILS = [
    {
      id: '1',
      from: 'boss@company.com',
      subject: 'URGENT: Server is down - need immediate fix',
      body: 'Our production server crashed 10 minutes ago. Customers cannot access the app. I need you to fix this ASAP. This is losing us money every minute.',
      timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
      read: false,
    },
    {
      id: '2',
      from: 'newsletter@techdigest.com',
      subject: 'This week in tech: AI breakthroughs & more',
      body: 'Welcome to this week\'s tech digest. Top stories: GPT-5 rumors, new React release, cloud pricing changes. Click to read more.',
      timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
      read: false,
    },
    {
      id: '3',
      from: 'client@bigcorp.com',
      subject: 'Project proposal feedback needed by Friday',
      body: 'Hi, I reviewed the proposal you sent. I have a few questions about the timeline and budget. Can we hop on a call before Friday? Also, please update section 3 with the revised cost breakdown.',
      timestamp: new Date(Date.now() - 5 * 3600000).toISOString(),
      read: false,
    },
    {
      id: '4',
      from: 'hr@company.com',
      subject: 'Reminder: Submit your timesheet by EOD',
      body: 'This is a friendly reminder to submit your timesheet for this week before end of day today. Log in to the HR portal to complete it.',
      timestamp: new Date(Date.now() - 8 * 3600000).toISOString(),
      read: true,
    },
    {
      id: '5',
      from: 'friend@gmail.com',
      subject: 'Weekend plans?',
      body: 'Hey! Are you free this weekend? A bunch of us are going hiking on Saturday. Let me know if you can make it!',
      timestamp: new Date(Date.now() - 24 * 3600000).toISOString(),
      read: false,
    },
    {
      id: '6',
      from: 'security@bank.com',
      subject: 'Security Alert: New login detected',
      body: 'A new login was detected on your account from an unknown device in a different city. If this was not you, please reset your password immediately and contact support.',
      timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
      read: false,
    },
  ];
  res.json(MOCK_EMAILS);
});

app.post('/api/demo/analyze', async (req, res) => {
  const Anthropic = require('@anthropic-ai/sdk');
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const MOCK_EMAILS = [
    { id: '1', from: 'boss@company.com', subject: 'URGENT: Server is down', body: 'Our production server crashed. Customers cannot access the app. I need you to fix this ASAP.' },
    { id: '2', from: 'newsletter@techdigest.com', subject: 'This week in tech', body: 'Top stories: GPT-5 rumors, new React release, cloud pricing changes.' },
    { id: '3', from: 'client@bigcorp.com', subject: 'Project proposal feedback', body: 'Hi, I reviewed the proposal. Can we hop on a call before Friday?' },
    { id: '4', from: 'hr@company.com', subject: 'Timesheet reminder', body: 'Friendly reminder to submit your timesheet for this week before EOD.' },
    { id: '5', from: 'friend@gmail.com', subject: 'Weekend plans?', body: 'Are you free this weekend? Going hiking on Saturday.' },
    { id: '6', from: 'security@bank.com', subject: 'Security Alert', body: 'A new login was detected. If not you, reset your password immediately.' },
  ];

  const emailSummary = MOCK_EMAILS.map(e => `ID: ${e.id} | From: ${e.from} | Subject: ${e.subject} | Preview: ${e.body.substring(0, 60)}`).join('\n');

  const prompt = `Analyze these emails and return a JSON array. For each email, return: {"id": "email id", "category": one of ["urgent", "work", "personal", "newsletter", "security", "admin"], "priority": one of ["high", "medium", "low"], "summary": "1-2 sentence summary", "flagged": true/false, "flagReason": "reason if flagged, else null"}

Emails:
${emailSummary}

Return ONLY a valid JSON array, no other text.`;

  try {
    const stream = client.messages.stream({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    });

    let fullText = '';

    stream.on('text', (text) => {
      fullText += text;
      res.write(`data: ${JSON.stringify({ type: 'chunk', text })}\n\n`);
    });

    stream.on('finalMessage', () => {
      try {
        const clean = fullText.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(clean);
        res.write(`data: ${JSON.stringify({ type: 'done', result: parsed })}\n\n`);
      } catch (e) {
        res.write(`data: ${JSON.stringify({ type: 'done', result: [] })}\n\n`);
      }
      res.end();
    });

    stream.on('error', (err) => {
      res.write(`data: ${JSON.stringify({ type: 'error', message: err.message })}\n\n`);
      res.end();
    });
  } catch (err) {
    sendAnthropicError(res, err);
  }
});

app.post('/api/demo/draft-reply', async (req, res) => {
  const Anthropic = require('@anthropic-ai/sdk');
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const { emailId, tone = 'professional' } = req.body;

  const MOCK_EMAILS = {
    '1': { from: 'boss@company.com', subject: 'URGENT: Server is down', body: 'Our production server crashed. Customers cannot access. Fix ASAP!' },
    '2': { from: 'newsletter@techdigest.com', subject: 'This week in tech', body: 'Top stories: GPT-5, React, cloud pricing.' },
    '3': { from: 'client@bigcorp.com', subject: 'Project feedback', body: 'Can we discuss the proposal before Friday?' },
    '4': { from: 'hr@company.com', subject: 'Timesheet', body: 'Submit your timesheet for this week.' },
    '5': { from: 'friend@gmail.com', subject: 'Weekend plans?', body: 'Are you free Saturday for hiking?' },
    '6': { from: 'security@bank.com', subject: 'Security Alert', body: 'New login detected. Reset password if not you.' },
  };

  const email = MOCK_EMAILS[emailId];
  if (!email) return res.status(404).json({ error: 'Email not found' });

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const prompt = `Draft a ${tone} reply to this email:

From: ${email.from}
Subject: ${email.subject}
Message: ${email.body}

Write a helpful, concise reply. Be natural and appropriate. Just write the reply body.`;

  try {
    const stream = client.messages.stream({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    });

    stream.on('text', (text) => {
      res.write(`data: ${JSON.stringify({ type: 'chunk', text })}\n\n`);
    });

    stream.on('finalMessage', () => {
      res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
      res.end();
    });

    stream.on('error', (err) => {
      sendAnthropicError(res, err);
    });
  } catch (err) {
    sendAnthropicError(res, err);
  }
});

app.post('/api/demo/ask', async (req, res) => {
  const Anthropic = require('@anthropic-ai/sdk');
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const { emailId, question } = req.body;

  const MOCK_EMAILS = {
    '1': { from: 'boss@company.com', subject: 'URGENT: Server is down', body: 'Our production server crashed. Customers cannot access. Fix ASAP!' },
    '2': { from: 'newsletter@techdigest.com', subject: 'This week in tech', body: 'Top stories: GPT-5, React, cloud pricing.' },
    '3': { from: 'client@bigcorp.com', subject: 'Project feedback', body: 'Can we discuss the proposal before Friday?' },
    '4': { from: 'hr@company.com', subject: 'Timesheet', body: 'Submit your timesheet for this week.' },
    '5': { from: 'friend@gmail.com', subject: 'Weekend plans?', body: 'Are you free Saturday for hiking?' },
    '6': { from: 'security@bank.com', subject: 'Security Alert', body: 'New login detected. Reset password if not you.' },
  };

  const email = MOCK_EMAILS[emailId];
  if (!email) return res.status(404).json({ error: 'Email not found' });

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const prompt = `Email context:
From: ${email.from}
Subject: ${email.subject}
Message: ${email.body}

User question: ${question}

Answer concisely based on the email.`;

  try {
    const stream = client.messages.stream({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 400,
      messages: [{ role: 'user', content: prompt }],
    });

    stream.on('text', (text) => {
      res.write(`data: ${JSON.stringify({ type: 'chunk', text })}\n\n`);
    });

    stream.on('finalMessage', () => {
      res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
      res.end();
    });

    stream.on('error', (err) => {
      res.write(`data: ${JSON.stringify({ type: 'error', message: err.message })}\n\n`);
      res.end();
    });
  } catch (err) {
    res.write(`data: ${JSON.stringify({ type: 'error', message: err.message })}\n\n`);
    res.end();
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║     📧 Email Agent - Production Ready      ║
╚════════════════════════════════════════════╝

🚀 Server: http://localhost:${PORT}
🎨 Frontend: http://localhost:3000
📚 Docs: http://localhost:${PORT}/api/docs
🏥 Health: http://localhost:${PORT}/health
  `);
});
