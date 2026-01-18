import { GoogleGenerativeAI } from '@google/generative-ai';

// Store all API keys and their instances
let apiKeys: string[] = [];
let currentKeyIndex = 0;
let genAIInstances: Map<string, GoogleGenerativeAI> = new Map();

// Track rate limited keys and when they can be used again
const rateLimitedKeys: Map<string, number> = new Map();

// Rate limit cooldown period (2 minutes)
const RATE_LIMIT_COOLDOWN = 2 * 60 * 1000;

export const initializeGemini = (): GoogleGenerativeAI => {
    // Get multiple API keys or fallback to single key
    const apiKeysEnv = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY;

    if (!apiKeysEnv || apiKeysEnv === 'your_gemini_api_key_here') {
        console.warn('⚠️ GEMINI_API_KEYS not configured. AI features will not work.');
        throw new Error('Gemini API key is not configured');
    }

    // Parse comma-separated API keys
    apiKeys = apiKeysEnv
        .split(',')
        .map(key => key.trim())
        .filter(key => key && key !== 'YOUR_API_KEY_2' && key !== 'YOUR_API_KEY_3' && key !== 'YOUR_API_KEY_4' && key !== 'YOUR_API_KEY_5');

    if (apiKeys.length === 0) {
        throw new Error('No valid Gemini API keys found');
    }

    console.log(`✅ Gemini AI Initialized with ${apiKeys.length} API key(s)`);

    // Create instance for first key
    const firstInstance = new GoogleGenerativeAI(apiKeys[0]);
    genAIInstances.set(apiKeys[0], firstInstance);

    return firstInstance;
};

/**
 * Get an available API key (not rate limited)
 */
const getAvailableKeyIndex = (): number => {
    const now = Date.now();

    // First, remove expired rate limits
    for (const [key, expiry] of rateLimitedKeys.entries()) {
        if (expiry < now) {
            rateLimitedKeys.delete(key);
            console.log(`🔓 API key ending in ...${key.slice(-4)} is now available again`);
        }
    }

    // Find first available key starting from current index
    for (let i = 0; i < apiKeys.length; i++) {
        const index = (currentKeyIndex + i) % apiKeys.length;
        const key = apiKeys[index];

        if (!rateLimitedKeys.has(key)) {
            currentKeyIndex = index;
            return index;
        }
    }

    // All keys are rate limited, use the one that expires soonest
    let soonestExpiry = Infinity;
    let soonestIndex = 0;

    for (let i = 0; i < apiKeys.length; i++) {
        const key = apiKeys[i];
        const expiry = rateLimitedKeys.get(key) || 0;
        if (expiry < soonestExpiry) {
            soonestExpiry = expiry;
            soonestIndex = i;
        }
    }

    console.warn(`⚠️ All API keys are rate limited. Using key that expires soonest.`);
    return soonestIndex;
};

export const getGeminiInstance = (): GoogleGenerativeAI => {
    if (apiKeys.length === 0) {
        return initializeGemini();
    }

    const keyIndex = getAvailableKeyIndex();
    const key = apiKeys[keyIndex];

    // Create instance if not exists
    if (!genAIInstances.has(key)) {
        genAIInstances.set(key, new GoogleGenerativeAI(key));
    }

    return genAIInstances.get(key)!;
};

/**
 * Mark current key as rate limited
 */
export const markCurrentKeyAsRateLimited = (): void => {
    const key = apiKeys[currentKeyIndex];
    if (key) {
        rateLimitedKeys.set(key, Date.now() + RATE_LIMIT_COOLDOWN);
        console.warn(`🔒 API key ending in ...${key.slice(-4)} is rate limited. Switching to next key.`);

        // Move to next key
        currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
    }
};

/**
 * Get current API key (for debugging)
 */
export const getCurrentKeyInfo = (): { total: number; current: number; rateLimited: number } => {
    return {
        total: apiKeys.length,
        current: currentKeyIndex + 1,
        rateLimited: rateLimitedKeys.size,
    };
};

export const geminiConfig = {
    model: 'gemini-1.5-flash',  // Using 1.5-flash for better free tier rate limits
    generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 8192,
    },
    safetySettings: [
        {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
        {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
        {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
        {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
    ],
};
