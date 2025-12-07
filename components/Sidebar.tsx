import React from 'react';

type View = 'dashboard' | 'analytics' | 'settings';

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  isOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const NavItem: React.FC<{

  label: string;
  isActive: boolean;
  isOpen: boolean;
  onClick: () => void;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ label, isActive, isOpen, onClick, setIsSidebarOpen }) => {
  const handleClick = () => {
    onClick();
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      title={isOpen ? '' : label}
      className={`flex items-center w-full px-4 py-3 text-left text-gray-400 dark:text-gray-300 transition-colors duration-200 rounded-lg ${isActive
        ? 'bg-brand-blue text-white'
        : 'hover:bg-gray-200 dark:hover:bg-gray-light hover:text-light-text dark:hover:text-white'
        } ${!isOpen && 'justify-center'}`}
    >

      <span className={`mx-4 font-medium transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 absolute'}`}>{label}</span>
    </button>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, isOpen, setIsSidebarOpen }) => {
  return (
    <div className={`fixed inset-y-0 left-0 z-30 flex flex-col bg-light-secondary dark:bg-gray-medium border-r border-light-border dark:border-gray-light transition-all duration-300 ${isOpen ? 'w-64' : 'w-20'}`}>
      <div className={`flex items-center h-[68px] border-b border-light-border dark:border-gray-light ${isOpen ? 'px-4 justify-between' : 'justify-center'}`}>
        <div className="flex items-center min-w-0">

          {isOpen && <span className="ml-3 text-xl font-bold truncate">VISIONIQ</span>}
        </div>
        {isOpen && (
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-1 rounded-full text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-light md:hidden"
            title="Close sidebar"
          >
            Close
          </button>
        )}
      </div>
      <div className="flex flex-col flex-1 p-4 space-y-2">
        <NavItem

          label="Dashboard"
          isActive={currentView === 'dashboard'}
          isOpen={isOpen}
          onClick={() => setCurrentView('dashboard')}
          setIsSidebarOpen={setIsSidebarOpen}
        />
        <NavItem

          label="Analytics"
          isActive={currentView === 'analytics'}
          isOpen={isOpen}
          onClick={() => setCurrentView('analytics')}
          setIsSidebarOpen={setIsSidebarOpen}
        />
        <NavItem

          label="Settings"
          isActive={currentView === 'settings'}
          isOpen={isOpen}
          onClick={() => setCurrentView('settings')}
          setIsSidebarOpen={setIsSidebarOpen}
        />
      </div>
      <div className="p-4 border-t border-light-border dark:border-gray-light">
        <div className={`text-center text-xs text-gray-500 dark:text-gray-400`}>
          {isOpen ? (
            <>
              <p>VISIONIQ v1.0</p>
              <p>&copy; 2024. All rights reserved.</p>
            </>
          ) : (
            <p>v1.0</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;