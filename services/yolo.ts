import { GoogleGenAI, Type } from "@google/genai";

let ai: GoogleGenAI;
// Initialize the GoogleGenAI instance lazily
function getAi() {
  if (!ai) {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });
  }
  return ai;
}

const model = 'gemini-2.0-flash-exp';

const detectionSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      label: {
        type: Type.STRING,
        description: 'The identified object (e.g., "person", "car", "chair").'
      },
      box: {
        type: Type.OBJECT,
        properties: {
          x: { type: Type.NUMBER, description: 'Normalized x coordinate (0-1)' },
          y: { type: Type.NUMBER, description: 'Normalized y coordinate (0-1)' },
          width: { type: Type.NUMBER, description: 'Normalized width (0-1)' },
          height: { type: Type.NUMBER, description: 'Normalized height (0-1)' }
        }
      }
    }
  }
};

export async function detectObjects(imageBase64: string) {
  const ai = getAi();
  const result = await ai.generateContent({
    contents: [{
      role: 'user',
      parts: [
        { text: 'Detect objects in this image. Return a JSON array of objects, each with "label" and "box" containing normalized coordinates x, y, width, height.' },
        { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } }
      ]
    }],
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: detectionSchema
    }
  });
  return JSON.parse(result.response.text());
}