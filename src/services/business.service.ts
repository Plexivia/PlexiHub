import {
  TenantConfig,
  User,
  Project,
  BusinessProfile,
  SecuritySettings,
  AuditLogEntry,
} from '../types';
import {
  MOCK_TENANTS,
  MOCK_USERS,
  MOCK_AUDIT_LOGS,
} from '../mocks/mockData';

const STORAGE_KEY_TENANT = 'commerceops_active_tenant';
const STORAGE_KEY_TEAM = 'commerceops_team_members';
const STORAGE_KEY_PROFILE = 'commerceops_business_profile';
const STORAGE_KEY_SECURITY = 'commerceops_security_settings';
const STORAGE_KEY_AUDIT = 'commerceops_audit_logs';

const DEFAULT_PROFILE: BusinessProfile = {
  companyName: 'Apex Commerce Cloud Ltd.',
  legalEntity: 'Apex Digital Infrastructure Global Inc.',
  registrationNumber: 'REG-2024-984210',
  vatId: 'GB982140592',
  address: 'One Commerce Wharf, 4th Floor, London EC2A 4NE, UK',
  supportEmail: 'ops-support@apexcommerce.cloud',
  operationsContact: '+44 20 7946 0912',
  tier: 'Enterprise White-Label Fleet (Tier 1 SLA)',
  primaryDomain: 'portal.apexcommerce.cloud',
  timezone: 'America/New_York',
};

const DEFAULT_SECURITY: SecuritySettings = {
  twoFactorEnforced: true,
  ssoEnabled: true,
  sessionTimeoutMinutes: 30,
  passwordExpirationDays: 90,
  ipAllowlist: ['194.207.82.0/24', '10.0.0.0/8'],
  lastAuditDate: '2026-08-15T00:00:00Z',
};

export const businessService = {
  async getTenantConfig(): Promise<TenantConfig> {
    await new Promise((res) => setTimeout(res, 50));
    try {
      const raw = localStorage.getItem(STORAGE_KEY_TENANT);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error(e);
    }
    return MOCK_TENANTS[0];
  },

  async updateTenantConfig(updates: Partial<TenantConfig>): Promise<TenantConfig> {
    await new Promise((res) => setTimeout(res, 100));
    const current = await this.getTenantConfig();
    const updated = { ...current, ...updates };
    localStorage.setItem(STORAGE_KEY_TENANT, JSON.stringify(updated));

    if (updated.primaryColor) {
      document.documentElement.style.setProperty('--tenant-primary', updated.primaryColor);
    }
    if (updated.secondaryColor) {
      document.documentElement.style.setProperty('--tenant-secondary', updated.secondaryColor);
    }

    return updated;
  },

  async getProfile(): Promise<BusinessProfile> {
    await new Promise((res) => setTimeout(res, 100));
    try {
      const raw = localStorage.getItem(STORAGE_KEY_PROFILE);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_PROFILE;
  },

  async getBusinessProfile(): Promise<BusinessProfile> {
    return this.getProfile();
  },

  async updateProfile(updates: Partial<BusinessProfile>): Promise<BusinessProfile> {
    await new Promise((res) => setTimeout(res, 150));
    const current = await this.getProfile();
    const updated = { ...current, ...updates };
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(updated));
    return updated;
  },

  async updateBranding(updates: Partial<TenantConfig>): Promise<TenantConfig> {
    return this.updateTenantConfig(updates);
  },

  async getSecuritySettings(): Promise<SecuritySettings> {
    await new Promise((res) => setTimeout(res, 80));
    try {
      const raw = localStorage.getItem(STORAGE_KEY_SECURITY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_SECURITY;
  },

  async updateSecuritySettings(updates: Partial<SecuritySettings>): Promise<SecuritySettings> {
    await new Promise((res) => setTimeout(res, 150));
    const current = await this.getSecuritySettings();
    const updated = { ...current, ...updates };
    localStorage.setItem(STORAGE_KEY_SECURITY, JSON.stringify(updated));
    return updated;
  },

  async getMembers(): Promise<User[]> {
    await new Promise((res) => setTimeout(res, 80));
    try {
      const raw = localStorage.getItem(STORAGE_KEY_TEAM);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error(e);
    }
    return MOCK_USERS;
  },

  async getTeamMembers(): Promise<User[]> {
    return this.getMembers();
  },

  async inviteMember(data: {
    name: string;
    email: string;
    role: 'Owner' | 'Admin' | 'Manager';
    department?: string;
  }): Promise<User> {
    await new Promise((res) => setTimeout(res, 200));
    const members = await this.getMembers();
    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: data.name,
      email: data.email,
      role: data.role,
      department: data.department || 'Operations',
      avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
      isActive: true,
      twoFactorEnabled: true,
      lastLoginAt: new Date().toISOString(),
    };

    members.push(newUser);
    localStorage.setItem(STORAGE_KEY_TEAM, JSON.stringify(members));
    return newUser;
  },

  async removeMember(userId: string): Promise<boolean> {
    await new Promise((res) => setTimeout(res, 150));
    const members = await this.getMembers();
    const filtered = members.filter((m) => m.id !== userId);
    localStorage.setItem(STORAGE_KEY_TEAM, JSON.stringify(filtered));
    return true;
  },

  async getAuditLogs(limit = 20): Promise<AuditLogEntry[]> {
    await new Promise((res) => setTimeout(res, 100));
    try {
      const raw = localStorage.getItem(STORAGE_KEY_AUDIT);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error(e);
    }
    return MOCK_AUDIT_LOGS.slice(0, limit);
  },
};
