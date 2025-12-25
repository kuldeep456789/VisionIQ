import React from 'react';

const Home: React.FC = () => {
    return (
        <div className="flex flex-col h-full bg-light-background dark:bg-gray-dark text-light-text dark:text-white overflow-auto">
            <div className="p-8">
                <div className="max-w-6xl mx-auto">
                    {/* Welcome Section */}
                    <div className="mb-12 text-center">
                        <h1 className="text-4xl font-bold mb-4">Welcome to VISIONIQ</h1>
                        <p className="text-xl text-gray-600 dark:text-gray-400">
                            AI-Powered Object Detection & Analysis Platform
                        </p>
                    </div>

                    {/* Quick Access Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                        <div className="bg-white dark:bg-gray-medium rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow border border-light-border dark:border-gray-light">
                            <div className="flex items-center mb-4">
                                <div className="p-3 bg-blue-500 rounded-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-white">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold ml-4">Analytics</h3>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400">
                                View real-time detection analytics and live camera feeds
                            </p>
                        </div>

                        <div className="bg-white dark:bg-gray-medium rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow border border-light-border dark:border-gray-light">
                            <div className="flex items-center mb-4">
                                <div className="p-3 bg-purple-500 rounded-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-white">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold ml-4">History</h3>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400">
                                Review past detection records and analysis results
                            </p>
                        </div>

                        <div className="bg-white dark:bg-gray-medium rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow border border-light-border dark:border-gray-light">
                            <div className="flex items-center mb-4">
                                <div className="p-3 bg-green-500 rounded-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-white">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold ml-4">Settings</h3>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400">
                                Configure your profile and application preferences
                            </p>
                        </div>
                    </div>

                    {/* Features Section */}
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-8 text-white">
                        <h2 className="text-2xl font-bold mb-4">Platform Features</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-start">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-3 flex-shrink-0 mt-1">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                </svg>
                                <div>
                                    <h3 className="font-semibold mb-1">Real-time Detection</h3>
                                    <p className="text-sm opacity-90">Live object detection using your device camera</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-3 flex-shrink-0 mt-1">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                </svg>
                                <div>
                                    <h3 className="font-semibold mb-1">Image Analysis</h3>
                                    <p className="text-sm opacity-90">Upload and analyze static images for object detection</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-3 flex-shrink-0 mt-1">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                </svg>
                                <div>
                                    <h3 className="font-semibold mb-1">Video Processing</h3>
                                    <p className="text-sm opacity-90">Frame-by-frame video analysis with object tracking</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-3 flex-shrink-0 mt-1">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                </svg>
                                <div>
                                    <h3 className="font-semibold mb-1">Detection History</h3>
                                    <p className="text-sm opacity-90">Store and review all your analysis results</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
