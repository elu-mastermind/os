import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { ActivityChart } from '@/components/dashboard/activity-chart';
import { RecentWorkflows } from '@/components/dashboard/recent-workflows';
import { AgentStatus } from '@/components/dashboard/agent-status';
import { DepartmentOverview } from '@/components/dashboard/department-overview';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className="ml-64">
        <Header />
        <main className="p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-500">Welcome back to your AI marketing workforce</p>
          </div>

          <StatsCards />

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <ActivityChart />
            <RecentWorkflows />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-4">
            <AgentStatus />
          </div>

          <div className="mt-6">
            <DepartmentOverview />
          </div>
        </main>
      </div>
    </div>
  );
}
