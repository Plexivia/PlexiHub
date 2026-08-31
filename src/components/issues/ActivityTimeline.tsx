import React, { useState } from 'react';
import { Activity } from '../../types';
import { Avatar } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { formatRelativeTime, formatDateTime } from '../../lib/utils';
import { Button } from '../ui/button';
import { ChevronDown, ChevronUp, History } from 'lucide-react';

interface ActivityTimelineProps {
  activities: Activity[];
  maxInitial?: number;
  showToggle?: boolean;
}

export function ActivityTimeline({ activities, maxInitial = 5, showToggle = true }: ActivityTimelineProps) {
  const [expanded, setExpanded] = useState(false);

  if (!activities || activities.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-dashed border-slate-200 bg-slate-50/50 p-4 text-xs text-slate-500">
        <History className="h-4 w-4 text-slate-400" />
        <span>No recent activity recorded.</span>
      </div>
    );
  }

  const displayedActivities = expanded ? activities : activities.slice(0, maxInitial);

  return (
    <div className="space-y-3">
      <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200/80">
        {displayedActivities.map((act) => {
          const roleVariant =
            act.user.role === 'Owner'
              ? 'warning'
              : act.user.role === 'Admin'
              ? 'destructive'
              : 'info';

          return (
            <div key={act.id} className="relative group">
              {/* Dot on line */}
              <div className="absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2 border-white bg-slate-400 ring-1 ring-slate-300 group-hover:bg-sky-600 transition-colors" />

              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Avatar src={act.user.avatarUrl} name={act.user.name} size="xs" />
                  <span className="text-xs font-semibold text-slate-900">{act.user.name}</span>
                  <Badge variant={roleVariant} className="px-1.5 py-0 text-[10px]">
                    {act.user.role}
                  </Badge>
                  <span className="text-xs text-slate-600 font-medium">{act.action}</span>
                </div>
                <span
                  title={formatDateTime(act.timestamp)}
                  className="text-[11px] text-slate-400 whitespace-nowrap shrink-0"
                >
                  {formatRelativeTime(act.timestamp)}
                </span>
              </div>

              {act.details && (
                <p className="mt-1 ml-7 text-xs text-slate-500 bg-slate-50 border border-slate-100 rounded-md px-2.5 py-1.5 font-mono">
                  {act.details}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {showToggle && activities.length > maxInitial && (
        <div className="pt-2">
          <Button
            variant="ghost"
            size="xs"
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-sky-700 hover:text-sky-800 gap-1 pl-2"
          >
            {expanded ? (
              <>
                <ChevronUp className="h-3.5 w-3.5" />
                Show latest {maxInitial} only
              </>
            ) : (
              <>
                <ChevronDown className="h-3.5 w-3.5" />
                View all {activities.length} activities
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
