const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

async function test() {
    const ai = new GoogleGenAI({
        apiKey: process.env.GOOGLE_GENAI_API_KEY,
    });

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: "Say hello",
    });

    console.log(response.text);
}

test().catch(console.error);