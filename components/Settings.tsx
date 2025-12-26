import React, { useState, useEffect, useRef } from 'react';
import EmojiPicker from './EmojiPicker';
import { User } from '../types';

const SettingsCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-light-secondary dark:bg-gray-medium p-4 md:p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-semibold mb-4 border-b border-light-border dark:border-gray-light pb-3">{title}</h3>
        <div className="space-y-4">{children}</div>
    </div>
);



interface SettingsProps {
    user: User;
    setUser: React.Dispatch<React.SetStateAction<User>>;
}

const Settings: React.FC<SettingsProps> = ({ user, setUser }) => {
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
    const [showSuccess, setShowSuccess] = useState(false);
    const [formData, setFormData] = useState<User>(user);
    const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        setFormData(user);
    }, [user]);

    const handleThemeToggle = () => {
        setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setFormData(prev => ({ ...prev, profilePicture: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleEmojiSelect = (emoji: string) => {
        setFormData(prev => ({ ...prev, profilePicture: emoji }));
    };

    const handleSaveChanges = () => {
        setUser(formData);
        setShowSuccess(true);
        setTimeout(() => {
            setShowSuccess(false);
        }, 2000);
    };

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6">Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-8">
                    <SettingsCard title="User Profile">
                        <div className="flex flex-col items-center sm:flex-row gap-6">
                            {formData.profilePicture?.startsWith('http') || formData.profilePicture?.startsWith('data:') ? (
                                <img src={formData.profilePicture} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-brand-blue-light" />
                            ) : (
                                <div className="w-24 h-24 rounded-full border-4 border-brand-blue-light bg-gray-200 dark:bg-gray-light flex items-center justify-center text-5xl">
                                    {formData.profilePicture}
                                </div>
                            )}
                            <div className="flex-grow w-full">
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full text-center px-4 py-2 text-sm font-semibold bg-gray-200 dark:bg-gray-light hover:bg-gray-300 dark:hover:bg-brand-blue-light rounded-md transition-colors">
                                        Upload Picture
                                    </button>
                                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                                    <button
                                        onClick={() => setIsEmojiPickerOpen(true)}
                                        className="w-full text-center px-4 py-2 text-sm font-semibold bg-gray-200 dark:bg-gray-light hover:bg-gray-300 dark:hover:bg-brand-blue-light rounded-md transition-colors">
                                        Choose Emoji
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center sm:text-left">Recommended: Square image, 200x200px.</p>
                            </div>
                        </div>
                        <hr className="border-light-border dark:border-gray-light" />
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</label>
                            <input type="text" id="name" value={formData.name} onChange={handleInputChange} className="mt-1 block w-full bg-gray-100 dark:bg-gray-dark border border-light-border dark:border-gray-light rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-blue focus:border-brand-blue" />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-500 dark:text-gray-400">Email Address</label>
                            <input type="email" id="email" value={formData.email} onChange={handleInputChange} className="mt-1 block w-full bg-gray-100 dark:bg-gray-dark border border-light-border dark:border-gray-light rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-blue focus:border-brand-blue" />
                        </div>
                        <div>
                            <button className="text-sm text-brand-blue-light font-semibold hover:underline">Change Password</button>
                        </div>
                    </SettingsCard>

                    <SettingsCard title="Appearance">
                        <div className="flex items-center justify-between">
                            <span className="font-medium">Enable Dark Mode</span>
                            <label htmlFor="theme-toggle" className="inline-flex relative items-center cursor-pointer">
                                <input type="checkbox" id="theme-toggle" className="sr-only peer" checked={theme === 'dark'} onChange={handleThemeToggle} />
                                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-brand-blue dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-blue"></div>
                            </label>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Switch between light and dark themes for the dashboard.</p>
                    </SettingsCard>
                </div>
                <div className="space-y-8">
                    <SettingsCard title="Notification Preferences">
                        <label className="flex items-center">
                            <input type="checkbox" className="h-5 w-5 bg-gray-100 dark:bg-gray-light border-light-border dark:border-gray-light text-brand-blue rounded focus:ring-brand-blue" defaultChecked />
                            <span className="ml-3">Email alerts for critical events</span>
                        </label>
                        <label className="flex items-center">
                            <input type="checkbox" className="h-5 w-5 bg-gray-100 dark:bg-gray-light border-light-border dark:border-gray-light text-brand-blue rounded focus:ring-brand-blue" />
                            <span className="ml-3">SMS alerts for critical events</span>
                        </label>
                        <label className="flex items-center">
                            <input type="checkbox" className="h-5 w-5 bg-gray-100 dark:bg-gray-light border-light-border dark:border-gray-light text-brand-blue rounded focus:ring-brand-blue" defaultChecked />
                            <span className="ml-3">Enable sound alarms on dashboard</span>
                        </label>
                    </SettingsCard>
                    <SettingsCard title="Global Privacy">
                        <label className="flex items-center">
                            <input type="checkbox" className="h-5 w-5 bg-gray-100 dark:bg-gray-light border-light-border dark:border-gray-light text-brand-blue rounded focus:ring-brand-blue" />
                            <span className="ml-3">Enable face blurring on all cameras by default</span>
                        </label>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">This can be overridden on individual camera views.</p>
                    </SettingsCard>
                </div>
            </div>
            <div className="mt-8 flex justify-end">
                <button
                    onClick={handleSaveChanges}
                    className="bg-brand-blue hover:bg-brand-blue-light text-white font-bold py-2 px-6 rounded-lg transition-colors relative"
                >
                    {showSuccess ? 'Saved!' : 'Save Changes'}
                </button>
            </div>
            {isEmojiPickerOpen && (
                <EmojiPicker
                    onSelect={handleEmojiSelect}
                    onClose={() => setIsEmojiPickerOpen(false)}
                />
            )}
        </div>
    );
};

export default Settings;