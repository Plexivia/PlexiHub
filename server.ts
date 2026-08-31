import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Gemini SDK with User-Agent header for telemetry
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// API routes FIRST
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Gemini AI Chatbot Endpoint
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { messages, context } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const ai = getGeminiClient();

    if (!ai) {
      // Graceful fallback response when API key is missing
      return res.json({
        text: `**CommerceOps AI Assistant**\n\nI'm ready to assist with your eCommerce operations, root cause analyses, telemetry monitoring, and role permissions.\n\n*Note: To enable live AI reasoning, ensure your \`GEMINI_API_KEY\` is configured in the AI Studio Settings.*`,
        status: 'mock_fallback',
      });
    }

    const systemInstruction = `You are CommerceOps AI, an intelligent, senior eCommerce operations architect and technical platform assistant for the CommerceOps White-Label Portal.
You assist client Business Owners, Operations Administrators, and Store Managers with:
1. **eCommerce Triage & Issue Diagnosis**: Root-cause analysis for payment gateway timeouts (Stripe/PayPal), inventory sync latency, pod/container memory spikes, checkout drop-offs, database deadlocks, CDN cache invalidations, and webhook delivery errors.
2. **Role & Permission Guidance**:
   - **Owner**: Full business authority, white-label branding (domains, logos, palettes), billing, tenant-wide security policies, and team permissions.
   - **Admin**: Operations administration, team invites, deployments, telemetry monitoring, audit trails, and issue assignment.
   - **Manager**: Store catalog operations, creating and tracking issues, SLA escalation, and technical support requests.
3. **Deployment Telemetry**: Analyzing deployment logs, Kubernetes ingress status, rolling updates, canary releases, and rollback execution checklists.
4. **Actionable Operations Advice**: Provide structured, clear, and professional markdown responses with headers, step-by-step checklists, and recommended shell/API fixes where relevant.

Current Context provided by user session:
${context ? JSON.stringify(context, null, 2) : 'No explicit context provided.'}`;

    // Format conversation history for Gemini
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const text = response.text || 'I processed your request, but received an empty response.';
    return res.json({ text });
  } catch (error: any) {
    console.error('Gemini API chat error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate response from Gemini API',
      fallbackText: `**Error communicating with Gemini API**: ${error.message || 'Service unavailable'}. Please verify your network and credentials.`,
    });
  }
});

// Quick Issue Analysis Endpoint
app.post('/api/gemini/analyze-issue', async (req, res) => {
  try {
    const { issue } = req.body;
    if (!issue) {
      return res.status(400).json({ error: 'Issue payload is required' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.json({
        analysis: `### Root Cause Analysis & Remediation Plan\n\n**Issue**: ${issue.title} (${issue.id})\n**Priority**: ${issue.priority} | **Status**: ${issue.status}\n\n1. **Likely Root Cause**: Transient network latency or resource saturation in upstream service.\n2. **Immediate Remediation**:\n   - Check telemetry metrics for memory/CPU spikes.\n   - Inspect recent deployment logs for configuration diffs.\n   - Escalate to on-call administrator if SLA breaches.\n3. **Recommended Status**: Move to \`In Progress\` while monitoring telemetry.`,
      });
    }

    const prompt = `Please provide a fast, structured, professional Root Cause Analysis (RCA) and mitigation plan for the following eCommerce issue in the CommerceOps portal:
ID: ${issue.id}
Title: ${issue.title}
Description: ${issue.description || 'N/A'}
Priority: ${issue.priority}
Status: ${issue.status}
Labels: ${issue.labels?.join(', ') || 'None'}
Project: ${issue.projectId}

Format response with:
1. **Executive Summary**
2. **Probable Root Cause**
3. **Immediate Mitigation Checklist**
4. **Preventative Action**`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are a senior site reliability engineer and eCommerce platform architect.',
        temperature: 0.4,
      },
    });

    return res.json({ analysis: response.text });
  } catch (err: any) {
    console.error('Gemini issue analysis error:', err);
    return res.status(500).json({ error: err.message || 'Analysis failed' });
  }
});

// Vite middleware for development vs static build in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CommerceOps server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
