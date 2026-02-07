'use client';

import { Agent } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { getInitials, getLevelBadgeColor, getStatusColor, truncate } from '@/lib/utils';
import { MessageSquare, Settings, Play, Pause } from 'lucide-react';

interface AgentCardProps {
  agent: Agent;
  onChat?: (agentId: string) => void;
}

const levelLabels: Record<string, string> = {
  executive: 'Executive',
  director: 'Director',
  specialist: 'Specialist',
};

export function AgentCard({ agent, onChat }: AgentCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar fallback={getInitials(agent.name)} size="lg" />
            <div>
              <h3 className="font-semibold text-slate-900">{agent.name}</h3>
              <p className="text-sm text-slate-500">{agent.role}</p>
              <div className="mt-1 flex items-center gap-2">
                <Badge className={getLevelBadgeColor(agent.level)} variant="secondary">
                  {levelLabels[agent.level]}
                </Badge>
                <div className="flex items-center gap-1">
                  <div className={`h-2 w-2 rounded-full ${getStatusColor(agent.status)}`} />
                  <span className="text-xs text-slate-500 capitalize">{agent.status}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              {agent.status === 'working' ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onChat?.(agent.id)}>
              <MessageSquare className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <p className="mt-3 text-sm text-slate-600">{truncate(agent.description, 100)}</p>

        <div className="mt-4">
          <p className="text-xs font-medium text-slate-500 mb-2">Skills</p>
          <div className="flex flex-wrap gap-1">
            {agent.skills.slice(0, 4).map((skill) => (
              <Badge key={skill} variant="outline" className="text-xs">
                {skill}
              </Badge>
            ))}
            {agent.skills.length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{agent.skills.length - 4}
              </Badge>
            )}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4 border-t border-slate-100 pt-4">
          <div>
            <p className="text-xs text-slate-500">Tasks</p>
            <p className="text-lg font-semibold text-slate-900">{agent.kpis.tasksCompleted}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Success</p>
            <p className="text-lg font-semibold text-slate-900">{agent.kpis.successRate}%</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Response</p>
            <p className="text-lg font-semibold text-slate-900">{agent.kpis.avgResponseTime}h</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
