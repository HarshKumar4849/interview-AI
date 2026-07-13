const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

async function test() {
    const ai = new GoogleGenAI({
        apiKey: process.env.GOOGLE_GENAI_API_KEY,
    });

    const models = [
        "models/gemini-3.5-flash",
        "models/gemini-3.1-flash-lite",
        "models/gemini-flash-latest",
        "models/gemini-pro-latest",
        "models/gemini-2.0-flash-lite",
        "models/gemini-3-flash-preview",
        "models/gemini-2.0-flash"
    ];

    for (const model of models) {
        try {
            console.log("Testing model:", model);
            const response = await ai.models.generateContent({
                model: model,
                contents: "Say hello",
            });
            console.log(`Model ${model} worked! Output: ${response.text.trim()}`);
        } catch (err) {
            console.error(`Model ${model} failed:`, err.message || err);
        }
    }
}

test().catch(console.error);