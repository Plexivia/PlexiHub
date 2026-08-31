import React from 'react';
import { Issue, Activity } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { IssueStatusBadge } from '../issues/IssueStatusBadge';
import { IssuePriorityBadge } from '../issues/IssuePriorityBadge';
import { ActivityTimeline } from '../issues/ActivityTimeline';
import { Button } from '../ui/button';
import { formatRelativeTime } from '../../lib/utils';
import { AlertCircle, History, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function RecentIssuesWidget({
  issues,
  projectId,
}: {
  issues: Issue[];
  projectId: string;
}) {
  const navigate = useNavigate();

  return (
    <Card className="h-full flex flex-col rounded-lg border border-gray-200 bg-white shadow-xs overflow-hidden">
      <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-xs font-bold uppercase tracking-wider text-gray-500">
          Recent Issues
        </CardTitle>
        <Button
          variant="ghost"
          size="xs"
          onClick={() => navigate(`/projects/${projectId}/issues`)}
          className="text-xs text-blue-600 hover:text-blue-700 gap-1 rounded"
        >
          View All <ArrowRight className="h-3 w-3" />
        </Button>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <div className="divide-y divide-gray-100">
          {issues.slice(0, 5).map((issue) => (
            <div
              key={issue.id}
              onClick={() => navigate(`/projects/${projectId}/issues/${issue.id}`)}
              className="flex items-center justify-between p-3.5 hover:bg-gray-50/80 cursor-pointer transition-colors"
            >
              <div className="min-w-0 flex-1 pr-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200/60">
                    {issue.id}
                  </span>
                  <IssuePriorityBadge priority={issue.priority} size="sm" />
                </div>
                <p className="truncate text-xs font-semibold text-gray-900 mt-1">
                  {issue.title}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Updated {formatRelativeTime(issue.updatedAt)} by {issue.assignee?.name || issue.createdBy.name}
                </p>
              </div>

              <div className="shrink-0">
                <IssueStatusBadge status={issue.status} size="sm" />
              </div>
            </div>
          ))}
          {issues.length === 0 && (
            <div className="p-6 text-center text-xs text-gray-500">
              No recent issues recorded for this project.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function RecentActivityWidget({ activities }: { activities: Activity[] }) {
  return (
    <Card className="h-full rounded-lg border border-gray-200 bg-white shadow-xs">
      <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-xs font-bold uppercase tracking-wider text-gray-500">
          Recent Operations Activity
        </CardTitle>
        <div className="rounded bg-gray-100 p-1.5 text-gray-600">
          <History className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <ActivityTimeline activities={activities} maxInitial={6} showToggle={false} />
      </CardContent>
    </Card>
  );
}
