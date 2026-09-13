import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, ChevronDown, RotateCcw } from 'lucide-react';
import { Button } from '../ui/button';

export interface DateRange {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  preset?: string;
}

interface DateRangePickerProps {
  range: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
}

export function DateRangePicker({ range, onChange, className }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempStart, setTempStart] = useState(range.startDate);
  const [tempEnd, setTempEnd] = useState(range.endDate);

  const presets = [
    { label: 'Last 24 Hours', days: 1, id: '24h' },
    { label: 'Last 7 Days', days: 7, id: '7d' },
    { label: 'Last 14 Days', days: 14, id: '14d' },
    { label: 'Last 30 Days', days: 30, id: '30d' },
    { label: 'Last 90 Days', days: 90, id: '90d' },
    { label: 'Quarter to Date', days: 45, id: 'qtd' },
  ];

  const handleApplyPreset = (days: number, id: string) => {
    const end = new Date('2026-09-13T09:17:00Z');
    const start = new Date(end);
    start.setDate(end.getDate() - days);

    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];

    setTempStart(startStr);
    setTempEnd(endStr);
    onChange({ startDate: startStr, endDate: endStr, preset: id });
    setIsOpen(false);
  };

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempStart || !tempEnd) return;
    onChange({
      startDate: tempStart <= tempEnd ? tempStart : tempEnd,
      endDate: tempEnd >= tempStart ? tempEnd : tempStart,
      preset: 'custom',
    });
    setIsOpen(false);
  };

  const formatDisplay = () => {
    const activePreset = presets.find((p) => p.id === range.preset);
    if (activePreset && range.preset !== 'custom') {
      return `${activePreset.label} (${range.startDate} to ${range.endDate})`;
    }
    return `${range.startDate} to ${range.endDate}`;
  };

  return (
    <div className={`relative inline-block text-left ${className || ''}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-2xs hover:bg-slate-50 hover:border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-sky-500 transition-all cursor-pointer"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        <CalendarIcon className="h-3.5 w-3.5 text-sky-600" />
        <span className="truncate max-w-[200px] sm:max-w-none">{formatDisplay()}</span>
        <ChevronDown className="h-3.5 w-3.5 text-slate-400 ml-1" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 z-50 w-80 sm:w-96 rounded-xl border border-slate-200 bg-white p-4 shadow-xl ring-1 ring-black/5 animate-in fade-in-50 zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <Clock className="h-4 w-4 text-sky-600" />
                <span>Select Telemetry Timeframe</span>
              </div>
              <button
                type="button"
                onClick={() => handleApplyPreset(30, '30d')}
                className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800 cursor-pointer"
                title="Reset to 30 days"
              >
                <RotateCcw className="h-3 w-3" />
                Reset
              </button>
            </div>

            {/* Quick Presets Grid */}
            <div className="space-y-1.5 mb-4">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Quick Presets
              </span>
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                {presets.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleApplyPreset(preset.days, preset.id)}
                    className={`rounded-md px-2 py-1.5 text-xs font-semibold text-center transition-all cursor-pointer ${
                      range.preset === preset.id
                        ? 'bg-sky-600 text-white shadow-xs'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/60'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Range Inputs */}
            <form onSubmit={handleApplyCustom} className="space-y-3 border-t border-slate-100 pt-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Custom Date Range
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={tempStart}
                    onChange={(e) => setTempStart(e.target.value)}
                    className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 shadow-2xs focus:border-sky-500 focus:outline-hidden focus:ring-1 focus:ring-sky-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={tempEnd}
                    onChange={(e) => setTempEnd(e.target.value)}
                    className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 shadow-2xs focus:border-sky-500 focus:outline-hidden focus:ring-1 focus:ring-sky-500"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="xs"
                  className="bg-sky-600 hover:bg-sky-700 text-white"
                >
                  Apply Range
                </Button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
