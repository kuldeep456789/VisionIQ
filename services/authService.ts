import { User } from '../types';

const API_BASE_URL = (import.meta.env?.VITE_API_URL as string) || 'http://localhost:5000';

export const authService = {
    login: async (email: string, password: string): Promise<{ user: User; message: string }> => {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('Login failed:', error);
            throw new Error(error.error || 'Login failed');
        }

        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        return {
            user: data.user,
            message: 'Login successful'
        };
    },

    register: async (email: string, password: string, name?: string): Promise<{ user: User; message: string }> => {
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email, password, name }),
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('Registration failed:', error);
            throw new Error(error.error || 'Registration failed');
        }

        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        return {
            user: data.user,
            message: 'User registered successfully'
        };
    },

    logout: async (): Promise<void> => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    getCurrentUser: (): User | null => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    }
};
