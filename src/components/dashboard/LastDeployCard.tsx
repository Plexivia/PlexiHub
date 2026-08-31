import React from 'react';
import { Deployment } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { formatDate, formatTime } from '../../lib/utils';
import { Rocket, GitCommit, UserCheck, CheckCircle2 } from 'lucide-react';

export function LastDeployCard({ deployment }: { deployment: Deployment }) {
  return (
    <Card className="h-full rounded-lg border border-gray-200 bg-white shadow-xs">
      <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-xs font-bold uppercase tracking-wider text-gray-500">
          Last Deployment
        </CardTitle>
        <Badge
          variant={deployment.status === 'Success' ? 'success' : 'destructive'}
          className="text-xs gap-1 rounded"
        >
          <CheckCircle2 className="h-3 w-3" />
          {deployment.status}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3 text-xs">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] text-gray-500 italic">Environment</span>
            <p className="font-bold text-gray-900">{deployment.environment}</p>
          </div>
          <div className="space-y-1 text-right">
            <span className="text-[11px] text-gray-500 italic">Deployed On</span>
            <p className="font-semibold text-gray-800">
              {formatDate(deployment.deployedAt)}, {formatTime(deployment.deployedAt)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-100">
          <div className="rounded bg-gray-50 border border-gray-200 p-2">
            <span className="text-[10px] uppercase font-bold text-gray-400">Backend Ver.</span>
            <p className="font-mono font-bold text-gray-900">B{deployment.backendVersion}</p>
          </div>
          <div className="rounded bg-gray-50 border border-gray-200 p-2">
            <span className="text-[10px] uppercase font-bold text-gray-400">Dashboard Ver.</span>
            <p className="font-mono font-bold text-gray-900">D-{deployment.dashboardVersion}</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1 text-[11px] text-gray-500 border-t border-gray-100">
          <div className="flex items-center gap-1.5">
            <UserCheck className="h-3.5 w-3.5 text-gray-400" />
            <span>Triggered by <strong className="text-gray-900 font-semibold">{deployment.triggeredBy}</strong></span>
          </div>
          <div className="flex items-center gap-1 font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">
            <GitCommit className="h-3 w-3 text-gray-400" />
            {deployment.gitCommitHash}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
