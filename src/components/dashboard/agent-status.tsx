'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { agents } from '@/data/mockData';
import { getStatusColor, getInitials } from '@/lib/utils';

const statusLabels: Record<string, string> = {
  idle: 'Idle',
  working: 'Working',
  paused: 'Paused',
  error: 'Error',
};

export function AgentStatus() {
  const activeAgents = agents.filter((a) => a.isActive).slice(0, 6);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agent Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activeAgents.map((agent) => (
            <div key={agent.id} className="flex items-center gap-3">
              <Avatar fallback={getInitials(agent.name)} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{agent.name}</p>
                <p className="text-xs text-slate-500 truncate">{agent.role}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${getStatusColor(agent.status)}`} />
                <span className="text-xs text-slate-500">{statusLabels[agent.status]}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
