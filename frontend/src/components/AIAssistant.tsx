import React, { useState, useEffect } from 'react';
import { getHistory } from '../services/historyService';
import { getSecurityInsights } from '../services/aiService';

const AIAssistant: React.FC = () => {
    const [insights, setInsights] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [history, setHistory] = useState<any[]>([]);

    useEffect(() => {
        const data = getHistory();
        setHistory(data);
    }, []);

    const generateInsights = async () => {
        setLoading(true);
        const result = await getSecurityInsights(history);
        setInsights(result);
        setLoading(false);
    };

    return (
        <div className="flex flex-col h-full bg-light-background dark:bg-gray-dark text-light-text dark:text-white p-6">
            <div className="bg-white dark:bg-gray-medium rounded-2xl shadow-xl border border-light-border dark:border-gray-light overflow-hidden">
                <div className="bg-gradient-to-r from-brand-blue to-brand-blue-light p-6 text-white">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-2xl font-black uppercase tracking-tight">AI Security Assistant</h2>
                            <p className="text-blue-100 text-sm">Powered by Gemini AI • Log Analysis & Insights</p>
                        </div>
                    </div>
                </div>

                <div className="p-8">
                    {insights ? (
                        <div className="space-y-6">
                            <div className="prose dark:prose-invert max-w-none">
                                <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl border border-gray-100 dark:border-gray-800 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex items-center gap-2 mb-4 text-brand-blue dark:text-brand-blue-light font-bold">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                                        </svg>
                                        AI Analysis Report
                                    </div>
                                    <div className="whitespace-pre-wrap leading-relaxed">
                                        {insights}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={generateInsights}
                                disabled={loading}
                                className="flex items-center gap-2 px-6 py-3 bg-brand-blue hover:bg-brand-blue-light text-white rounded-xl font-bold transition-all shadow-lg active:scale-95 disabled:opacity-50"
                            >
                                {loading ? 'Analyzing...' : 'Refresh Insights'}
                            </button>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="mb-6 flex justify-center">
                                <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-brand-blue">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 1.332-7.257 3 3 0 0 0-3.758-3.848 5.25 5.25 0 0 0-10.233 2.33A4.502 4.502 0 0 0 2.25 15Z" />
                                    </svg>
                                </div>
                            </div>
                            <h3 className="text-xl font-bold mb-2">Generate Intelligence</h3>
                            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-8">
                                Let our AI analyze your recent detection patterns to identify potential security gaps or behavioral trends.
                            </p>
                            <button
                                onClick={generateInsights}
                                disabled={loading}
                                className="inline-flex items-center gap-2 px-8 py-4 bg-brand-blue hover:bg-brand-blue-light text-white rounded-2xl font-black text-lg transition-all shadow-xl hover:shadow-brand-blue/20 active:scale-95 disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                                        Processing Logs...
                                    </>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 0 0-2.58 5.84m2.699-2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 0 1-2.448-2.448 14.9 14.9 0 0 1 .06-.312m-2.24 2.39a4.493 4.493 0 0 0-1.757 4.306 4.493 4.493 0 0 0 4.306-1.758M16.5 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
                                        </svg>
                                        Run Security Audit
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AIAssistant;
