'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { departments, departmentMetrics } from '@/data/mockData';
import { Progress } from '@/components/ui/progress';

const iconMap: Record<string, string> = {
  Crown: '👑',
  FileText: '📄',
  Share2: '🔊',
  Target: '🎯',
  Search: '🔍',
  Palette: '🎨',
  Mail: '✉️',
};

export function DepartmentOverview() {
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Department Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {departments.map((dept) => {
            const metrics = departmentMetrics.find((m) => m.departmentId === dept.id);
            return (
              <div
                key={dept.id}
                className="rounded-lg border border-slate-200 p-4 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-lg"
                    style={{ backgroundColor: `${dept.color}20` }}
                  >
                    {iconMap[dept.icon] || '📊'}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{dept.name}</p>
                    <p className="text-xs text-slate-500">{dept.agentCount} agents</p>
                  </div>
                </div>
                {metrics && (
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Success Rate</span>
                      <span className="font-medium text-slate-900">{metrics.successRate}%</span>
                    </div>
                    <Progress value={metrics.successRate} size="sm" />
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>{metrics.tasksCompleted} tasks</span>
                      <span>{metrics.avgResponseTime}h avg</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
