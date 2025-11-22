/**
 * Sends image data to the local Python backend to detect objects.
 * @param base64ImageData The base64-encoded image string (without the data URI prefix).
 * @returns A promise that resolves to an array of detected objects.
 */
export async function detectObjects(base64ImageData: string): Promise<any[]> {
    try {
        const response = await fetch('http://localhost:5000/detect', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ image: base64ImageData }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to detect objects');
        }

        const detections = await response.json();
        return detections;
    } catch (error) {
        console.error('Error calling detection backend:', error);
        throw error;
    }
}