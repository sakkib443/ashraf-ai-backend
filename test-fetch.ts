import dotenv from 'dotenv';
dotenv.config();

// Native fetch in Node 18+
const runTest = async () => {
    const apiKey = process.env.GEMINI_API_KEY;
    // Using v1beta API directly
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro:generateContent?key=${apiKey}`;

    const body = {
        contents: [{
            parts: [{ text: "Hello" }]
        }]
    };

    console.log("Fetching from:", url.replace(apiKey!, 'HIDDEN_KEY'));

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const data: any = await response.json();

        if (response.ok) {
            console.log("SUCCESS!");
            console.log(data.candidates[0].content.parts[0].text);
        } else {
            console.log("FAILED Status:", response.status);
            console.log("Error:", JSON.stringify(data, null, 2));
        }

    } catch (error) {
        console.error("Fetch Error:", error);
    }
};

runTest();
