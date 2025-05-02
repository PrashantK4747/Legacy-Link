import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from "dotenv";

const genAI = new GoogleGenerativeAI('YOUR_API_KEY');
const model = genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash",
    generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.7
    }
});

export default model;