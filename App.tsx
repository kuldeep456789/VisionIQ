import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Analytics from './components/Analytics';
import Settings from './components/Settings';
import LoginPage from './components/LoginPage';
import { Bars3Icon } from './components/icons/Bars3Icon';
import { ArrowRightOnRectangleIcon } from './components/icons/ArrowRightOnRectangleIcon';

type View = 'dashboard' | 'analytics' | 'settings';

interface User {
  name: string;
  email: string;
  profilePicture: string; // URL or emoji
}

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(window.innerWidth > 768);
  const [user, setUser] = useState<User>({ name: 'Admin User', email: 'admin@visioniq.io', profilePicture: 'https://i.pravatar.cc/40?u=admin'});

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  const renderView = () => {
    switch (currentView) {
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <Settings user={user} setUser={setUser} />;
      case 'dashboard':
      default:
        return <Dashboard />;
    }
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-light-bg dark:bg-gray-900 font-sans text-light-text dark:text-gray-200">
      {/* Backdrop for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
      <Sidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView}
        isOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        />
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'md:ml-64' : 'md:ml-20'}`}>
        <header className="flex items-center justify-between p-4 bg-light-secondary dark:bg-gray-medium border-b border-light-border dark:border-gray-light shadow-sm">
          <div className="flex items-center space-x-3">
             <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-light">
                <Bars3Icon className="h-6 w-6"/>
            </button>
          </div>
          <div className="flex items-center space-x-4">
             <span className="text-sm hidden sm:inline">Welcome, {user.name}</span>
             {user.profilePicture.startsWith('http') || user.profilePicture.startsWith('data:') ? (
                <img src={user.profilePicture} alt="Admin" className="rounded-full w-10 h-10 border-2 border-brand-blue-light object-cover" />
            ) : (
                <div className="rounded-full w-10 h-10 border-2 border-brand-blue-light bg-gray-200 dark:bg-gray-light flex items-center justify-center text-2xl" aria-label="User Emoji Profile Picture">
                    {user.profilePicture}
                </div>
            )}
             <button onClick={handleLogout} title="Sign Out" className="flex items-center gap-2 px-3 py-2 text-sm font-semibold bg-gray-200 dark:bg-gray-light hover:bg-red-200 dark:hover:bg-accent-red rounded-md transition-colors">
                <ArrowRightOnRectangleIcon className="w-5 h-5"/>
             </button>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-light-bg dark:bg-gray-dark p-4 md:p-6 lg:p-8">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

export default App;