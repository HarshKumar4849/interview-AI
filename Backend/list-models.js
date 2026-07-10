const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

async function main() {
    const ai = new GoogleGenAI({
        apiKey: process.env.GOOGLE_GENAI_API_KEY,
    });

    const models = await ai.models.list();

    for await (const model of models) {
        console.log(model.name);
    }
}

main().catch(console.error);