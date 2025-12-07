import React from 'react';

type View = 'dashboard' | 'analytics' | 'settings';

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  isOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  user: {
    name: string;
    email: string;
    profilePicture?: string;
  };
  onLogout: () => void;
}

const NavItem: React.FC<{
  label: string;
  isActive: boolean;
  isOpen: boolean;
  onClick: () => void;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  icon: React.ReactNode;
}> = ({ label, isActive, isOpen, onClick, setIsSidebarOpen, icon }) => {
  const handleClick = () => {
    onClick();
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      title={isOpen ? '' : label}
      className={`flex items-center w-full px-4 py-3 text-left transition-all duration-200 rounded-lg group ${isActive
          ? 'bg-brand-blue text-white'
          : 'text-gray-400 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-light hover:text-light-text dark:hover:text-white'
        } ${!isOpen && 'justify-center'}`}
    >
      <div className="flex-shrink-0">{icon}</div>
      <span
        className={`ml-4 font-medium whitespace-nowrap transition-all duration-300 ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none absolute'
          }`}
      >
        {label}
      </span>
    </button>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, isOpen, setIsSidebarOpen, user, onLogout }) => {
  return (
    <div
      className={`fixed inset-y-0 left-0 z-30 flex flex-col bg-light-secondary dark:bg-gray-medium border-r border-light-border dark:border-gray-light transition-all duration-300 ease-in-out ${isOpen ? 'w-64' : 'w-20'
        } ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
    >
      {/* Header with Toggle Button */}
      <div
        className={`flex items-center h-16 lg:h-[68px] border-b border-light-border dark:border-gray-light ${isOpen ? 'px-4 justify-between' : 'justify-center'
          }`}
      >
        <button
          onClick={() => setIsSidebarOpen(!isOpen)}
          className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-light transition-colors touch-manipulation"
          title={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className={`w-6 h-6 transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
        {isOpen && <span className="ml-3 text-lg lg:text-xl font-bold truncate">VISIONIQ</span>}
      </div>

      {/* Navigation Items */}
      <div className="flex flex-col flex-1 p-3 lg:p-4 space-y-1 lg:space-y-2 overflow-y-auto">
        <NavItem
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 lg:w-6 lg:h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
          }
          label="Dashboard"
          isActive={currentView === 'dashboard'}
          isOpen={isOpen}
          onClick={() => setCurrentView('dashboard')}
          setIsSidebarOpen={setIsSidebarOpen}
        />
        <NavItem
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 lg:w-6 lg:h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
            </svg>
          }
          label="Analytics"
          isActive={currentView === 'analytics'}
          isOpen={isOpen}
          onClick={() => setCurrentView('analytics')}
          setIsSidebarOpen={setIsSidebarOpen}
        />
        <NavItem
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 lg:w-6 lg:h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
          }
          label="Settings"
          isActive={currentView === 'settings'}
          isOpen={isOpen}
          onClick={() => setCurrentView('settings')}
          setIsSidebarOpen={setIsSidebarOpen}
        />
      </div>

      {/* User Profile Footer with Sign Out */}
      <div className="border-t border-light-border dark:border-gray-light">
        {/* User Profile */}
        <div className="p-3 lg:p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-brand-blue flex items-center justify-center flex-shrink-0 overflow-hidden">
              {user.profilePicture && (user.profilePicture.startsWith('http') || user.profilePicture.startsWith('data:')) ? (
                <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-white">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
              )}
            </div>
            <div
              className={`ml-3 min-w-0 transition-all duration-300 ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none absolute'
                }`}
            >
              <p className="text-sm font-medium text-light-text dark:text-white truncate">{user.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Sign Out Button */}
        <div className="px-3 lg:px-4 pb-3 lg:pb-4">
          <button
            onClick={onLogout}
            title={isOpen ? '' : 'Sign Out'}
            className={`flex items-center w-full px-4 py-3 text-left transition-all duration-200 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 touch-manipulation ${!isOpen && 'justify-center'
              }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 lg:w-6 lg:h-6 flex-shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" />
            </svg>
            <span
              className={`ml-4 font-medium whitespace-nowrap transition-all duration-300 ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none absolute'
                }`}
            >
              Sign Out
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;