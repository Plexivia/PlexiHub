import React from 'react';
import { Container } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Box, Play, AlertTriangle, RefreshCw } from 'lucide-react';

export function ContainerList({ containers }: { containers: Container[] }) {
  const getStatusBadge = (status: Container['status']) => {
    switch (status) {
      case 'Running':
        return <Badge variant="success" className="text-[10px] py-0">Running</Badge>;
      case 'Degraded':
        return <Badge variant="warning" className="text-[10px] py-0">Degraded</Badge>;
      case 'Stopped':
        return <Badge variant="destructive" className="text-[10px] py-0">Stopped</Badge>;
    }
  };

  return (
    <Card className="rounded-lg border border-gray-200 bg-white shadow-xs overflow-hidden">
      <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Running Containers & Pods
          </CardTitle>
          <p className="text-xs text-gray-500 mt-0.5">
            {containers.filter((c) => c.status === 'Running').length} of {containers.length} containers healthy
          </p>
        </div>
        <div className="rounded bg-gray-100 p-1.5 text-gray-600">
          <Box className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-y border-gray-200 bg-gray-50 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                <th className="py-2.5 px-4">Container Name</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4">CPU</th>
                <th className="py-2.5 px-4">Memory</th>
                <th className="py-2.5 px-4">Uptime</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {containers.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-2.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-emerald-500" />
                      <div>
                        <p className="font-mono text-xs font-bold text-gray-900">{c.name}</p>
                        <p className="text-[10px] text-gray-400 font-mono">{c.image}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 px-4">{getStatusBadge(c.status)}</td>
                  <td className="py-2.5 px-4 font-mono font-semibold text-gray-900">{c.cpu}</td>
                  <td className="py-2.5 px-4 font-mono text-gray-600">{c.memory}</td>
                  <td className="py-2.5 px-4 font-mono text-gray-500">{c.uptime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
