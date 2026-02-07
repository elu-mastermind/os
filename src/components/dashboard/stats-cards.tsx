'use client';

import { Users, Workflow, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { analyticsMetrics } from '@/data/mockData';

const stats = [
  {
    name: 'Active Agents',
    value: `${analyticsMetrics.activeAgents}/${analyticsMetrics.totalAgents}`,
    change: '+2 this week',
    icon: Users,
    color: 'bg-blue-500',
  },
  {
    name: 'Workflows Completed',
    value: analyticsMetrics.completedWorkflows.toString(),
    change: '+12 this week',
    icon: Workflow,
    color: 'bg-purple-500',
  },
  {
    name: 'Tasks Completed',
    value: analyticsMetrics.completedTasks.toLocaleString(),
    change: '+89 this week',
    icon: CheckCircle,
    color: 'bg-green-500',
  },
  {
    name: 'Avg Response Time',
    value: `${analyticsMetrics.avgCompletionTime}h`,
    change: '-0.3h improvement',
    icon: Clock,
    color: 'bg-orange-500',
  },
];

export function StatsCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.name}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.name}</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{stat.value}</p>
                <p className="mt-1 text-xs text-green-600">{stat.change}</p>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
