import { GoogleGenAI, Type } from "@google/genai";

let ai: GoogleGenAI;
// Initialize the GoogleGenAI instance lazily
function getAi() {
    if (!ai) {
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    }
    return ai;
}

const model = 'gemini-2.5-flash';

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
                description: 'The bounding box of the object.',
                properties: {
                    x: { type: Type.NUMBER, description: 'Normalized x-coordinate of the top-left corner (0-1).' },
                    y: { type: Type.NUMBER, description: 'Normalized y-coordinate of the top-left corner (0-1).' },
                    width: { type: Type.NUMBER, description: 'Normalized width of the box (0-1).' },
                    height: { type: Type.NUMBER, description: 'Normalized height of the box (0-1).' },
                },
                required: ['x', 'y', 'width', 'height'],
            }
        },
        required: ['label', 'box']
    }
};

/**
 * Sends image data to the Gemini API to detect objects.
 * @param base64ImageData The base64-encoded image string (without the data URI prefix).
 * @returns A promise that resolves to an array of detected objects.
 */
export async function detectObjects(base64ImageData: string): Promise<any[]> {
    try {
        const aiInstance = getAi();
        const response = await aiInstance.models.generateContent({
            model,
            contents: {
                parts: [
                    {
                        inlineData: {
                            mimeType: 'image/jpeg',
                            data: base64ImageData,
                        },
                    },
                    {
                        text: "Detect all distinct objects in this image. For each object, provide a descriptive label and its normalized bounding box coordinates (x, y, width, height).",
                    },
                ],
            },
            config: {
                responseMimeType: 'application/json',
                responseSchema: detectionSchema,
            },
        });
        
        const jsonString = response.text.trim();
        const parsedResults = JSON.parse(jsonString);

        return Array.isArray(parsedResults) ? parsedResults : [];
    } catch (error) {
        console.error('Error calling Gemini API:', error);
        let errorMessage = "An unknown error occurred during analysis.";
        if (error instanceof Error) {
            errorMessage = error.message;
            // Attempt to parse nested Gemini error to get a more specific message
            try {
                // Gemini API often wraps the actual error in a JSON string within the message
                const errorBody = JSON.parse(errorMessage.match(/\[\s*(\d{3})\s*[^\]]*\]\s*(.*)/)?.[2] || errorMessage);
                 if (errorBody.error && errorBody.error.message) {
                    errorMessage = errorBody.error.message;
                }
            } catch (e) {
                // Not a JSON error message, use the original message.
            }
        }
        throw new Error(errorMessage);
    }
}