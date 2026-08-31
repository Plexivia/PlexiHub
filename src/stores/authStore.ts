import { create } from 'zustand';
import { User, Role, TenantConfig } from '../types';
import { authService, AuthResponse, LoginCredentials, MfaVerification } from '../services/auth.service';

interface AuthState {
  user: User | null;
  role: Role;
  token: string | null;
  tenant: TenantConfig | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  tempMfaUser: User | null;
  rememberDevice: boolean;
  setTempMfaUser: (user: User | null) => void;
  setSession: (session: AuthResponse) => void;
  login: (credentials: LoginCredentials) => Promise<{ requiresMfa: boolean; tempUser: User }>;
  verifyMfa: (params: MfaVerification, tempUser: User) => Promise<AuthResponse>;
  switchRole: (role: Role) => Promise<void>;
  logout: () => Promise<void>;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  role: 'Owner',
  token: null,
  tenant: null,
  isAuthenticated: false,
  isLoading: true,
  tempMfaUser: null,
  rememberDevice: true,

  setTempMfaUser: (user) => set({ tempMfaUser: user }),

  setSession: (session) => {
    set({
      user: session.user,
      role: session.user.role,
      token: session.token,
      tenant: session.tenant,
      isAuthenticated: true,
      isLoading: false,
      tempMfaUser: null,
    });
  },

  login: async (credentials) => {
    const res = await authService.login(credentials);
    if (res.requiresMfa) {
      set({ tempMfaUser: res.tempUser });
    }
    return res;
  },

  verifyMfa: async (params, tempUser) => {
    const session = await authService.verifyMfa(params, tempUser);
    get().setSession(session);
    return session;
  },

  switchRole: async (role: Role) => {
    const updatedUser = await authService.switchRole(role);
    set({
      user: updatedUser,
      role: updatedUser.role,
    });
  },

  logout: async () => {
    await authService.logout();
    set({
      user: null,
      role: 'Manager',
      token: null,
      tenant: null,
      isAuthenticated: false,
      tempMfaUser: null,
    });
  },

  initializeAuth: () => {
    const session = authService.getCurrentSession();
    if (session) {
      set({
        user: session.user,
        role: session.user.role,
        token: session.token,
        tenant: session.tenant,
        isAuthenticated: true,
        isLoading: false,
      });
    } else {
      set({ isLoading: false });
    }
  },
}));
