import React, { useState } from 'react';
import { useThresholdStore, PerformanceThresholds, DEFAULT_THRESHOLDS } from '../../stores/thresholdStore';
import { ServerMetrics } from '../../types';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import {
  Sliders,
  Bell,
  Volume2,
  VolumeX,
  AlertTriangle,
  Flame,
  Activity,
  HardDrive,
  Cpu,
  Zap,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  Layers,
  ArrowUpDown,
} from 'lucide-react';
import { toast } from 'sonner';

interface ThresholdConfigPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentMetrics?: ServerMetrics | null;
  projectName?: string;
}

export function ThresholdConfigPanel({
  open,
  onOpenChange,
  currentMetrics,
  projectName = 'Current Project',
}: ThresholdConfigPanelProps) {
  const {
    thresholds,
    updateThresholds,
    resetThresholds,
    evaluateMetrics,
    simulateBreach,
    activeBreaches,
  } = useThresholdStore();

  // Local draft state for fine-tuning
  const [form, setForm] = useState<PerformanceThresholds>(thresholds);
  const [activeTab, setActiveTab] = useState<'thresholds' | 'notifications' | 'test'>('thresholds');

  // Keep draft in sync when dialog opens
  React.useEffect(() => {
    if (open) {
      setForm(thresholds);
    }
  }, [open, thresholds]);

  const handlePreset = (type: 'strict' | 'balanced' | 'relaxed') => {
    let preset: Partial<PerformanceThresholds>;
    switch (type) {
      case 'strict':
        preset = {
          cpuWarning: 60,
          cpuCritical: 75,
          memoryWarning: 65,
          memoryCritical: 80,
          storageWarning: 70,
          storageCritical: 80,
          networkMaxMb: 80,
          minStorageFreeGb: 30,
        };
        break;
      case 'relaxed':
        preset = {
          cpuWarning: 80,
          cpuCritical: 92,
          memoryWarning: 85,
          memoryCritical: 95,
          storageWarning: 85,
          storageCritical: 95,
          networkMaxMb: 180,
          minStorageFreeGb: 10,
        };
        break;
      case 'balanced':
      default:
        preset = DEFAULT_THRESHOLDS;
        break;
    }
    setForm((prev) => ({ ...prev, ...preset }));
    toast.info(`Applied ${type.toUpperCase()} threshold preset profile.`);
  };

  const handleSave = () => {
    // Validate bounds
    const sanitized: PerformanceThresholds = {
      ...form,
      cpuWarning: Math.min(Math.max(10, form.cpuWarning), form.cpuCritical - 1),
      cpuCritical: Math.min(Math.max(form.cpuWarning + 1, form.cpuCritical), 99),
      memoryWarning: Math.min(Math.max(10, form.memoryWarning), form.memoryCritical - 1),
      memoryCritical: Math.min(Math.max(form.memoryWarning + 1, form.memoryCritical), 99),
      storageWarning: Math.min(Math.max(10, form.storageWarning), form.storageCritical - 1),
      storageCritical: Math.min(Math.max(form.storageWarning + 1, form.storageCritical), 99),
      networkMaxMb: Math.max(10, form.networkMaxMb),
      minStorageFreeGb: Math.max(1, form.minStorageFreeGb),
    };

    updateThresholds(sanitized);

    // If we have live metrics, evaluate immediately with forceNotify
    if (currentMetrics) {
      evaluateMetrics(currentMetrics, projectName, true);
    }

    toast.success('Performance health thresholds saved and activated.');
    onOpenChange(false);
  };

  const handleReset = () => {
    resetThresholds();
    setForm(DEFAULT_THRESHOLDS);
    toast.info('Thresholds restored to platform standard defaults.');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogClose onClose={() => onOpenChange(false)} />
      <DialogHeader>
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-blue-50 p-2 text-blue-600 border border-blue-200/60">
            <Sliders className="h-5 w-5" />
          </div>
          <div>
            <DialogTitle>Server Health Performance Thresholds</DialogTitle>
            <DialogDescription>
              Configure warning & critical breach limits for <strong>{projectName}</strong> telemetry.
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      {/* Tabs Navigation */}
      <div className="flex border-b border-gray-200 mt-2">
        <button
          type="button"
          onClick={() => setActiveTab('thresholds')}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'thresholds'
              ? 'border-blue-600 text-blue-600 bg-blue-50/40'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Activity className="h-3.5 w-3.5" />
          Metric Limits
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('notifications')}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'notifications'
              ? 'border-blue-600 text-blue-600 bg-blue-50/40'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Bell className="h-3.5 w-3.5" />
          Notification Rules
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('test')}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'test'
              ? 'border-blue-600 text-blue-600 bg-blue-50/40'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Zap className="h-3.5 w-3.5" />
          Test Breach Triggers
          {activeBreaches.length > 0 && (
            <span className="ml-1 rounded-full bg-rose-100 text-rose-700 px-1.5 py-0.2 text-[10px] font-bold">
              {activeBreaches.length}
            </span>
          )}
        </button>
      </div>

      <div className="py-3 max-h-[60vh] overflow-y-auto space-y-4 px-1 text-xs">
        {/* TAB 1: THRESHOLD METRIC LIMITS */}
        {activeTab === 'thresholds' && (
          <div className="space-y-4">
            {/* Presets Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-gray-50 p-2.5 border border-gray-200">
              <span className="text-[11px] font-semibold text-gray-600">Quick Configuration Presets:</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handlePreset('strict')}
                  className="rounded border border-amber-200 bg-white px-2 py-1 text-[11px] font-medium text-amber-900 hover:bg-amber-50 cursor-pointer shadow-2xs"
                >
                  Strict (60/75%)
                </button>
                <button
                  type="button"
                  onClick={() => handlePreset('balanced')}
                  className="rounded border border-blue-200 bg-white px-2 py-1 text-[11px] font-medium text-blue-900 hover:bg-blue-50 cursor-pointer shadow-2xs"
                >
                  Balanced Standard (70/85%)
                </button>
                <button
                  type="button"
                  onClick={() => handlePreset('relaxed')}
                  className="rounded border border-gray-200 bg-white px-2 py-1 text-[11px] font-medium text-gray-700 hover:bg-gray-100 cursor-pointer shadow-2xs"
                >
                  Relaxed (80/92%)
                </button>
              </div>
            </div>

            {/* Metric 1: CPU Utilization */}
            <div className="rounded-lg border border-gray-200 p-3.5 bg-white space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded bg-sky-100 p-1.5 text-sky-700">
                    <Cpu className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">CPU Load Thresholds</h4>
                    <p className="text-[11px] text-gray-500">
                      Live CPU usage: <strong className="text-gray-800">{currentMetrics?.cpuPercent ?? 0}%</strong>
                    </p>
                  </div>
                </div>
                <Badge variant={currentMetrics && currentMetrics.cpuPercent >= form.cpuCritical ? 'destructive' : 'outline'}>
                  {currentMetrics && currentMetrics.cpuPercent >= form.cpuCritical ? 'Exceeding Critical' : 'Normal'}
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="rounded border border-amber-200/80 bg-amber-50/40 p-2.5">
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-semibold text-amber-900 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3 text-amber-600" />
                      Warning Level
                    </label>
                    <span className="font-mono font-bold text-amber-900">{form.cpuWarning}%</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="95"
                    step="5"
                    value={form.cpuWarning}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        cpuWarning: Number(e.target.value),
                        cpuCritical: Math.max(Number(e.target.value) + 5, prev.cpuCritical),
                      }))
                    }
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
                    <span>20%</span>
                    <span>95%</span>
                  </div>
                </div>

                <div className="rounded border border-rose-200/80 bg-rose-50/40 p-2.5">
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-semibold text-rose-900 flex items-center gap-1">
                      <Flame className="h-3 w-3 text-rose-600" />
                      Critical Level
                    </label>
                    <span className="font-mono font-bold text-rose-900">{form.cpuCritical}%</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="99"
                    step="1"
                    value={form.cpuCritical}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        cpuCritical: Number(e.target.value),
                        cpuWarning: Math.min(Number(e.target.value) - 5, prev.cpuWarning),
                      }))
                    }
                    className="w-full accent-rose-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
                    <span>30%</span>
                    <span>99%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Metric 2: Memory Saturation */}
            <div className="rounded-lg border border-gray-200 p-3.5 bg-white space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded bg-indigo-100 p-1.5 text-indigo-700">
                    <Layers className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">RAM / Memory Saturation</h4>
                    <p className="text-[11px] text-gray-500">
                      Live Memory: <strong className="text-gray-800">{currentMetrics?.memoryPercent ?? 0}%</strong>
                    </p>
                  </div>
                </div>
                <Badge variant={currentMetrics && currentMetrics.memoryPercent >= form.memoryCritical ? 'destructive' : 'outline'}>
                  {currentMetrics && currentMetrics.memoryPercent >= form.memoryCritical ? 'Exceeding Critical' : 'Normal'}
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="rounded border border-amber-200/80 bg-amber-50/40 p-2.5">
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-semibold text-amber-900 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3 text-amber-600" />
                      Warning Limit
                    </label>
                    <span className="font-mono font-bold text-amber-900">{form.memoryWarning}%</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="95"
                    step="5"
                    value={form.memoryWarning}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        memoryWarning: Number(e.target.value),
                        memoryCritical: Math.max(Number(e.target.value) + 5, prev.memoryCritical),
                      }))
                    }
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                <div className="rounded border border-rose-200/80 bg-rose-50/40 p-2.5">
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-semibold text-rose-900 flex items-center gap-1">
                      <Flame className="h-3 w-3 text-rose-600" />
                      Critical Limit
                    </label>
                    <span className="font-mono font-bold text-rose-900">{form.memoryCritical}%</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="99"
                    step="1"
                    value={form.memoryCritical}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        memoryCritical: Number(e.target.value),
                        memoryWarning: Math.min(Number(e.target.value) - 5, prev.memoryWarning),
                      }))
                    }
                    className="w-full accent-rose-600 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Metric 3: Disk Storage & Free Headroom */}
            <div className="rounded-lg border border-gray-200 p-3.5 bg-white space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded bg-emerald-100 p-1.5 text-emerald-700">
                    <HardDrive className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Disk Storage & Capacity</h4>
                    <p className="text-[11px] text-gray-500">
                      Live volume: <strong className="text-gray-800">{currentMetrics?.storageUsagePercent?.toFixed(1) ?? 0}%</strong> used ({currentMetrics?.storageAvailableGb ?? 0} GB free)
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="rounded border border-amber-200/80 bg-amber-50/40 p-2.5">
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-semibold text-amber-900 text-[11px]">Storage Warning</label>
                    <span className="font-mono font-bold text-amber-900">{form.storageWarning}%</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="95"
                    step="5"
                    value={form.storageWarning}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        storageWarning: Number(e.target.value),
                        storageCritical: Math.max(Number(e.target.value) + 5, prev.storageCritical),
                      }))
                    }
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                <div className="rounded border border-rose-200/80 bg-rose-50/40 p-2.5">
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-semibold text-rose-900 text-[11px]">Storage Critical</label>
                    <span className="font-mono font-bold text-rose-900">{form.storageCritical}%</span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="99"
                    step="1"
                    value={form.storageCritical}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        storageCritical: Number(e.target.value),
                        storageWarning: Math.min(Number(e.target.value) - 5, prev.storageWarning),
                      }))
                    }
                    className="w-full accent-rose-600 cursor-pointer"
                  />
                </div>

                <div className="rounded border border-slate-200 bg-slate-50 p-2.5">
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-semibold text-slate-800 text-[11px]">Min Free Floor</label>
                    <span className="font-mono font-bold text-slate-800">{form.minStorageFreeGb} GB</span>
                  </div>
                  <Input
                    type="number"
                    min="5"
                    max="150"
                    value={form.minStorageFreeGb}
                    onChange={(e) => setForm((prev) => ({ ...prev, minStorageFreeGb: Number(e.target.value) || 10 }))}
                    className="h-7 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Metric 4: Network Throughput Peak */}
            <div className="rounded-lg border border-gray-200 p-3.5 bg-white space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded bg-teal-100 p-1.5 text-teal-700">
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Network Bandwidth Saturation Cap</h4>
                    <p className="text-[11px] text-gray-500">
                      Notify when total In+Out throughput exceeds this ceiling.
                    </p>
                  </div>
                </div>
                <span className="font-mono font-bold text-teal-900 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  {form.networkMaxMb} MB/s
                </span>
              </div>

              <div className="pt-2">
                <input
                  type="range"
                  min="20"
                  max="500"
                  step="10"
                  value={form.networkMaxMb}
                  onChange={(e) => setForm((prev) => ({ ...prev, networkMaxMb: Number(e.target.value) }))}
                  className="w-full accent-teal-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
                  <span>20 MB/s</span>
                  <span>250 MB/s</span>
                  <span>500 MB/s</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: NOTIFICATION PREFERENCES */}
        {activeTab === 'notifications' && (
          <div className="space-y-3.5">
            <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
              <h4 className="font-bold text-gray-900 flex items-center gap-1.5">
                <Bell className="h-4 w-4 text-blue-600" />
                UI Alert Toast Channels
              </h4>

              <div className="space-y-3 divide-y divide-gray-100 pt-1">
                <label className="flex items-center justify-between pt-2 cursor-pointer">
                  <div>
                    <span className="font-semibold text-gray-900">Enable UI Pop-up Toasts</span>
                    <p className="text-[11px] text-gray-500">
                      Display high-visibility visual toast alerts when server health breaches occur.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.notificationsEnabled}
                    onChange={(e) => setForm((prev) => ({ ...prev, notificationsEnabled: e.target.checked }))}
                    className="h-4 w-4 rounded accent-blue-600 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between pt-3 cursor-pointer">
                  <div className="flex items-center gap-2">
                    {form.soundAlerts ? (
                      <Volume2 className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <VolumeX className="h-4 w-4 text-gray-400" />
                    )}
                    <div>
                      <span className="font-semibold text-gray-900">Audio Alarm Chime</span>
                      <p className="text-[11px] text-gray-500">
                        Synthesize an audio tone notification when critical limits are breached.
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.soundAlerts}
                    onChange={(e) => setForm((prev) => ({ ...prev, soundAlerts: e.target.checked }))}
                    className="h-4 w-4 rounded accent-blue-600 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between pt-3 cursor-pointer">
                  <div>
                    <span className="font-semibold text-gray-900">Alert on Warning Thresholds</span>
                    <p className="text-[11px] text-gray-500">
                      Trigger notifications when metric enters amber warning territory.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.notifyOnWarning}
                    onChange={(e) => setForm((prev) => ({ ...prev, notifyOnWarning: e.target.checked }))}
                    className="h-4 w-4 rounded accent-blue-600 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between pt-3 cursor-pointer">
                  <div>
                    <span className="font-semibold text-gray-900">Alert on Critical Thresholds</span>
                    <p className="text-[11px] text-gray-500">
                      Trigger urgent high-priority red alert toasts when exceeding critical ceiling.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.notifyOnCritical}
                    onChange={(e) => setForm((prev) => ({ ...prev, notifyOnCritical: e.target.checked }))}
                    className="h-4 w-4 rounded accent-blue-600 cursor-pointer"
                  />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: TEST BREACH TRIGGERS & SIMULATION */}
        {activeTab === 'test' && (
          <div className="space-y-3.5">
            <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-3.5">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-600" />
                <h4 className="font-bold text-blue-900">Interactive Threshold Trigger Simulator</h4>
              </div>
              <p className="text-[11px] text-blue-800 mt-1">
                Click any metric below to simulate an instantaneous hardware spike and verify the breach detection algorithm, visual banner, and UI toast alert notifications.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => simulateBreach('cpu')}
                className="flex items-center justify-between rounded-lg border border-rose-200 bg-white p-3 hover:bg-rose-50/50 transition-colors text-left cursor-pointer group shadow-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="rounded bg-rose-100 p-2 text-rose-700 group-hover:scale-105 transition-transform">
                    <Cpu className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-bold text-gray-900 block">Simulate CPU Spike (92.4%)</span>
                    <span className="text-[10px] text-gray-500">Triggers Critical Alert</span>
                  </div>
                </div>
                <Zap className="h-4 w-4 text-rose-500" />
              </button>

              <button
                type="button"
                onClick={() => simulateBreach('memory')}
                className="flex items-center justify-between rounded-lg border border-amber-200 bg-white p-3 hover:bg-amber-50/50 transition-colors text-left cursor-pointer group shadow-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="rounded bg-amber-100 p-2 text-amber-700 group-hover:scale-105 transition-transform">
                    <Layers className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-bold text-gray-900 block">Simulate Memory Surge (86.8%)</span>
                    <span className="text-[10px] text-gray-500">Triggers Warning Alert</span>
                  </div>
                </div>
                <Zap className="h-4 w-4 text-amber-500" />
              </button>

              <button
                type="button"
                onClick={() => simulateBreach('storage')}
                className="flex items-center justify-between rounded-lg border border-rose-200 bg-white p-3 hover:bg-rose-50/50 transition-colors text-left cursor-pointer group shadow-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="rounded bg-rose-100 p-2 text-rose-700 group-hover:scale-105 transition-transform">
                    <HardDrive className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-bold text-gray-900 block">Simulate Disk Full (88.5%)</span>
                    <span className="text-[10px] text-gray-500">Triggers Volume Warning</span>
                  </div>
                </div>
                <Zap className="h-4 w-4 text-rose-500" />
              </button>

              <button
                type="button"
                onClick={() => simulateBreach('network')}
                className="flex items-center justify-between rounded-lg border border-teal-200 bg-white p-3 hover:bg-teal-50/50 transition-colors text-left cursor-pointer group shadow-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="rounded bg-teal-100 p-2 text-teal-700 group-hover:scale-105 transition-transform">
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-bold text-gray-900 block">Simulate Bandwidth Surge (146 MB/s)</span>
                    <span className="text-[10px] text-gray-500">Triggers Saturation Alert</span>
                  </div>
                </div>
                <Zap className="h-4 w-4 text-teal-500" />
              </button>
            </div>

            {/* Active Breaches Summary List */}
            {activeBreaches.length > 0 && (
              <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50/30 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-900 flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
                    Currently Active Breaches ({activeBreaches.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => useThresholdStore.getState().clearAllBreaches()}
                    className="text-[11px] font-semibold text-rose-700 hover:underline cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>

                <div className="space-y-1.5">
                  {activeBreaches.map((b) => (
                    <div
                      key={b.id}
                      className="flex items-center justify-between rounded border border-rose-200 bg-white px-2.5 py-1.5 text-[11px]"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2 w-2 rounded-full ${
                            b.severity === 'critical' ? 'bg-rose-500' : 'bg-amber-500'
                          }`}
                        />
                        <span className="font-semibold text-gray-900">{b.label}</span>
                        <span className="font-mono text-gray-500">
                          ({b.currentValue}{b.unit} vs limit {b.thresholdValue}{b.unit})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => useThresholdStore.getState().dismissBreach(b.id)}
                        className="text-gray-400 hover:text-gray-700 text-xs px-1"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <DialogFooter className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-t border-gray-100 pt-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="gap-1 text-xs text-gray-600 hover:text-gray-900 rounded"
        >
          <RotateCcw className="h-3 w-3" />
          Reset Defaults
        </Button>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="rounded text-xs"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            className="gap-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Apply & Save Thresholds
          </Button>
        </div>
      </DialogFooter>
    </Dialog>
  );
}
