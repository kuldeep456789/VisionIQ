import React from 'react';

const EMOJIS = ['👨‍💻', '👩‍🔬', '🚀', '🤖', '💡', '🧠', '🕶️', '👑', '😎', '🤓', '😇', '🥸'];

interface EmojiPickerProps {
    onSelect: (emoji: string) => void;
    onClose: () => void;
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({ onSelect, onClose }) => {
    const handleSelect = (emoji: string) => {
        onSelect(emoji);
        onClose();
    };

    // Use a keydown listener to close on 'Escape' key
    React.useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    return (
        <div 
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" 
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="emoji-picker-title"
        >
            <div 
                className="bg-light-secondary dark:bg-gray-medium p-6 rounded-lg shadow-xl w-full max-w-xs" 
                onClick={e => e.stopPropagation()}
            >
                <h3 id="emoji-picker-title" className="text-lg font-semibold mb-4 text-center">Choose an Emoji</h3>
                <div className="grid grid-cols-4 gap-4">
                    {EMOJIS.map(emoji => (
                        <button
                            key={emoji}
                            onClick={() => handleSelect(emoji)}
                            className="text-4xl p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-light focus:outline-none focus:ring-2 focus:ring-brand-blue transition-colors"
                            aria-label={`Select emoji ${emoji}`}
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default EmojiPicker;
