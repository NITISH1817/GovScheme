import ChatHistory from '../models/ChatHistory.js';
import Scheme from '../models/Scheme.js';

export const chatWithAI = async (req, res) => {
  try {
    const { message, history } = req.body;
    const userId = req.user._id;

    // Fetch schemes to provide context to the AI
    const schemes = await Scheme.find({ status: 'Published' }).select('name shortDescription department eligibilityRules');

    // Simulate AI processing using a mocked service (Gemini/OpenAI would go here)
    // We will just return a mock response that references the schemes
    
    let aiResponse = "I'm sorry, I couldn't process your request.";
    const lowerMsg = message.toLowerCase();

    if (lowerMsg.includes('farmer') || lowerMsg.includes('agriculture')) {
      const farmerSchemes = schemes.filter(s => s.name.toLowerCase().includes('kisan') || s.department.toLowerCase().includes('agriculture'));
      if (farmerSchemes.length > 0) {
        aiResponse = `Based on our current database, here are some farmer schemes: ${farmerSchemes.map(s => s.name).join(', ')}.`;
      } else {
        aiResponse = "I couldn't find any farmer schemes at the moment.";
      }
    } else if (lowerMsg.includes('student') || lowerMsg.includes('scholarship')) {
        aiResponse = "We have several scholarships available for students. Please check the 'Education' category in the Schemes list.";
    } else {
        aiResponse = `I understand you are asking about: "${message}". I can help you find schemes, explain eligibility, or guide you through the application process.`;
    }

    // Save to ChatHistory
    let chatRecord = await ChatHistory.findOne({ userId });
    if (!chatRecord) {
      chatRecord = new ChatHistory({ userId, messages: [] });
    }
    
    chatRecord.messages.push({ role: 'user', content: message });
    chatRecord.messages.push({ role: 'assistant', content: aiResponse });
    await chatRecord.save();

    res.json({ success: true, reply: aiResponse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const streamChatWithAI = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user._id;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders(); // flush the headers to establish SSE

    const schemes = await Scheme.find({ status: 'Published' }).select('name shortDescription department');
    
    let aiResponse = "I'm sorry, I couldn't process your request.";
    const lowerMsg = message.toLowerCase();

    if (lowerMsg.includes('farmer') || lowerMsg.includes('agriculture')) {
      const farmerSchemes = schemes.filter(s => s.name.toLowerCase().includes('kisan') || s.department.toLowerCase().includes('agriculture'));
      if (farmerSchemes.length > 0) {
        aiResponse = `Based on our database, here are some farmer schemes: ${farmerSchemes.map(s => s.name).join(', ')}.`;
      }
    } else if (lowerMsg.includes('student') || lowerMsg.includes('scholarship')) {
        aiResponse = "We have several scholarships available for students. Please check the 'Education' category.";
    } else {
        aiResponse = `I understand you are asking about: "${message}". Let me search our live database for relevant schemes and eligibility rules.`;
    }

    // Simulate streaming the response word by word
    const words = aiResponse.split(' ');
    let currentIndex = 0;

    const interval = setInterval(() => {
      if (currentIndex < words.length) {
        res.write(`data: ${JSON.stringify({ text: words[currentIndex] + ' ' })}\n\n`);
        currentIndex++;
      } else {
        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        clearInterval(interval);
        res.end();
        
        // Save history in the background
        ChatHistory.findOne({ userId }).then(chatRecord => {
          if (!chatRecord) chatRecord = new ChatHistory({ userId, messages: [] });
          chatRecord.messages.push({ role: 'user', content: message });
          chatRecord.messages.push({ role: 'assistant', content: aiResponse });
          chatRecord.save();
        });
      }
    }, 50);

  } catch (error) {
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
};
