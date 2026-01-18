import Groq from 'groq-sdk';

let groqClient: Groq | null = null;

export const initializeGroq = (): Groq => {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey || apiKey === 'your_groq_api_key_here') {
        console.warn('⚠️ GROQ_API_KEY not configured. AI features will not work.');
        throw new Error('Groq API key is not configured');
    }

    groqClient = new Groq({ apiKey });
    console.log('✅ Groq AI Initialized (Llama 3.3 70B)');

    return groqClient;
};

export const getGroqInstance = (): Groq => {
    if (!groqClient) {
        return initializeGroq();
    }
    return groqClient;
};

export const groqConfig = {
    // Llama 3.3 70B - Best quality, super fast on Groq
    model: 'llama-3.3-70b-versatile',

    // Alternative models (uncomment to use):
    // model: 'llama-3.1-70b-versatile',   // Older Llama, still great
    // model: 'mixtral-8x7b-32768',         // Mixtral - good for coding
    // model: 'llama-3.1-8b-instant',       // Fastest, smaller model

    generationConfig: {
        temperature: 0.7,
        top_p: 0.8,
        max_tokens: 8192,
    },
};
