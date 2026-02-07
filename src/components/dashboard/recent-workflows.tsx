'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { workflows } from '@/data/mockData';
import { getStatusColor, formatRelativeTime } from '@/lib/utils';

const statusLabels: Record<string, string> = {
  draft: 'Draft',
  active: 'Active',
  paused: 'Paused',
  completed: 'Completed',
  failed: 'Failed',
};

export function RecentWorkflows() {
  const recentWorkflows = workflows.slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Workflows</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentWorkflows.map((workflow) => (
            <div key={workflow.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${getStatusColor(workflow.status)}`} />
                  <span className="font-medium text-slate-900">{workflow.name}</span>
                </div>
                <Badge variant={workflow.status === 'active' ? 'success' : 'secondary'}>
                  {statusLabels[workflow.status]}
                </Badge>
              </div>
              <p className="text-sm text-slate-500">{workflow.description}</p>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{workflow.runCount} runs</span>
                <span>{workflow.successRate}% success</span>
              </div>
              <Progress value={workflow.successRate} size="sm" />
              {workflow.lastRun && (
                <p className="text-xs text-slate-400">
                  Last run: {formatRelativeTime(workflow.lastRun)}
                </p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
