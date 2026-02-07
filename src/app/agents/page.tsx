'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { AgentCard } from '@/components/agents/agent-card';
import { AgentFilters } from '@/components/agents/agent-filters';
import { Button } from '@/components/ui/button';
import { agents } from '@/data/mockData';
import { Plus, Grid3X3, List } from 'lucide-react';

export default function AgentsPage() {
  const router = useRouter();
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredAgents = useMemo(() => {
    return agents.filter((agent) => {
      if (selectedDepartment && agent.departmentId !== selectedDepartment) return false;
      if (selectedLevel && agent.level !== selectedLevel) return false;
      return true;
    });
  }, [selectedDepartment, selectedLevel]);

  const handleChat = (agentId: string) => {
    router.push('/chat');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className="ml-64">
        <Header />
        <main className="p-6">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">AI Agents</h1>
              <p className="text-slate-500">Manage your marketing workforce</p>
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Agent
            </Button>
          </div>

          <div className="mb-6 rounded-lg border border-slate-200 bg-white p-4">
            <AgentFilters
              selectedDepartment={selectedDepartment}
              selectedLevel={selectedLevel}
              onDepartmentChange={setSelectedDepartment}
              onLevelChange={setSelectedLevel}
            />
          </div>

          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Showing {filteredAgents.length} of {agents.length} agents
            </p>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredAgents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} onChat={handleChat} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
