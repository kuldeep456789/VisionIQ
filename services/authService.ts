import { supabase } from './supabase';
import { User } from '../types';

export const authService = {
    login: async (email: string, password: string): Promise<{ user: User; message: string }> => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            throw new Error(error.message || 'Login failed');
        }

        if (!data.user) {
            throw new Error('No user data returned');
        }

        const user: User = {
            id: parseInt(data.user.id.substring(0, 8), 16),
            email: data.user.email || email,
            name: data.user.user_metadata?.name || 'User',
            profilePicture: data.user.user_metadata?.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.user.user_metadata?.name || 'User')}&background=random`
        };

        return {
            user,
            message: 'Login successful'
        };
    },

    register: async (email: string, password: string, name?: string): Promise<{ user: User; message: string }> => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name: name || 'User'
                }
            }
        });

        if (error) {
            throw new Error(error.message || 'Registration failed');
        }

        if (!data.user) {
            throw new Error('No user data returned');
        }

        const user: User = {
            id: parseInt(data.user.id.substring(0, 8), 16),
            email: data.user.email || email,
            name: name || 'User',
            profilePicture: `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=random`
        };

        return {
            user,
            message: 'User registered successfully'
        };
    },

    logout: async (): Promise<void> => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            throw new Error(error.message || 'Logout failed');
        }
    }
};
