import express from 'express';
import model from './config/gemini.js';

const router = express.Router();

router.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;

        const chat = model.startChat({
            history: [],
            context: `You are the LegacyLink Assistant for TKIET's alumni platform. 
                     You help users with navigation, features, and general queries 
                     about the platform. Keep responses concise and helpful.`
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        res.json({ reply: response.text() });

    } catch (error) {
        console.error('Gemini Chat Error:', error);
        res.status(500).json({
            error: 'Failed to process your request',
            details: error.message
        });
    }
});

export default router;