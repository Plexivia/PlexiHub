import { User, TenantConfig, Role } from '../types';
import { MOCK_USERS, MOCK_TENANTS } from '../mocks/mockData';

export interface LoginCredentials {
  email: string;
  password?: string;
  rememberMe?: boolean;
}

export interface MfaVerification {
  email: string;
  otp: string;
  rememberDevice?: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
  tenant: TenantConfig;
  requiresMfa?: boolean;
}

const STORAGE_KEY_AUTH = 'commerceops_auth_session';
const STORAGE_KEY_USERS = 'commerceops_users';

function getStoredUsers(): User[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USERS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse stored users', e);
  }
  return MOCK_USERS;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<{ requiresMfa: boolean; tempUser: User }> {
    await new Promise((res) => setTimeout(res, 350));

    const users = getStoredUsers();
    const user = users.find(
      (u) => u.email.toLowerCase() === credentials.email.toLowerCase()
    );

    if (!user) {
      // Fallback demo user if custom email entered
      const fallbackUser: User = {
        id: 'usr_demo',
        name: credentials.email.split('@')[0] || 'Demo User',
        email: credentials.email,
        role: 'Admin',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        department: 'Operations',
        isActive: true,
      };
      return { requiresMfa: true, tempUser: fallbackUser };
    }

    return {
      requiresMfa: true,
      tempUser: user,
    };
  },

  async verifyMfa(params: MfaVerification, tempUser: User): Promise<AuthResponse> {
    await new Promise((res) => setTimeout(res, 400));

    // Allow development OTP '123456' or any 6-digit number in mock mode
    if (params.otp.length !== 6) {
      throw new Error('Please enter a valid 6-digit verification code.');
    }

    const session: AuthResponse = {
      user: tempUser,
      token: `jwt_mock_${Date.now()}_${tempUser.id}`,
      tenant: MOCK_TENANTS[0],
      requiresMfa: false,
    };

    localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(session));
    return session;
  },

  async resendOtp(email: string): Promise<{ success: boolean; message: string }> {
    await new Promise((res) => setTimeout(res, 250));
    return {
      success: true,
      message: `A new 6-digit verification code has been dispatched to ${email}. (Use 123456)`,
    };
  },

  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    await new Promise((res) => setTimeout(res, 300));
    return {
      success: true,
      message: `Password reset instructions have been sent to ${email}.`,
    };
  },

  async resetPassword(password: string, token: string): Promise<{ success: boolean }> {
    await new Promise((res) => setTimeout(res, 300));
    return { success: true };
  },

  getCurrentSession(): AuthResponse | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_AUTH);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error('Session load error', e);
    }
    // Default logged in as Admin for instant rich preview
    const defaultSession: AuthResponse = {
      user: MOCK_USERS[0],
      token: 'jwt_mock_initial_session',
      tenant: MOCK_TENANTS[0],
      requiresMfa: false,
    };
    localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(defaultSession));
    return defaultSession;
  },

  async switchRole(role: Role): Promise<User> {
    const current = this.getCurrentSession();
    const targetUser = MOCK_USERS.find((u) => u.role === role) || {
      ...current?.user,
      id: `usr_${role.toLowerCase()}`,
      name: `${role} User`,
      role,
    } as User;

    if (current) {
      current.user = targetUser;
      localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(current));
    }
    return targetUser;
  },

  async logout(): Promise<void> {
    await new Promise((res) => setTimeout(res, 200));
    localStorage.removeItem(STORAGE_KEY_AUTH);
  },
};
