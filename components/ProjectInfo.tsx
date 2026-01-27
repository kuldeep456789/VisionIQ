import React from 'react';

const ProjectInfo: React.FC = () => {
    return (
        <div className="relative h-full flex flex-col justify-center items-start text-white overflow-hidden bg-gray-900 font-sans">
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?q=80&w=2670&auto=format&fit=crop"
                    alt="Crowd Detection"
                    className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
            </div>

            <div className="relative z-10 max-w-4xl px-8 md:px-16 animate-fade-in-up">
                <div className="mb-6 opacity-80">
                    <span className="text-sm font-bold tracking-[0.2em] uppercase text-blue-400">Project Overview</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6 drop-shadow-lg">
                    AI-POWERED <br />
                    CROWD INTELLIGENCE.
                </h1>

                <p className="text-lg md:text-2xl font-light text-gray-200 mb-10 max-w-2xl leading-relaxed drop-shadow-md">
                    VISIONIQ revolutionizes safety and analytics with real-time crowd detection.
                    Monitor density, prevent hazards, and gain actionable insights instantly.
                </p>

                <button className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-lg rounded shadow-lg transition-all transform hover:-translate-y-1">
                    Discover Now
                </button>
            </div>

            <div className="absolute bottom-10 right-10 z-10 text-right opacity-80 hidden md:block">
                <div className="text-white font-bold text-3xl tracking-tighter">VISIONIQ</div>
                <div className="text-xs text-gray-300 uppercase tracking-widest mt-1">Next Gen Surveillance</div>
            </div>
        </div>
    );
};

export default ProjectInfo;
