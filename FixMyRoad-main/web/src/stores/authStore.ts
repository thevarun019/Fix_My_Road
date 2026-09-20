import { create } from 'zustand';

interface User {
  id: string;
  phone: string;
  name?: string;
  role: 'CITIZEN' | 'OFFICER' | 'ADMIN' | 'SUPER_ADMIN';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

const savedToken = localStorage.getItem('roadwatch_token');
const savedUser = localStorage.getItem('roadwatch_user');

export const useAuthStore = create<AuthState>((set) => ({
  user: savedUser ? JSON.parse(savedUser) : null,
  token: savedToken || null,
  isAuthenticated: !!savedToken,
  setAuth: (user, token) => {
    localStorage.setItem('roadwatch_token', token);
    localStorage.setItem('roadwatch_user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem('roadwatch_token');
    localStorage.removeItem('roadwatch_user');
    set({ user: null, token: null, isAuthenticated: false });
  }
}));
