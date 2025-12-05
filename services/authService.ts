import { User } from '../types';

const API_URL = 'http://localhost:5000/api';

export const authService = {
    login: async (email: string, password: string): Promise<{ user: User; message: string }> => {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Login failed');
        }

        return response.json();
    },

    register: async (email: string, password: string, name?: string): Promise<{ user: User; message: string }> => {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password, name }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Registration failed');
        }

        return response.json();
    }
};
