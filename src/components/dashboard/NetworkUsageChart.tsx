import React from 'react';
import { ServerMetrics } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Activity, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export function NetworkUsageChart({ metrics }: { metrics: ServerMetrics }) {
  return (
    <Card className="h-full rounded-lg border border-gray-200 bg-white shadow-xs">
      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-xs font-bold uppercase tracking-wider text-gray-500">
          Network Usage
        </CardTitle>
        <div className="flex items-center gap-2 text-[11px] font-semibold">
          <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            <ArrowDownLeft className="h-3 w-3" />
            {metrics.incomingNetworkMb} MB/s
          </span>
          <span className="flex items-center gap-1 text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            <ArrowUpRight className="h-3 w-3" />
            {metrics.outgoingNetworkMb} MB/s
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-28 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={metrics.networkHistory}
              margin={{ top: 5, right: 0, left: -25, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded border border-gray-200 bg-white p-2 text-xs shadow-md space-y-1">
                        <p className="font-bold text-gray-800">{label}</p>
                        <p className="text-emerald-700">In: {payload[0]?.value} MB/s</p>
                        <p className="text-blue-700">Out: {payload[1]?.value} MB/s</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="inMb"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorIn)"
              />
              <Area
                type="monotone"
                dataKey="outMb"
                stroke="#2563eb"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorOut)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
