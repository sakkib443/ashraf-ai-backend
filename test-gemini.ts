import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const runTest = async () => {
    try {
        const apiKey = process.env.GEMINI_API_KEY!;
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        console.log("Testing gemini-1.5-flash with latest lib...");
        const result = await model.generateContent("Hi");
        console.log("Success:", result.response.text());

    } catch (e: any) {
        console.log("ERROR:", e.message);
    }
};
runTest();
