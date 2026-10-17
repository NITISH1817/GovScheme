import ChatHistory from '../models/ChatHistory.js';
import Scheme from '../models/Scheme.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { schemesData } from '../../src/data/schemes.ts';

const buildGroundedPrompt = (message) => {
  const schemes = schemesData;
  const context = `You are the official GovScheme AI Assistant. You help Indian citizens discover and understand government welfare schemes.
Ground all scheme responses strictly on the published portal-curated schemes in our database:
${schemes.slice(0, 30).map(s => `- ${s.name} (${s.category}, ${s.state}): ${s.shortDescription}`).join('\n')}

Instructions:
1. Explain eligibility clearly based on the stated criteria.
2. Clearly state that official eligibility is evaluated by deterministic platform rules and official portal authorities.
3. Be concise, polite, and helpful in all Indian languages requested.`;

  return [context, `Citizen Query: ${message}`];
};

export const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message text is required.' });
    }
    if (message.length > 2000) {
      return res.status(400).json({ success: false, message: 'Message exceeds maximum length of 2000 characters.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      // Grounded offline fallback
      const lower = message.toLowerCase();
      const matched = schemesData.filter(s => lower.includes(s.name.toLowerCase()) || lower.includes(s.category.toLowerCase()));
      const reply = matched.length > 0
        ? `[Grounded Knowledge Engine • Provider Notice: API Key Not Set]\n\nPublished Scheme (Official Portal Sourced): ${matched[0].name}\nBenefits: ${matched[0].benefitsSummary || matched[0].shortDescription}\nOfficial Portal: ${matched[0].officialWebsite || 'https://india.gov.in'}`
        : 'Please explore our published schemes catalog for full eligibility details.';
      return res.json({ success: true, reply, provider: 'offline_grounded' });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const candidateModels = [process.env.GEMINI_MODEL || 'gemini-1.5-flash', 'gemini-2.0-flash'];
    
    let reply = '';
    let usedModel = '';
    for (const modelName of candidateModels) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(buildGroundedPrompt(message));
        reply = result.response.text();
        usedModel = modelName;
        break;
      } catch (err) {
        console.warn(`[AI Controller] Model ${modelName} failed:`, err.message);
      }
    }

    if (!reply) {
      const lower = message.toLowerCase();
      const matched = schemesData.filter(s => lower.includes(s.name.toLowerCase()) || lower.includes(s.category.toLowerCase()));
      reply = matched.length > 0
        ? `[Grounded Knowledge Engine • AI Provider Busy]\n\nPublished Scheme: ${matched[0].name}\nDetails: ${matched[0].shortDescription}\nEligibility Rules apply.`
        : 'The AI provider is currently experiencing temporary high demand. Please consult the schemes catalog directly.';
      return res.json({ success: true, reply, provider: 'offline_grounded_fallback' });
    }

    // Save history if user authenticated
    if (req.user) {
      ChatHistory.findOne({ userId: req.user._id }).then(chatRecord => {
        if (!chatRecord) chatRecord = new ChatHistory({ userId: req.user._id, messages: [] });
        chatRecord.messages.push({ role: 'user', content: message });
        chatRecord.messages.push({ role: 'assistant', content: reply });
        chatRecord.save().catch(() => {});
      }).catch(() => {});
    }

    res.json({ success: true, reply, model: usedModel });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const streamChatWithAI = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user ? req.user._id : 'guest';

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message text is required.' });
    }
    if (message.length > 2000) {
      return res.status(400).json({ success: false, message: 'Message exceeds maximum length of 2000 characters.' });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    if (res.flushHeaders) res.flushHeaders(); 

    if (!process.env.GEMINI_API_KEY) {
      const errorMsg = "[Grounded Notice] GEMINI_API_KEY is not configured on the server. Responses are grounded in local published scheme records.";
      res.write(`data: ${JSON.stringify({ text: errorMsg })}\n\n`);
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      return res.end();
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const candidateModels = [process.env.GEMINI_MODEL || 'gemini-1.5-flash', 'gemini-2.0-flash'];
    
    let streamSuccess = false;
    let fullResponse = "";

    for (const modelName of candidateModels) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContentStream(buildGroundedPrompt(message));

        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          fullResponse += chunkText;
          res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
        }
        streamSuccess = true;
        break;
      } catch (err) {
        console.warn(`[AI Stream] Model ${modelName} stream error:`, err.message);
      }
    }

    if (!streamSuccess) {
      const lower = message.toLowerCase();
      const matched = schemesData.filter(s => lower.includes(s.name.toLowerCase()) || lower.includes(s.category.toLowerCase()));
      const fallbackReply = matched.length > 0
        ? `[Grounded Knowledge Engine • AI Cloud Stream Busy]\n\nPublished Scheme: ${matched[0].name}\nOverview: ${matched[0].shortDescription}\nApply on: ${matched[0].officialWebsite || 'https://india.gov.in'}`
        : '[Grounded Knowledge Engine] The cloud AI service is experiencing high temporary demand (503). Scheme records remain accessible on the Discover Schemes page.';
      res.write(`data: ${JSON.stringify({ text: fallbackReply })}\n\n`);
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
    
    // Save history in background
    if (userId !== 'guest' && fullResponse) {
      ChatHistory.findOne({ userId }).then(chatRecord => {
        if (!chatRecord) chatRecord = new ChatHistory({ userId, messages: [] });
        chatRecord.messages.push({ role: 'user', content: message });
        chatRecord.messages.push({ role: 'assistant', content: fullResponse });
        chatRecord.save().catch(() => {});
      }).catch(() => {});
    }

  } catch (error) {
    console.error("AI Error:", error);
    res.write(`data: ${JSON.stringify({ error: "Failed to communicate with AI model: " + error.message })}\n\n`);
    res.end();
  }
};
