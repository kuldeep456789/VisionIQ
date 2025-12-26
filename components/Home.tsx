import React, { useEffect, useRef } from 'react';

const Home: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.playbackRate = 0.7; // Slow down video for a more premium feel
        }
    }, []);

    return (
        <div className="flex flex-col min-h-screen bg-black text-white overflow-x-hidden font-sans scroll-smooth">
            {/* Hero Section */}
            <section className="relative h-screen flex items-center justify-center overflow-hidden">
                {/* Background Video */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black z-10" />
                    <img
                        src="https://images.unsplash.com/photo-1518932945647-7a1c969f8be2?q=80&w=2670&auto=format&fit=crop"
                        alt="Hero Background"
                        className="w-full h-full object-cover opacity-60"
                    />
                    {/* Note: In a real production build, replace the IMG above with a VIDEO tag like below for the requested video effect:
          <video 
            ref={videoRef}
            autoPlay 
            muted 
            loop 
            playsInline 
            className="w-full h-full object-cover opacity-50"
          >
            <source src="https://assets.mixkit.co/videos/preview/mixkit-artificial-intelligence-interface-992-large.mp4" type="video/mp4" />
          </video>
          */}
                </div>

                {/* Hero Content */}
                <div className="relative z-20 text-center px-4 max-w-5xl mx-auto animate-fade-in-up">
                    <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 drop-shadow-2xl">
                        VISIONIQ
                    </h1>
                    <p className="text-xl md:text-3xl font-light text-gray-300 mb-10 tracking-wide max-w-3xl mx-auto leading-relaxed">
                        The future of computer vision is here. <br className="hidden md:block" />
                        <span className="text-white font-medium">Real-time detection</span>, smart analytics, and instant insights.
                    </p>
                    <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
                        <button className="px-10 py-4 bg-white text-black text-lg font-bold rounded-full hover:bg-gray-200 transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                            Get Started
                        </button>
                        <button className="px-10 py-4 border border-white/30 backdrop-blur-sm bg-white/5 text-white text-lg font-medium rounded-full hover:bg-white/10 transition-all">
                            Watch Demo
                        </button>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce opacity-50">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                </div>
            </section>

            {/* Feature 1: Real-time Detection */}
            <section className="relative py-32 px-6 md:px-12 bg-black">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <div className="order-2 md:order-1 space-y-8">
                        <h2 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
                            See the World in <br /> Real-Time
                        </h2>
                        <p className="text-lg text-gray-400 leading-relaxed font-light">
                            Experience the power of advanced neural networks running directly in your browser. Identify objects, track movements, and gather data instantly with zero latency.
                        </p>
                        <ul className="space-y-4 text-gray-300">
                            <li className="flex items-center gap-4">
                                <span className="h-2 w-2 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.8)]"></span>
                                <span>Millisecond latency processing</span>
                            </li>
                            <li className="flex items-center gap-4">
                                <span className="h-2 w-2 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.8)]"></span>
                                <span>High-accuracy object classification</span>
                            </li>
                            <li className="flex items-center gap-4">
                                <span className="h-2 w-2 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.8)]"></span>
                                <span>Works on any modern device</span>
                            </li>
                        </ul>
                        <button className="group flex items-center gap-2 text-green-400 font-bold hover:text-green-300 transition-colors">
                            Try Live Camera <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </button>
                    </div>

                    <div className="order-1 md:order-2 relative group">
                        <div className="absolute inset-0 bg-gradient-to-tr from-green-500/20 to-blue-500/20 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
                        <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 aspect-video">
                            <img
                                src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2670&auto=format&fit=crop"
                                alt="AI Detection Interface"
                                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-all">
                                <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature 2: Analytics */}
            <section className="relative py-32 px-6 md:px-12 bg-zinc-950">
                {/* Subtle background glow */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -left-[20%] top-[20%] w-[50%] h-[50%] bg-purple-900/10 rounded-full blur-[100px]"></div>
                </div>

                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-tl from-purple-500/20 to-pink-500/20 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
                        <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 aspect-square md:aspect-[4/3]">
                            <img
                                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2670&auto=format&fit=crop"
                                alt="Analytics Dashboard"
                                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                            />
                        </div>
                    </div>

                    <div className="space-y-8">
                        <h2 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                            Deep Insights <br /> & Analytics
                        </h2>
                        <p className="text-lg text-gray-400 leading-relaxed font-light">
                            Turn raw detections into actionable data. Our dashboard provides comprehensive analytics, helping you understand trends and patterns in your visual data.
                        </p>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="p-6 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                                <h3 className="text-3xl font-bold text-white mb-2">99%</h3>
                                <p className="text-sm text-gray-400 uppercase tracking-widest">Accuracy</p>
                            </div>
                            <div className="p-6 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                                <h3 className="text-3xl font-bold text-white mb-2">24/7</h3>
                                <p className="text-sm text-gray-400 uppercase tracking-widest">Monitoring</p>
                            </div>
                        </div>
                        <button className="group flex items-center gap-2 text-purple-400 font-bold hover:text-purple-300 transition-colors">
                            Explore Dashboard <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </button>
                    </div>
                </div>
            </section>

            {/* Feature 3: History & Security */}
            <section className="relative py-32 px-6 md:px-12 bg-black">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <div className="order-2 md:order-1 space-y-8">
                        <h2 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-500">
                            Secure History <br /> & Retrieval
                        </h2>
                        <p className="text-lg text-gray-400 leading-relaxed font-light">
                            Never miss a moment. All detections are securely stored and easily retrievable. Browse through your detection history with our intuitive timeline interface.
                        </p>
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-4 p-4 rounded-lg bg-gray-900 border border-gray-800">
                                <div className="p-2 bg-blue-500/20 rounded-md">
                                    <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="text-white font-medium">End-to-End Encryption</h4>
                                    <p className="text-sm text-gray-500">Your visual data is private and secure.</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-4 rounded-lg bg-gray-900 border border-gray-800">
                                <div className="p-2 bg-cyan-500/20 rounded-md">
                                    <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="text-white font-medium">Instant Retrieval</h4>
                                    <p className="text-sm text-gray-500">Search and filter thousands of events in seconds.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="order-1 md:order-2 relative group">
                        <div className="absolute inset-0 bg-gradient-to-bl from-cyan-500/20 to-blue-500/20 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
                        <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 aspect-video">
                            <img
                                src="https://images.unsplash.com/photo-1549605655-3911cd16398d?q=80&w=2670&auto=format&fit=crop"
                                alt="History Interface"
                                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-20 px-6 border-t border-white/10 bg-zinc-950">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
                    <div className="text-center md:text-left">
                        <h2 className="text-2xl font-bold text-white mb-2">VISIONIQ</h2>
                        <p className="text-gray-500 text-sm">© 2024 VisionIQ Inc. All rights reserved.</p>
                    </div>
                    <div className="flex items-center gap-8">
                        <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy</a>
                        <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms</a>
                        <a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a>
                        <div className="w-px h-6 bg-gray-800 mx-2 hidden md:block"></div>
                        <div className="flex gap-4">
                            <svg className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" /></svg>
                            <svg className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;
