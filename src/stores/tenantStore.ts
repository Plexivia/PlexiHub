import { create } from 'zustand';
import { TenantConfig } from '../types';
import { MOCK_TENANTS } from '../mocks/mockData';
import { businessService } from '../services/business.service';

interface TenantState {
  tenant: TenantConfig;
  isLoading: boolean;
  setTenant: (tenant: TenantConfig) => void;
  updateTenant: (updates: Partial<TenantConfig>) => Promise<TenantConfig>;
  loadTenant: () => Promise<void>;
}

export const useTenantStore = create<TenantState>((set, get) => ({
  tenant: MOCK_TENANTS[0],
  isLoading: false,

  setTenant: (tenant) => {
    set({ tenant });
    if (tenant.primaryColor) {
      document.documentElement.style.setProperty('--tenant-primary', tenant.primaryColor);
    }
    if (tenant.secondaryColor) {
      document.documentElement.style.setProperty('--tenant-secondary', tenant.secondaryColor);
    }
  },

  updateTenant: async (updates) => {
    const updated = await businessService.updateTenantConfig(updates);
    set({ tenant: updated });
    return updated;
  },

  loadTenant: async () => {
    set({ isLoading: true });
    try {
      const config = await businessService.getTenantConfig();
      set({ tenant: config, isLoading: false });
      if (config.primaryColor) {
        document.documentElement.style.setProperty('--tenant-primary', config.primaryColor);
      }
      if (config.secondaryColor) {
        document.documentElement.style.setProperty('--tenant-secondary', config.secondaryColor);
      }
    } catch (e) {
      console.error(e);
      set({ isLoading: false });
    }
  },
}));
