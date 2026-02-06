import { GoogleGenerativeAI } from "@google/generative-ai";

export async function getSecurityInsights(historyData: any) {
    const API_KEY = localStorage.getItem('gemini_api_key');
    if (!API_KEY) return "AI API Key not configured. Please add your Gemini API key in Settings.";

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
        You are a Security AI Assistant for VISIONIQ, an AI-powered surveillance system.
        Analyze the following detection history and provide 3 key security insights or recommendations.
        Format your response as a concise list with icons.
        
        History: ${JSON.stringify(historyData)}
    `;

    try {
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.error("AI Insight Error:", error);
        return "Failed to generate AI insights. Please check your connection or API key.";
    }
}
