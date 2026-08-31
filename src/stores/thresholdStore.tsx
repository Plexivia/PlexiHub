import { create } from 'zustand';
import { ServerMetrics } from '../types';
import { toast } from 'sonner';

export interface PerformanceThresholds {
  cpuWarning: number; // e.g. 70 (%)
  cpuCritical: number; // e.g. 85 (%)
  memoryWarning: number; // e.g. 75 (%)
  memoryCritical: number; // e.g. 90 (%)
  storageWarning: number; // e.g. 75 (%)
  storageCritical: number; // e.g. 85 (%)
  networkMaxMb: number; // e.g. 120 (MB/s total in+out or in)
  minStorageFreeGb: number; // e.g. 20 (GB)
  notificationsEnabled: boolean;
  soundAlerts: boolean;
  notifyOnWarning: boolean;
  notifyOnCritical: boolean;
}

export interface ThresholdBreach {
  id: string;
  metric: 'cpu' | 'memory' | 'storage' | 'network' | 'storageFree';
  label: string;
  severity: 'warning' | 'critical';
  currentValue: number;
  thresholdValue: number;
  unit: string;
  message: string;
  timestamp: string;
}

export const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  cpuWarning: 70,
  cpuCritical: 85,
  memoryWarning: 75,
  memoryCritical: 90,
  storageWarning: 75,
  storageCritical: 85,
  networkMaxMb: 120,
  minStorageFreeGb: 20,
  notificationsEnabled: true,
  soundAlerts: true,
  notifyOnWarning: true,
  notifyOnCritical: true,
};

const STORAGE_KEY = 'commerceops_performance_thresholds';

function loadStoredThresholds(): PerformanceThresholds {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_THRESHOLDS, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.warn('Failed to load stored thresholds', e);
  }
  return DEFAULT_THRESHOLDS;
}

function saveStoredThresholds(data: PerformanceThresholds) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save thresholds', e);
  }
}

interface ThresholdState {
  thresholds: PerformanceThresholds;
  activeBreaches: ThresholdBreach[];
  lastBreachNotifiedAt: Record<string, number>;
  updateThresholds: (partial: Partial<PerformanceThresholds>) => void;
  resetThresholds: () => void;
  evaluateMetrics: (metrics: ServerMetrics, projectName?: string, forceNotify?: boolean) => ThresholdBreach[];
  dismissBreach: (breachId: string) => void;
  clearAllBreaches: () => void;
  simulateBreach: (metricType: 'cpu' | 'memory' | 'storage' | 'network') => void;
}

export const useThresholdStore = create<ThresholdState>((set, get) => ({
  thresholds: loadStoredThresholds(),
  activeBreaches: [],
  lastBreachNotifiedAt: {},

  updateThresholds: (partial) => {
    const updated = { ...get().thresholds, ...partial };
    set({ thresholds: updated });
    saveStoredThresholds(updated);
  },

  resetThresholds: () => {
    set({ thresholds: DEFAULT_THRESHOLDS });
    saveStoredThresholds(DEFAULT_THRESHOLDS);
  },

  dismissBreach: (breachId: string) => {
    set((state) => ({
      activeBreaches: state.activeBreaches.filter((b) => b.id !== breachId),
    }));
  },

  clearAllBreaches: () => {
    set({ activeBreaches: [] });
  },

  evaluateMetrics: (metrics: ServerMetrics, projectName = 'Current Project', forceNotify = false) => {
    const { thresholds, lastBreachNotifiedAt } = get();
    const breaches: ThresholdBreach[] = [];
    const now = Date.now();
    const nowIso = new Date().toISOString();

    // 1. Check CPU
    if (metrics.cpuPercent >= thresholds.cpuCritical) {
      breaches.push({
        id: `cpu_${nowIso}`,
        metric: 'cpu',
        label: 'CPU Load Critical',
        severity: 'critical',
        currentValue: metrics.cpuPercent,
        thresholdValue: thresholds.cpuCritical,
        unit: '%',
        message: `CPU load reached ${metrics.cpuPercent}% (exceeds critical threshold of ${thresholds.cpuCritical}%)`,
        timestamp: nowIso,
      });
    } else if (metrics.cpuPercent >= thresholds.cpuWarning) {
      breaches.push({
        id: `cpu_${nowIso}`,
        metric: 'cpu',
        label: 'CPU Load High',
        severity: 'warning',
        currentValue: metrics.cpuPercent,
        thresholdValue: thresholds.cpuWarning,
        unit: '%',
        message: `CPU load is at ${metrics.cpuPercent}% (exceeds warning threshold of ${thresholds.cpuWarning}%)`,
        timestamp: nowIso,
      });
    }

    // 2. Check Memory
    if (metrics.memoryPercent >= thresholds.memoryCritical) {
      breaches.push({
        id: `mem_${nowIso}`,
        metric: 'memory',
        label: 'Memory Pressure Critical',
        severity: 'critical',
        currentValue: metrics.memoryPercent,
        thresholdValue: thresholds.memoryCritical,
        unit: '%',
        message: `Memory saturation at ${metrics.memoryPercent}% (exceeds critical limit of ${thresholds.memoryCritical}%)`,
        timestamp: nowIso,
      });
    } else if (metrics.memoryPercent >= thresholds.memoryWarning) {
      breaches.push({
        id: `mem_${nowIso}`,
        metric: 'memory',
        label: 'Memory Utilization High',
        severity: 'warning',
        currentValue: metrics.memoryPercent,
        thresholdValue: thresholds.memoryWarning,
        unit: '%',
        message: `Memory utilization at ${metrics.memoryPercent}% (exceeds warning limit of ${thresholds.memoryWarning}%)`,
        timestamp: nowIso,
      });
    }

    // 3. Check Storage
    if (metrics.storageUsagePercent >= thresholds.storageCritical) {
      breaches.push({
        id: `disk_${nowIso}`,
        metric: 'storage',
        label: 'Disk Volume Exhaustion',
        severity: 'critical',
        currentValue: Number(metrics.storageUsagePercent.toFixed(1)),
        thresholdValue: thresholds.storageCritical,
        unit: '%',
        message: `Storage volume is ${metrics.storageUsagePercent.toFixed(1)}% full (critical threshold: ${thresholds.storageCritical}%)`,
        timestamp: nowIso,
      });
    } else if (metrics.storageUsagePercent >= thresholds.storageWarning) {
      breaches.push({
        id: `disk_${nowIso}`,
        metric: 'storage',
        label: 'Storage Capacity High',
        severity: 'warning',
        currentValue: Number(metrics.storageUsagePercent.toFixed(1)),
        thresholdValue: thresholds.storageWarning,
        unit: '%',
        message: `Storage volume at ${metrics.storageUsagePercent.toFixed(1)}% (warning threshold: ${thresholds.storageWarning}%)`,
        timestamp: nowIso,
      });
    }

    // 4. Check Free Storage GB
    if (metrics.storageAvailableGb <= thresholds.minStorageFreeGb) {
      breaches.push({
        id: `disk_free_${nowIso}`,
        metric: 'storageFree',
        label: 'Low Disk Headroom',
        severity: 'warning',
        currentValue: metrics.storageAvailableGb,
        thresholdValue: thresholds.minStorageFreeGb,
        unit: 'GB',
        message: `Only ${metrics.storageAvailableGb} GB free remaining (minimum safe floor: ${thresholds.minStorageFreeGb} GB)`,
        timestamp: nowIso,
      });
    }

    // 5. Check Network Throughput
    const totalNetworkMb = metrics.incomingNetworkMb + metrics.outgoingNetworkMb;
    if (totalNetworkMb >= thresholds.networkMaxMb) {
      breaches.push({
        id: `net_${nowIso}`,
        metric: 'network',
        label: 'Network Saturation',
        severity: 'warning',
        currentValue: Number(totalNetworkMb.toFixed(1)),
        thresholdValue: thresholds.networkMaxMb,
        unit: 'MB/s',
        message: `Total network throughput at ${totalNetworkMb.toFixed(1)} MB/s (limit: ${thresholds.networkMaxMb} MB/s)`,
        timestamp: nowIso,
      });
    }

    set({ activeBreaches: breaches });

    // Notify if enabled
    if (thresholds.notificationsEnabled && breaches.length > 0) {
      const updatedNotified = { ...lastBreachNotifiedAt };

      breaches.forEach((b) => {
        const key = `${b.metric}_${b.severity}`;
        const lastTime = updatedNotified[key] || 0;
        const cooldownMs = 60000; // 1 minute cooldown between repeat notifications for same metric

        const isAllowedBySeverity =
          (b.severity === 'critical' && thresholds.notifyOnCritical) ||
          (b.severity === 'warning' && thresholds.notifyOnWarning);

        if (isAllowedBySeverity && (forceNotify || now - lastTime > cooldownMs)) {
          updatedNotified[key] = now;
          showBreachToast(b, projectName, thresholds.soundAlerts);
        }
      });

      set({ lastBreachNotifiedAt: updatedNotified });
    }

    return breaches;
  },

  simulateBreach: (metricType: 'cpu' | 'memory' | 'storage' | 'network') => {
    const { thresholds } = get();
    const nowIso = new Date().toISOString();
    let simulatedBreach: ThresholdBreach;

    switch (metricType) {
      case 'cpu':
        simulatedBreach = {
          id: `sim_cpu_${Date.now()}`,
          metric: 'cpu',
          label: 'CPU Load Critical (Simulated)',
          severity: 'critical',
          currentValue: 92.4,
          thresholdValue: thresholds.cpuCritical,
          unit: '%',
          message: `CPU load surged to 92.4% (exceeds critical threshold of ${thresholds.cpuCritical}%)`,
          timestamp: nowIso,
        };
        break;
      case 'memory':
        simulatedBreach = {
          id: `sim_mem_${Date.now()}`,
          metric: 'memory',
          label: 'Memory Pressure Alert (Simulated)',
          severity: 'warning',
          currentValue: 86.8,
          thresholdValue: thresholds.memoryWarning,
          unit: '%',
          message: `Memory saturation surged to 86.8% (exceeds warning limit of ${thresholds.memoryWarning}%)`,
          timestamp: nowIso,
        };
        break;
      case 'storage':
        simulatedBreach = {
          id: `sim_disk_${Date.now()}`,
          metric: 'storage',
          label: 'Disk Volume Critical (Simulated)',
          severity: 'critical',
          currentValue: 88.5,
          thresholdValue: thresholds.storageCritical,
          unit: '%',
          message: `Storage volume reached 88.5% capacity (critical limit: ${thresholds.storageCritical}%)`,
          timestamp: nowIso,
        };
        break;
      case 'network':
      default:
        simulatedBreach = {
          id: `sim_net_${Date.now()}`,
          metric: 'network',
          label: 'Network Throughput Spike (Simulated)',
          severity: 'warning',
          currentValue: 146.2,
          thresholdValue: thresholds.networkMaxMb,
          unit: 'MB/s',
          message: `Network bandwidth spiked to 146.2 MB/s (threshold: ${thresholds.networkMaxMb} MB/s)`,
          timestamp: nowIso,
        };
        break;
    }

    set((state) => ({
      activeBreaches: [simulatedBreach, ...state.activeBreaches.filter((b) => b.metric !== metricType)],
    }));

    showBreachToast(simulatedBreach, 'Demo Simulation', thresholds.soundAlerts);
  },
}));

function showBreachToast(breach: ThresholdBreach, projectName: string, soundEnabled: boolean) {
  if (soundEnabled) {
    playAlertChime(breach.severity === 'critical');
  }

  const isCritical = breach.severity === 'critical';

  toast.custom(
    (t) => (
      <div
        id={`toast-breach-${breach.id}`}
        className={`flex w-full max-w-md items-start gap-3 rounded-xl border p-3.5 shadow-xl backdrop-blur-md transition-all ${
          isCritical
            ? 'border-rose-300 bg-rose-50/95 text-rose-950 shadow-rose-500/10'
            : 'border-amber-300 bg-amber-50/95 text-amber-950 shadow-amber-500/10'
        }`}
      >
        {/* Severity Icon Indicator */}
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg shadow-xs ${
            isCritical ? 'bg-rose-600 text-white' : 'bg-amber-500 text-white'
          }`}
        >
          <span className="font-bold text-xs uppercase">{isCritical ? 'CRIT' : 'WARN'}</span>
        </div>

        {/* Toast Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center gap-1.5 truncate">
              <span className="font-bold text-xs truncate">{breach.label}</span>
              <span
                className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                  isCritical
                    ? 'bg-rose-200/80 text-rose-900 border-rose-300'
                    : 'bg-amber-200/80 text-amber-900 border-amber-300'
                }`}
              >
                {projectName}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Just now</span>
          </div>

          <p className="text-xs mt-1 font-medium leading-snug">{breach.message}</p>

          <div className="mt-2 flex items-center justify-between border-t border-black/5 pt-1.5 text-[11px]">
            <span className="font-mono text-slate-600">
              Value: <strong>{breach.currentValue}{breach.unit}</strong> (Limit: {breach.thresholdValue}{breach.unit})
            </span>

            <button
              type="button"
              onClick={() => {
                toast.dismiss(t);
                // Dispatch event to open threshold config panel
                window.dispatchEvent(new CustomEvent('commerceops:open_threshold_panel'));
              }}
              className={`font-semibold underline cursor-pointer hover:opacity-80 text-[11px] ${
                isCritical ? 'text-rose-800' : 'text-amber-900'
              }`}
            >
              Adjust Limit
            </button>
          </div>
        </div>
      </div>
    ),
    {
      duration: isCritical ? 9000 : 6000,
    }
  );
}

function playAlertChime(isCritical: boolean) {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = isCritical ? 'sawtooth' : 'triangle';
    const baseFreq = isCritical ? 880 : 659.25; // A5 or E5

    osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    osc.frequency.setValueAtTime(baseFreq * 1.25, ctx.currentTime + 0.1);
    if (isCritical) {
      osc.frequency.setValueAtTime(baseFreq * 1.5, ctx.currentTime + 0.2);
    }

    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.45);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.45);
  } catch (e) {
    // Non-critical audio feedback
  }
}
