import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { PerformanceChart } from '@/components/analytics/performance-chart';
import { MetricsGrid } from '@/components/analytics/metrics-grid';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { analyticsMetrics, departmentMetrics } from '@/data/mockData';

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className="ml-64">
        <Header />
        <main className="p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
            <p className="text-slate-500">Monitor your AI workforce performance</p>
          </div>

          <StatsCards />

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <PerformanceChart />
            <Card>
              <CardHeader>
                <CardTitle>System Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-500">Overall Success Rate</span>
                    <span className="font-semibold text-slate-900">{analyticsMetrics.successRate}%</span>
                  </div>
                  <Progress value={analyticsMetrics.successRate} size="md" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-500">Agent Utilization</span>
                    <span className="font-semibold text-slate-900">
                      {Math.round((analyticsMetrics.activeAgents / analyticsMetrics.totalAgents) * 100)}%
                    </span>
                  </div>
                  <Progress
                    value={(analyticsMetrics.activeAgents / analyticsMetrics.totalAgents) * 100}
                    size="md"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-500">Task Completion</span>
                    <span className="font-semibold text-slate-900">
                      {Math.round((analyticsMetrics.completedTasks / analyticsMetrics.totalTasks) * 100)}%
                    </span>
                  </div>
                  <Progress
                    value={(analyticsMetrics.completedTasks / analyticsMetrics.totalTasks) * 100}
                    size="md"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Department Performance</h2>
            <MetricsGrid />
          </div>
        </main>
      </div>
    </div>
  );
}
