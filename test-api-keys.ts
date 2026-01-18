// Quick test to check Gemini API directly
import dotenv from 'dotenv';
dotenv.config();

import { GoogleGenerativeAI } from '@google/generative-ai';

async function testGeminiAPI() {
    console.log('\n🔍 Testing Gemini API...\n');

    const apiKey = process.env.GEMINI_API_KEY || '';
    console.log('API Key (masked):', apiKey.slice(0, 8) + '...' + apiKey.slice(-4));

    const models = ['gemini-pro', 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash'];

    for (const modelName of models) {
        console.log(`\n📝 Testing model: ${modelName}`);

        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: modelName });

            console.log('  Sending test message...');
            const result = await model.generateContent('Say hi');
            const response = result.response.text();

            console.log(`  ✅ SUCCESS! Response: "${response.trim()}"`);
            console.log(`\n🎉 Model ${modelName} works! Use this in your config.\n`);
            process.exit(0);
        } catch (error: any) {
            console.log(`  ❌ FAILED: ${error.message?.slice(0, 100)}`);
        }
    }

    console.log('\n❌ All models failed! Your API key might be completely rate limited or invalid.');
    console.log('   Please get a NEW API key from: https://aistudio.google.com/apikey\n');
}

testGeminiAPI();
