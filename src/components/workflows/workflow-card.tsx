'use client';

import { Workflow } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { getStatusColor, formatRelativeTime, truncate } from '@/lib/utils';
import { Play, Pause, Edit, Copy, Trash2, GitBranch } from 'lucide-react';

interface WorkflowCardProps {
  workflow: Workflow;
  onEdit?: (workflowId: string) => void;
}

const statusLabels: Record<string, string> = {
  draft: 'Draft',
  active: 'Active',
  paused: 'Paused',
  completed: 'Completed',
  failed: 'Failed',
};

export function WorkflowCard({ workflow, onEdit }: WorkflowCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-slate-400" />
            <CardTitle className="text-lg">{workflow.name}</CardTitle>
          </div>
          <Badge variant={workflow.status === 'active' ? 'success' : workflow.status === 'draft' ? 'secondary' : 'warning'}>
            {statusLabels[workflow.status]}
          </Badge>
        </div>
        <p className="text-sm text-slate-500">{truncate(workflow.description, 80)}</p>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
          <span>{workflow.nodes.length} nodes</span>
          <span>{workflow.runCount} runs</span>
          {workflow.lastRun && (
            <span>Last: {formatRelativeTime(workflow.lastRun)}</span>
          )}
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Success Rate</span>
            <span className="font-medium text-slate-900">{workflow.successRate}%</span>
          </div>
          <Progress value={workflow.successRate} size="sm" />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={workflow.status === 'active' ? 'outline' : 'default'}
            size="sm"
            className="flex-1"
          >
            {workflow.status === 'active' ? (
              <>
                <Pause className="mr-2 h-4 w-4" />
                Pause
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Start
              </>
            )}
          </Button>
          <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => onEdit?.(workflow.id)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-9 w-9">
            <Copy className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-9 w-9 text-red-500 hover:text-red-600">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
