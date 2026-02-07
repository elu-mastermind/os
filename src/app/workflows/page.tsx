'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { WorkflowCard } from '@/components/workflows/workflow-card';
import { WorkflowBuilder } from '@/components/workflows/workflow-builder';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { workflows } from '@/data/mockData';
import { Plus, Filter, Grid3X3, List } from 'lucide-react';

export default function WorkflowsPage() {
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filter, setFilter] = useState<string | null>(null);

  const filteredWorkflows = workflows.filter((wf) => {
    if (filter === null) return true;
    if (filter === 'active') return wf.status === 'active';
    if (filter === 'draft') return wf.status === 'draft';
    if (filter === 'paused') return wf.status === 'paused';
    return true;
  });

  const handleEdit = (workflowId: string) => {
    setEditingWorkflow(workflowId);
    setIsBuilderOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className="ml-64">
        <Header />
        <main className="p-6">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Workflows</h1>
              <p className="text-slate-500">Automate your marketing processes</p>
            </div>
            <Button onClick={() => setIsBuilderOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Workflow
            </Button>
          </div>

          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <span className="text-sm text-slate-500">Filter:</span>
              <div className="flex gap-2">
                <Badge
                  variant={filter === null ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setFilter(null)}
                >
                  All
                </Badge>
                <Badge
                  variant={filter === 'active' ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setFilter('active')}
                >
                  Active
                </Badge>
                <Badge
                  variant={filter === 'draft' ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setFilter('draft')}
                >
                  Draft
                </Badge>
                <Badge
                  variant={filter === 'paused' ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setFilter('paused')}
                >
                  Paused
                </Badge>
              </div>
            </div>
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
            {filteredWorkflows.map((workflow) => (
              <WorkflowCard
                key={workflow.id}
                workflow={workflow}
                onEdit={handleEdit}
              />
            ))}
          </div>

          {isBuilderOpen && (
            <WorkflowBuilder
              workflow={editingWorkflow ? workflows.find((w) => w.id === editingWorkflow) : undefined}
              onClose={() => {
                setIsBuilderOpen(false);
                setEditingWorkflow(null);
              }}
            />
          )}
        </main>
      </div>
    </div>
  );
}
