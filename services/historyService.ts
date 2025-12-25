export interface HistoryItem {
    id: string;
    type: 'live' | 'image' | 'video';
    timestamp: string;
    description: string;
    objectCount: number;
    details: Record<string, number>; // e.g., { "person": 2, "car": 1 }
}

const STORAGE_KEY = 'visioniq_history';

export const getHistory = (): HistoryItem[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        console.error("Failed to load history", e);
        return [];
    }
};

export const addToHistory = (item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
    try {
        const history = getHistory();
        const newItem: HistoryItem = {
            ...item,
            id: Date.now().toString(),
            timestamp: new Date().toISOString()
        };
        // Add to beginning
        history.unshift(newItem);
        // Limit to 50 items to prevent storage overflow
        if (history.length > 50) {
            history.pop();
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
        return newItem;
    } catch (e) {
        console.error("Failed to save history", e);
    }
};

export const deleteFromHistory = (id: string) => {
    try {
        const history = getHistory();
        const updated = history.filter(item => item.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
    } catch (e) {
        console.error("Failed to delete history item", e);
    }
};

export const clearHistory = () => {
    localStorage.removeItem(STORAGE_KEY);
};
