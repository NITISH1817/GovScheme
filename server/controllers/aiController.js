import ChatHistory from '../models/ChatHistory.js';
import Scheme from '../models/Scheme.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { schemesData } from '../../src/data/schemes.js';

export const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;
    res.json({ success: true, reply: "Please use the streaming endpoint." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const streamChatWithAI = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user ? req.user._id : 'guest';

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders(); 

    if (!process.env.GEMINI_API_KEY) {
      const errorMsg = "GEMINI_API_KEY is not set. Please add it to your .env file and restart the server to enable real AI responses.";
      res.write(`data: ${JSON.stringify({ text: errorMsg })}\n\n`);
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      return res.end();
    }

    const schemes = schemesData;
    
    // Create prompt context
    const context = `You are the GovScheme AI Assistant. You help Indian citizens discover government welfare schemes. 
Here is a summary of the currently published schemes in our database:
${schemes.map(s => `- ${s.name} (${s.department}): ${s.shortDescription}`).join('\n')}

Answer the user's question accurately based on this data. Be concise, polite, and helpful.`;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-3.8-flash' });

    // Stream the response
    const result = await model.generateContentStream([context, "User Question: " + message]);

    let fullResponse = "";
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      fullResponse += chunkText;
      // Send chunk to client
      res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
    }

    // Finish stream
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
    
    // Save history in the background
    if (userId !== 'guest') {
      ChatHistory.findOne({ userId }).then(chatRecord => {
        if (!chatRecord) chatRecord = new ChatHistory({ userId, messages: [] });
        chatRecord.messages.push({ role: 'user', content: message });
        chatRecord.messages.push({ role: 'assistant', content: fullResponse });
        chatRecord.save();
      });
    }

  } catch (error) {
    console.error("AI Error:", error);
    res.write(`data: ${JSON.stringify({ error: "Failed to communicate with AI model. Ensure API key is valid." })}\n\n`);
    res.end();
  }
};
