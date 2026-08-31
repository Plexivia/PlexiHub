import React from 'react';
import { useThresholdStore, ThresholdBreach } from '../../stores/thresholdStore';
import { AlertTriangle, Flame, Sliders, X, CheckCircle2, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';

interface ThresholdAlertBannerProps {
  onOpenConfig: () => void;
}

export function ThresholdAlertBanner({ onOpenConfig }: ThresholdAlertBannerProps) {
  const { activeBreaches, dismissBreach, clearAllBreaches } = useThresholdStore();

  if (activeBreaches.length === 0) {
    return null;
  }

  const criticalCount = activeBreaches.filter((b) => b.severity === 'critical').length;
  const warningCount = activeBreaches.filter((b) => b.severity === 'warning').length;

  return (
    <div
      id="dashboard-threshold-breach-banner"
      className={`rounded-xl border p-4 shadow-sm transition-all ${
        criticalCount > 0
          ? 'border-rose-300 bg-gradient-to-r from-rose-50 via-rose-50/70 to-amber-50/50 text-rose-950'
          : 'border-amber-300 bg-gradient-to-r from-amber-50 via-amber-50/70 to-orange-50/50 text-amber-950'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Left Side: Summary and Icons */}
        <div className="flex items-start sm:items-center gap-3">
          <div
            className={`rounded-lg p-2 shrink-0 ${
              criticalCount > 0 ? 'bg-rose-600 text-white' : 'bg-amber-500 text-white'
            }`}
          >
            {criticalCount > 0 ? (
              <Flame className="h-5 w-5 animate-pulse" />
            ) : (
              <AlertTriangle className="h-5 w-5" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold tracking-tight">
                {criticalCount > 0
                  ? `${criticalCount} Critical Server Telemetry Breach${criticalCount > 1 ? 'es' : ''} Detected`
                  : `${warningCount} Server Telemetry Warning${warningCount > 1 ? 's' : ''} Exceeded`}
              </h3>
              <div className="flex items-center gap-1.5">
                {criticalCount > 0 && (
                  <span className="rounded-full bg-rose-200/90 text-rose-900 border border-rose-300 px-2 py-0.5 text-[10px] font-bold">
                    {criticalCount} Critical
                  </span>
                )}
                {warningCount > 0 && (
                  <span className="rounded-full bg-amber-200/90 text-amber-900 border border-amber-300 px-2 py-0.5 text-[10px] font-bold">
                    {warningCount} Warning
                  </span>
                )}
              </div>
            </div>
            <p className="text-xs mt-0.5 opacity-90">
              Configured threshold limits have been breached. Review server performance and adjust monitoring thresholds or scale resources.
            </p>
          </div>
        </div>

        {/* Right Side: Actions */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <Button
            type="button"
            size="sm"
            onClick={onOpenConfig}
            className={`gap-1.5 text-xs font-semibold rounded shadow-xs ${
              criticalCount > 0
                ? 'bg-rose-700 hover:bg-rose-800 text-white'
                : 'bg-amber-600 hover:bg-amber-700 text-white'
            }`}
          >
            <Sliders className="h-3.5 w-3.5" />
            Configure Limits
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={clearAllBreaches}
            className="text-xs border-black/15 hover:bg-black/5 rounded text-slate-700"
            title="Acknowledge and dismiss all alerts"
          >
            Dismiss
          </Button>
        </div>
      </div>

      {/* Mini breach items preview */}
      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 pt-2 border-t border-black/10">
        {activeBreaches.map((b) => (
          <div
            key={b.id}
            className="flex items-center justify-between rounded-lg border border-black/10 bg-white/80 backdrop-blur-xs px-2.5 py-1.5 text-xs"
          >
            <div className="flex items-center gap-2 truncate">
              <span
                className={`h-2 w-2 rounded-full shrink-0 ${
                  b.severity === 'critical' ? 'bg-rose-600' : 'bg-amber-500'
                }`}
              />
              <span className="font-bold text-gray-900 truncate">{b.label}</span>
              <span className="font-mono text-[11px] text-gray-600">
                {b.currentValue}{b.unit} <span className="text-gray-400">/ max {b.thresholdValue}{b.unit}</span>
              </span>
            </div>
            <button
              type="button"
              onClick={() => dismissBreach(b.id)}
              className="text-gray-400 hover:text-gray-700 p-0.5 cursor-pointer ml-1"
              title="Dismiss this alert"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
