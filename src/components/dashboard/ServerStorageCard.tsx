import React from 'react';
import { ServerMetrics } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Progress } from '../ui/progress';
import { HardDrive, AlertCircle } from 'lucide-react';

export function ServerStorageCard({ metrics }: { metrics: ServerMetrics }) {
  const getIndicatorColor = (percent: number) => {
    if (percent > 85) return 'bg-red-500';
    if (percent > 70) return 'bg-amber-500';
    return 'bg-blue-600';
  };

  return (
    <Card className="h-full rounded-lg border border-gray-200 bg-white shadow-xs">
      <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-xs font-bold uppercase tracking-wider text-gray-500">
          Server Storage
        </CardTitle>
        <div className="rounded bg-gray-100 p-1.5 text-gray-600">
          <HardDrive className="h-4 w-4" />
        </div>
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
          <span className={`text-xs font-semibold ${metrics.storageUsagePercent > 80 ? 'text-red-600' : 'text-gray-700'}`}>
            {metrics.storageUsagePercent.toFixed(1)}% Used
          </span>
        </div>

        <Progress
          value={metrics.storageUsagePercent}
          className="h-2 bg-gray-100 rounded"
          indicatorClassName={getIndicatorColor(metrics.storageUsagePercent)}
        />

        <div className="flex items-center justify-between pt-1 text-[11px] text-gray-500 border-t border-gray-100">
          <span>Available Space</span>
          <span className="font-semibold text-gray-800">{metrics.storageAvailableGb} GB free</span>
        </div>
      </CardContent>
    </Card>
  );
}

export function ServerHealthCard({ metrics }: { metrics: ServerMetrics }) {
  const healthBadge = {
    Healthy: { label: 'Healthy', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    Warning: { label: 'Warning', bg: 'bg-amber-50 text-amber-800 border-amber-200' },
    Critical: { label: 'Critical', bg: 'bg-red-50 text-red-600 border-red-200' },
  }[metrics.health];

  return (
    <Card className="h-full rounded-lg border border-gray-200 bg-white shadow-xs">
      <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-xs font-bold uppercase tracking-wider text-gray-500">
          Server Health
        </CardTitle>
        <span
          className={`inline-flex items-center gap-1.5 rounded border px-2 py-0.5 text-xs font-semibold ${healthBadge.bg}`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {healthBadge.label}
        </span>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded border border-gray-200 bg-gray-50 p-2.5">
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-[10px] font-bold uppercase text-gray-500">CPU Load</span>
              <span className="text-xs font-bold text-gray-900">{metrics.cpuPercent}%</span>
            </div>
            <Progress
              value={metrics.cpuPercent}
              className="h-1.5 bg-gray-200 rounded"
              indicatorClassName={metrics.cpuPercent > 80 ? 'bg-red-500' : 'bg-gray-800'}
            />
          </div>

          <div className="rounded border border-gray-200 bg-gray-50 p-2.5">
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-[10px] font-bold uppercase text-gray-500">Memory</span>
              <span className="text-xs font-bold text-gray-900">{metrics.memoryPercent}%</span>
            </div>
            <Progress
              value={metrics.memoryPercent}
              className="h-1.5 bg-gray-200 rounded"
              indicatorClassName={metrics.memoryPercent > 80 ? 'bg-amber-500' : 'bg-gray-800'}
            />
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
