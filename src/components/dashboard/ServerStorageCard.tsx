import React from 'react';
import { ServerMetrics } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Progress } from '../ui/progress';
import { HardDrive, AlertCircle, AlertTriangle, Flame } from 'lucide-react';
import { useThresholdStore } from '../../stores/thresholdStore';

export function ServerStorageCard({
  metrics,
  onOpenThresholds,
}: {
  metrics: ServerMetrics;
  onOpenThresholds?: () => void;
}) {
  const thresholds = useThresholdStore((s) => s.thresholds);

  const isStorageCritical = metrics.storageUsagePercent >= thresholds.storageCritical;
  const isStorageWarning = metrics.storageUsagePercent >= thresholds.storageWarning;
  const isHeadroomWarning = metrics.storageAvailableGb <= thresholds.minStorageFreeGb;

  const getIndicatorColor = (percent: number) => {
    if (percent >= thresholds.storageCritical) return 'bg-red-500';
    if (percent >= thresholds.storageWarning) return 'bg-amber-500';
    return 'bg-blue-600';
  };

  return (
    <Card
      className={`h-full rounded-lg border bg-white shadow-xs transition-colors ${
        isStorageCritical
          ? 'border-red-300 ring-1 ring-red-200'
          : isStorageWarning
          ? 'border-amber-300 ring-1 ring-amber-200'
          : 'border-gray-200'
      }`}
    >
      <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
          Server Storage
          {isStorageCritical && (
            <span className="inline-flex items-center gap-0.5 rounded bg-red-100 text-red-700 px-1 py-0.2 text-[9px] font-bold">
              <Flame className="h-2.5 w-2.5" /> CRIT
            </span>
          )}
        </CardTitle>
        <button
          type="button"
          onClick={onOpenThresholds}
          title="Configure Storage Thresholds"
          className="rounded bg-gray-100 p-1.5 text-gray-600 hover:bg-blue-50 hover:text-blue-600 cursor-pointer transition-colors"
        >
          <HardDrive className="h-4 w-4" />
        </button>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-gray-900">
              {metrics.storageUsedGb}
            </span>
            <span className="text-xs font-medium text-gray-400">
              / {metrics.storageTotalGb} GB
            </span>
          </div>
          <span
            className={`text-xs font-semibold ${
              isStorageCritical
                ? 'text-red-600'
                : isStorageWarning
                ? 'text-amber-600'
                : 'text-gray-700'
            }`}
          >
            {metrics.storageUsagePercent.toFixed(1)}% Used
          </span>
        </div>

        <div className="space-y-1">
          <Progress
            value={metrics.storageUsagePercent}
            className="h-2 bg-gray-100 rounded"
            indicatorClassName={getIndicatorColor(metrics.storageUsagePercent)}
          />
          <div className="flex justify-between text-[10px] text-gray-400 font-mono">
            <span>0%</span>
            <span title="Configured Warning Threshold" className="text-amber-600 font-semibold">
              Warn: {thresholds.storageWarning}%
            </span>
            <span title="Configured Critical Threshold" className="text-red-600 font-semibold">
              Crit: {thresholds.storageCritical}%
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1 text-[11px] text-gray-500 border-t border-gray-100">
          <span>Available Space</span>
          <span
            className={`font-semibold ${
              isHeadroomWarning ? 'text-red-600 font-bold' : 'text-gray-800'
            }`}
          >
            {metrics.storageAvailableGb} GB free
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export function ServerHealthCard({
  metrics,
  onOpenThresholds,
}: {
  metrics: ServerMetrics;
  onOpenThresholds?: () => void;
}) {
  const thresholds = useThresholdStore((s) => s.thresholds);

  const isCpuCritical = metrics.cpuPercent >= thresholds.cpuCritical;
  const isCpuWarning = metrics.cpuPercent >= thresholds.cpuWarning;
  const isMemCritical = metrics.memoryPercent >= thresholds.memoryCritical;
  const isMemWarning = metrics.memoryPercent >= thresholds.memoryWarning;

  // Determine overall badge
  const healthBadge = isCpuCritical || isMemCritical
    ? { label: 'Critical Breach', bg: 'bg-red-50 text-red-700 border-red-200' }
    : isCpuWarning || isMemWarning || metrics.health === 'Warning'
    ? { label: 'Warning Threshold', bg: 'bg-amber-50 text-amber-800 border-amber-200' }
    : { label: 'Healthy', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };

  return (
    <Card
      className={`h-full rounded-lg border bg-white shadow-xs transition-colors ${
        isCpuCritical || isMemCritical
          ? 'border-red-300 ring-1 ring-red-200'
          : isCpuWarning || isMemWarning
          ? 'border-amber-300 ring-1 ring-amber-200'
          : 'border-gray-200'
      }`}
    >
      <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-xs font-bold uppercase tracking-wider text-gray-500">
          Server Health
        </CardTitle>
        <button
          type="button"
          onClick={onOpenThresholds}
          className={`inline-flex items-center gap-1.5 rounded border px-2 py-0.5 text-xs font-semibold cursor-pointer hover:opacity-90 transition-opacity ${healthBadge.bg}`}
          title="Click to adjust health thresholds"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {healthBadge.label}
        </button>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          {/* CPU Progress */}
          <div
            className={`rounded border p-2.5 ${
              isCpuCritical
                ? 'border-red-200 bg-red-50/40'
                : isCpuWarning
                ? 'border-amber-200 bg-amber-50/40'
                : 'border-gray-200 bg-gray-50'
            }`}
          >
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-[10px] font-bold uppercase text-gray-500">CPU Load</span>
              <span
                className={`text-xs font-bold ${
                  isCpuCritical
                    ? 'text-red-600'
                    : isCpuWarning
                    ? 'text-amber-600'
                    : 'text-gray-900'
                }`}
              >
                {metrics.cpuPercent}%
              </span>
            </div>
            <Progress
              value={metrics.cpuPercent}
              className="h-1.5 bg-gray-200 rounded"
              indicatorClassName={
                isCpuCritical ? 'bg-red-500' : isCpuWarning ? 'bg-amber-500' : 'bg-gray-800'
              }
            />
            <div className="mt-1 flex justify-between text-[9px] text-gray-400 font-mono">
              <span>Lim: {thresholds.cpuWarning}%</span>
              <span>Crit: {thresholds.cpuCritical}%</span>
            </div>
          </div>

          {/* Memory Progress */}
          <div
            className={`rounded border p-2.5 ${
              isMemCritical
                ? 'border-red-200 bg-red-50/40'
                : isMemWarning
                ? 'border-amber-200 bg-amber-50/40'
                : 'border-gray-200 bg-gray-50'
            }`}
          >
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-[10px] font-bold uppercase text-gray-500">Memory</span>
              <span
                className={`text-xs font-bold ${
                  isMemCritical
                    ? 'text-red-600'
                    : isMemWarning
                    ? 'text-amber-600'
                    : 'text-gray-900'
                }`}
              >
                {metrics.memoryPercent}%
              </span>
            </div>
            <Progress
              value={metrics.memoryPercent}
              className="h-1.5 bg-gray-200 rounded"
              indicatorClassName={
                isMemCritical ? 'bg-red-500' : isMemWarning ? 'bg-amber-500' : 'bg-gray-800'
              }
            />
            <div className="mt-1 flex justify-between text-[9px] text-gray-400 font-mono">
              <span>Lim: {thresholds.memoryWarning}%</span>
              <span>Crit: {thresholds.memoryCritical}%</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1 text-[11px] text-gray-500 border-t border-gray-100">
          <span>System Uptime</span>
          <span className="font-semibold font-mono text-gray-800">{metrics.uptimeString}</span>
        </div>
      </CardContent>
    </Card>
  );
}

