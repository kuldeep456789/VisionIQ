import React from 'react';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';

interface LoginPageProps {
    onLogin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onLogin();
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-dark">
            <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-medium rounded-2xl shadow-xl">
                <div className="text-center">
                    <div className="flex justify-center mb-4">
                       <ShieldCheckIcon className="h-12 w-12 text-blue-500" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Welcome to VISIONIQ
                    </h2>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        Sign in to access your dashboard
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="email-address" className="sr-only">Email address</label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-light placeholder-gray-500 text-gray-900 dark:text-white bg-white dark:bg-gray-dark rounded-t-md focus:outline-none focus:ring-brand-blue focus:border-brand-blue focus:z-10 sm:text-sm"
                                placeholder="Email address"
                                defaultValue="admin@visioniq.io"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-light placeholder-gray-500 text-gray-900 dark:text-white bg-white dark:bg-gray-dark rounded-b-md focus:outline-none focus:ring-brand-blue focus:border-brand-blue focus:z-10 sm:text-sm"
                                placeholder="Password"
                                defaultValue="password"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-brand-blue focus:ring-brand-blue-light border-gray-300 dark:border-gray-light rounded bg-gray-100 dark:bg-gray-dark"/>
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-400">
                                Remember me
                            </label>
                        </div>
                        <div className="text-sm">
                            <a href="#" className="font-medium text-brand-blue-light hover:text-brand-blue">
                                Forgot your password?
                            </a>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-brand-blue hover:bg-brand-blue-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue-light"
                        >
                            Sign in
                        </button>
                    </div>
                </form>
                 <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    Don't have an account?{' '}
                    <a href="#" className="font-medium text-brand-blue-light hover:text-brand-blue">
                        Sign Up
                    </a>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;