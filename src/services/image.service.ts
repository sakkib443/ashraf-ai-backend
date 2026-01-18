/**
 * Image Generation Service using Pollinations AI
 * Completely FREE - No API key required!
 */

// Base URL for Pollinations AI
const POLLINATIONS_BASE_URL = 'https://image.pollinations.ai/prompt';

export interface ImageGenerationResult {
    success: boolean;
    imageUrl?: string;
    prompt?: string;
    error?: string;
}

/**
 * Detect if a message is an image generation request
 */
export function isImageRequest(message: string): boolean {
    const imageKeywords = [
        'create an image',
        'generate an image',
        'make an image',
        'draw',
        'create a picture',
        'generate a picture',
        'make a picture',
        'create image',
        'generate image',
        'make image',
        'image of',
        'picture of',
        'photo of',
        'illustration of',
        'artwork of',
        'design an image',
        'create art',
        'draw me',
        'paint',
        'visualize',
        'show me an image',
        'show me a picture',
        // Bengali keywords
        'ছবি তৈরি',
        'ছবি বানাও',
        'ইমেজ তৈরি',
        'ছবি দেখাও',
    ];

    const lowerMessage = message.toLowerCase();
    return imageKeywords.some(keyword => lowerMessage.includes(keyword));
}

/**
 * Extract the image prompt from user message
 */
export function extractImagePrompt(message: string): string {
    // Remove common prefixes
    const prefixes = [
        'create an image of',
        'generate an image of',
        'make an image of',
        'draw',
        'create a picture of',
        'generate a picture of',
        'make a picture of',
        'create image of',
        'generate image of',
        'make image of',
        'show me an image of',
        'show me a picture of',
        'an image of',
        'a picture of',
        'image of',
        'picture of',
        'photo of',
        'illustration of',
        'artwork of',
        'create art of',
        'paint',
        'visualize',
    ];

    let prompt = message;
    const lowerPrompt = prompt.toLowerCase();

    for (const prefix of prefixes) {
        if (lowerPrompt.includes(prefix)) {
            const index = lowerPrompt.indexOf(prefix);
            prompt = prompt.slice(index + prefix.length).trim();
            break;
        }
    }

    return prompt || message;
}

/**
 * Generate image using Pollinations AI
 */
export async function generateImage(prompt: string): Promise<ImageGenerationResult> {
    try {
        console.log(`🎨 Generating image for prompt: "${prompt}"`);

        // Enhance prompt for better results
        const enhancedPrompt = `${prompt}, high quality, detailed, professional`;

        // URL encode the prompt
        const encodedPrompt = encodeURIComponent(enhancedPrompt);

        // Generate timestamp to avoid caching
        const timestamp = Date.now();

        // Create the image URL with parameters
        // width=1024, height=1024, seed for randomness
        const imageUrl = `${POLLINATIONS_BASE_URL}/${encodedPrompt}?width=1024&height=1024&seed=${timestamp}&nologo=true`;

        console.log(`✅ Image URL generated: ${imageUrl}`);

        return {
            success: true,
            imageUrl,
            prompt: prompt,
        };
    } catch (error: any) {
        console.error('Image Generation Error:', error.message);
        return {
            success: false,
            error: error.message || 'Failed to generate image',
        };
    }
}

/**
 * Format image response for chat
 */
export function formatImageResponse(result: ImageGenerationResult): string {
    if (result.success && result.imageUrl) {
        return `🎨 **Image Generated Successfully!**

Here's your image based on: *"${result.prompt}"*

![Generated Image](${result.imageUrl})

*Powered by Pollinations AI - Free Image Generation*

---
💡 **Tips:** Be more specific with your prompts for better results! Try adding details like:
- Art style (realistic, anime, oil painting, digital art)
- Colors and mood (vibrant, dark, peaceful)
- Camera angle (close-up, wide shot, aerial view)`;
    } else {
        return `❌ Sorry, I couldn't generate the image. Error: ${result.error}

Please try again with a different prompt!`;
    }
}
