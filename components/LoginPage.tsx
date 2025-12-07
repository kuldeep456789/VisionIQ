import React, { useState } from 'react';

import { authService } from '../services/authService';
import { User } from '../types';

interface LoginPageProps {
    onLogin: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
    const [email, setEmail] = useState('admin@visioniq.io');
    const [password, setPassword] = useState('password');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);
    const [name, setName] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (isRegistering) {
                const data = await authService.register(email, password, name);
                onLogin(data.user);
            } else {
                const data = await authService.login(email, password);
                onLogin(data.user);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-dark">
            <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-medium rounded-2xl shadow-xl">
                <div className="text-center">

                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {isRegistering ? 'Create an Account' : 'Welcome to VISIONIQ'}
                    </h2>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        {isRegistering ? 'Sign up to get started' : 'Sign in to access your dashboard'}
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}
                    <div className="rounded-md shadow-sm -space-y-px">
                        {isRegistering && (
                            <div>
                                <label htmlFor="name" className="sr-only">Name</label>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    required
                                    className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-light placeholder-gray-500 text-gray-900 dark:text-white bg-white dark:bg-gray-dark rounded-t-md focus:outline-none focus:ring-brand-blue focus:border-brand-blue focus:z-10 sm:text-sm"
                                    placeholder="Full Name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                        )}
                        <div>
                            <label htmlFor="email-address" className="sr-only">Email address</label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className={`appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-light placeholder-gray-500 text-gray-900 dark:text-white bg-white dark:bg-gray-dark ${isRegistering ? '' : 'rounded-t-md'} focus:outline-none focus:ring-brand-blue focus:border-brand-blue focus:z-10 sm:text-sm`}
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
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
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {!isRegistering && (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-brand-blue focus:ring-brand-blue-light border-gray-300 dark:border-gray-light rounded bg-gray-100 dark:bg-gray-dark" />
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
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-brand-blue hover:bg-brand-blue-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue-light disabled:opacity-50"
                        >
                            {loading ? 'Processing...' : (isRegistering ? 'Sign Up' : 'Sign in')}
                        </button>
                    </div>
                </form>
                <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    {isRegistering ? 'Already have an account? ' : "Don't have an account? "}
                    <button
                        onClick={() => setIsRegistering(!isRegistering)}
                        className="font-medium text-brand-blue-light hover:text-brand-blue"
                    >
                        {isRegistering ? 'Sign In' : 'Sign Up'}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;