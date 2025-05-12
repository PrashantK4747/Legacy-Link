import express from 'express';
import model from './config/gemini.js';

const router = express.Router();

const prompts = {
    // Basic interactions
    'hello': 'Hi! I\'m LegacyLink Assistant. How can I help?',
    'hi': 'Hello! Need help with alumni connections?',
    'help': 'I can help with alumni network, events, posts, and mentorship.',
    
    // Core features
    'events': 'View upcoming alumni meetups, workshops, and networking events.',
    'alumni': 'Search alumni directory by year, industry, or location.',
    'posts': 'Share updates or browse alumni success stories.',
    
    // Authentication
    'login': 'Choose student/alumni login from homepage.',
    'register': 'Contact admin for registration details.',
    
    // Networking
    'mentorship': 'Connect with alumni mentors in your field.',
    'network': 'Build connections through events and alumni directory.',
    'opportunities': 'Check job posts and internship opportunities from alumni.',
    
    // Common queries
    'contact': 'Email support@legacylink or use contact form.',
    'profile': 'Update your profile in account settings.',
    'batch': 'Search alumni by graduation year in directory.',
    'placement': 'View placement updates and career opportunities.',
    'feedback': 'Share feedback through contact form.',
    'bye': 'Goodbye! Stay connected with LegacyLink!'
};

  router.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;
        const userInput = message.toLowerCase().trim();
        
        // Check for predefined responses
        if (prompts[userInput]) {
            return res.json({ reply: prompts[userInput] });
        }

        // Use Gemini for all other queries
        const chat = model.startChat({
            history: [],
            context: `You are the LegacyLink Assistant. Keep responses under 15 words and give only one response. Focus on college, alumni, and student-related topics.`
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        res.json({ reply: response.text() });

    } catch (error) {
        console.error('Chat Error:', error);
        res.status(500).json({
            error: 'Failed to process request',
            details: error.message
        });
    }
});

export default router;