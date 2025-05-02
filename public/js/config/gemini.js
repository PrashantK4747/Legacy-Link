import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from "dotenv";

const genAI = new GoogleGenerativeAI('AIzaSyB0Mn4S6_vZLgxVi9p2sWnjkQiyVoJM9aw');
const model = genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash",
    generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.7
    }
});

export default model;