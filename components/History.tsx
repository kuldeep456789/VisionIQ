import React, { useEffect, useState } from 'react';
import { getHistory, deleteFromHistory, clearHistory, HistoryItem } from '../services/historyService';

const History: React.FC = () => {
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        setHistory(getHistory());
    }, []);

    const handleDelete = (id: string) => {
        if (window.confirm("Are you sure you want to delete this record?")) {
            const updated = deleteFromHistory(id);
            if (updated) setHistory(updated);
        }
    };

    const handleClearAll = () => {
        if (window.confirm("Are you sure you want to delete ALL history? This cannot be undone.")) {
            clearHistory();
            setHistory([]);
        }
    };

    const handleShare = (item: HistoryItem) => {
        const text = `VISIONIQ Analysis Report\nType: ${item.type.toUpperCase()}\nDate: ${new Date(item.timestamp).toLocaleString()}\nObjects: ${item.objectCount}\n${item.description}`;
        navigator.clipboard.writeText(text).then(() => {
            alert("Analysis details copied to clipboard!");
        });
    };

    const handlePrint = (item: HistoryItem) => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                <head>
                    <title>Analysis Report - ${item.id}</title>
                    <style>
                        body { font-family: sans-serif; padding: 20px; text-align: center; }
                        h1 { color: #333; }
                        .meta { color: #666; margin-bottom: 20px; }
                        .stats { display: inline-block; text-align: left; background: #f9f9f9; padding: 20px; border-radius: 8px; }
                        .stat-row { display: flex; justify-content: space-between; border-bottom: 1px solid #eee; padding: 5px 0; min-width: 300px; }
                    </style>
                </head>
                <body>
                    <h1>VISIONIQ Analysis Report</h1>
                    <div className="meta">
                        <p><strong>Type:</strong> ${item.type.toUpperCase()}</p>
                        <p><strong>Date:</strong> ${new Date(item.timestamp).toLocaleString()}</p>
                    </div>
                    <div class="stats">
                        <h3>Detection Results</h3>
                        <div class="stat-row"><strong>Total Objects:</strong> <span>${item.objectCount}</span></div>
                        ${Object.entries(item.details).map(([key, val]) => `
                            <div class="stat-row"><strong>${key}:</strong> <span>${val}</span></div>
                        `).join('')}
                    </div>
                </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
        }
    };

    const filteredHistory = history.filter(item =>
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full bg-light-background dark:bg-gray-dark text-light-text dark:text-white overflow-hidden">
            <div className="p-6 border-b border-light-border dark:border-gray-light flex justify-between items-center bg-white dark:bg-gray-800 shadow-sm z-10">
                <h1 className="text-2xl font-bold">Detection History</h1>
                <div className="flex gap-4">
                    <input
                        type="text"
                        placeholder="Search history..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    />
                    {history.length > 0 && (
                        <button
                            onClick={handleClearAll}
                            className="text-red-500 hover:text-red-700 font-semibold text-sm transition-colors"
                        >
                            Clear All
                        </button>
                    )}
                </div>
            </div>

            <div className="flex-grow overflow-auto p-6">
                {filteredHistory.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mb-4 opacity-50">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                        <p className="text-lg font-medium">No history found</p>
                        <p className="text-sm">Analysis records will appear here.</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {['live', 'image', 'video'].map(type => {
                            const itemsOfType = filteredHistory.filter(item => item.type === type);
                            if (itemsOfType.length === 0) return null;

                            return (
                                <div key={type} className="space-y-4">
                                    <h2 className="text-xl font-bold capitalize flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
                                        <span className={`px-3 py-1 text-sm font-bold rounded uppercase tracking-wider text-white ${type === 'live' ? 'bg-red-500' :
                                                type === 'video' ? 'bg-purple-500' : 'bg-blue-500'
                                            }`}>
                                            {type}
                                        </span>
                                        <span className="text-gray-500 dark:text-gray-400 text-sm font-normal">
                                            ({itemsOfType.length} {itemsOfType.length === 1 ? 'record' : 'records'})
                                        </span>
                                    </h2>
                                    <div className="space-y-3">
                                        {itemsOfType.map(item => (
                                            <div key={item.id} className="bg-white dark:bg-gray-medium rounded-lg shadow-sm border border-light-border dark:border-gray-light p-4 hover:shadow-md transition-shadow">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="flex-grow">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h3 className="font-bold text-lg">{item.objectCount} Objects Detected</h3>
                                                        </div>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            {new Date(item.timestamp).toLocaleString()}
                                                        </p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button onClick={() => handlePrint(item)} className="p-2 text-gray-500 hover:text-brand-blue transition-colors" title="Print/PDF">
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z" />
                                                            </svg>
                                                        </button>
                                                        <button onClick={() => handleShare(item)} className="p-2 text-gray-500 hover:text-green-500 transition-colors" title="Copy Details">
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
                                                            </svg>
                                                        </button>
                                                        <button onClick={() => handleDelete(item.id)} className="p-2 text-gray-500 hover:text-red-500 transition-colors" title="Delete">
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="bg-gray-50 dark:bg-gray-dark rounded-md p-3">
                                                    <h4 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Detected Objects:</h4>
                                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                                        {Object.entries(item.details).map(([label, count]) => (
                                                            <div key={label} className="flex justify-between items-center bg-white dark:bg-gray-800 px-3 py-1.5 rounded text-sm">
                                                                <span className="font-medium capitalize">{label}</span>
                                                                <span className="font-bold text-brand-blue">{count}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default History;
