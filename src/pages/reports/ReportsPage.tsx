import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useProjectStore } from '../../stores/projectStore';
import { issueService } from '../../services/issue.service';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Select } from '../../components/ui/select';
import { Button } from '../../components/ui/button';
import { LoadingState, ErrorState } from '../../components/ui/states';
import { IssueStatusBadge } from '../../components/issues/IssueStatusBadge';
import { IssuePriorityBadge } from '../../components/issues/IssuePriorityBadge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Download,
  Calendar,
  Layers,
} from 'lucide-react';

export function ReportsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const currentProject = useProjectStore((s) => s.currentProject);
  const selectProject = useProjectStore((s) => s.selectProject);

  const activeProjectId = projectId || currentProject?.id || 'proj_1';

  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    if (activeProjectId && activeProjectId !== currentProject?.id) {
      selectProject(activeProjectId);
    }
  }, [activeProjectId, currentProject?.id, selectProject]);

  useEffect(() => {
    async function loadReportData() {
      setLoading(true);
      const res = await issueService.getIssues(activeProjectId, { limit: 100 });
      const issues = res.issues;

      const total = issues.length;
      const resolved = issues.filter((i) => i.status === 'Resolved' || i.status === 'Closed').length;
      const open = total - resolved;
      const critical = issues.filter((i) => i.priority === 'Critical').length;
      const high = issues.filter((i) => i.priority === 'High').length;
      const medium = issues.filter((i) => i.priority === 'Medium').length;
      const low = issues.filter((i) => i.priority === 'Low').length;

      const statusMap = {
        Created: issues.filter((i) => i.status === 'Created').length,
        Open: issues.filter((i) => i.status === 'Open').length,
        'In Progress': issues.filter((i) => i.status === 'In Progress').length,
        'Waiting for Client': issues.filter((i) => i.status === 'Waiting for Client').length,
        Resolved: issues.filter((i) => i.status === 'Resolved').length,
        Closed: issues.filter((i) => i.status === 'Closed').length,
      };

      const statusData = Object.entries(statusMap).map(([status, count]) => ({
        status,
        count,
      }));

      const priorityData = [
        { name: 'Critical', value: critical, color: '#e11d48' },
        { name: 'High', value: high, color: '#f59e0b' },
        { name: 'Medium', value: medium, color: '#0284c7' },
        { name: 'Low', value: low, color: '#64748b' },
      ];

      const trendData = [
        { date: 'Day 1-5', created: 6, resolved: 4 },
        { date: 'Day 6-10', created: 8, resolved: 7 },
        { date: 'Day 11-15', created: 4, resolved: 5 },
        { date: 'Day 16-20', created: 9, resolved: 8 },
        { date: 'Day 21-25', created: 5, resolved: 6 },
        { date: 'Day 26-30', created: 7, resolved: 8 },
      ];

      setMetrics({
        total,
        resolved,
        open,
        resolutionRate: total > 0 ? ((resolved / total) * 100).toFixed(1) : '0',
        mttr: '4.2 hrs',
        slaCompliance: '98.4%',
        statusData,
        priorityData,
        trendData,
      });

      setLoading(false);
    }

    loadReportData();
  }, [activeProjectId, timeRange]);

  if (loading || !metrics) {
    return <LoadingState message="Generating operational analytics..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
              {currentProject?.name} Operational Reports
            </h1>
            <span className="font-mono text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
              {currentProject?.code}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            SLA compliance, MTTR diagnostics, and bug resolution velocity metrics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="text-xs h-9 w-36"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="gap-1.5 text-xs text-slate-700"
          >
            <Download className="h-3.5 w-3.5" />
            Export Report
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-2xs">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Issues
            </CardTitle>
            <Layers className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-slate-900">{metrics.total}</div>
            <p className="text-[11px] text-slate-500 mt-1">
              <strong className="text-slate-800">{metrics.open}</strong> active incidents
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-2xs">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Resolution Rate
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-emerald-600">{metrics.resolutionRate}%</div>
            <p className="text-[11px] text-slate-500 mt-1">
              {metrics.resolved} of {metrics.total} resolved or closed
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-2xs">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Mean Time to Resolve (MTTR)
            </CardTitle>
            <Clock className="h-4 w-4 text-sky-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-slate-900">{metrics.mttr}</div>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1">
              ↓ 14% improvement this period
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-2xs">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">
              SLA Compliance
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-indigo-600">{metrics.slaCompliance}</div>
            <p className="text-[11px] text-slate-500 mt-1">
              Target benchmark: &gt;95.0%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Trend Line Chart (7 cols) */}
        <div className="lg:col-span-7">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Created vs. Resolved Velocity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metrics.trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="created"
                      name="Created"
                      stroke="#f43f5e"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="resolved"
                      name="Resolved"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Priority Breakdown (5 cols) */}
        <div className="lg:col-span-5">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Priority Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={metrics.priorityData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {metrics.priorityData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                {metrics.priorityData.map((p: any) => (
                  <div key={p.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                      <span className="text-slate-600 font-medium">{p.name}</span>
                    </div>
                    <span className="font-bold text-slate-900">{p.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Status Bar Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Current Status Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.statusData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="status" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
                <Tooltip />
                <Bar dataKey="count" name="Issues" fill="#0284c7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
