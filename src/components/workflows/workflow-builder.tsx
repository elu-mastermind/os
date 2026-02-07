'use client';

import { useState } from 'react';
import { Workflow, WorkflowNode, WorkflowEdge } from '@/types';
import { agents } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import { Plus, ArrowRight, Save, X, GitBranch } from 'lucide-react';

interface WorkflowBuilderProps {
  workflow?: Workflow;
  onSave?: (workflow: Workflow) => void;
  onClose?: () => void;
}

export function WorkflowBuilder({ workflow, onSave, onClose }: WorkflowBuilderProps) {
  const [nodes, setNodes] = useState<WorkflowNode[]>(workflow?.nodes || []);
  const [edges, setEdges] = useState<WorkflowEdge[]>(workflow?.edges || []);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [name, setName] = useState(workflow?.name || 'New Workflow');
  const [description, setDescription] = useState(workflow?.description || '');

  const addNode = (agentId: string) => {
    const agent = agents.find((a) => a.id === agentId);
    if (!agent) return;

    const newNode: WorkflowNode = {
      id: `node-${Date.now()}`,
      agentId: agent.id,
      agentName: agent.name,
      type: 'task',
      position: { x: nodes.length * 200 + 100, y: 100 },
      config: {},
    };

    setNodes([...nodes, newNode]);

    if (nodes.length > 0) {
      const lastNode = nodes[nodes.length - 1];
      const newEdge: WorkflowEdge = {
        id: `edge-${Date.now()}`,
        source: lastNode.id,
        target: newNode.id,
      };
      setEdges([...edges, newEdge]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-50">
      <div className="flex h-full">
        <div className="w-80 border-r border-slate-200 bg-white p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Agents</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2">
            {agents.map((agent) => (
              <button
                key={agent.id}
                onClick={() => addNode(agent.id)}
                className="w-full flex items-center gap-3 rounded-lg border border-slate-200 p-3 hover:border-slate-300 hover:bg-slate-50 transition-colors text-left"
              >
                <Avatar fallback={getInitials(agent.name)} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{agent.name}</p>
                  <p className="text-xs text-slate-500 truncate">{agent.role}</p>
                </div>
                <Plus className="h-4 w-4 text-slate-400" />
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
            <div className="flex-1 mr-4">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xl font-semibold bg-transparent border-none outline-none placeholder:text-slate-400"
                placeholder="Workflow Name"
              />
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-sm text-slate-500 bg-transparent border-none outline-none placeholder:text-slate-400 mt-1"
                placeholder="Description"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={() => onSave?.({ ...workflow!, name, description, nodes, edges })}>
                <Save className="mr-2 h-4 w-4" />
                Save Workflow
              </Button>
            </div>
          </div>

          <div className="flex-1 p-8 overflow-auto">
            <div className="relative min-h-[400px] bg-white rounded-lg border border-slate-200 p-8">
              {nodes.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <GitBranch className="h-12 w-12 mb-4" />
                  <p>Click agents from the sidebar to build your workflow</p>
                </div>
              ) : (
                <div className="flex items-center gap-4 flex-wrap">
                  {nodes.map((node, index) => (
                    <div key={node.id} className="flex items-center gap-4">
                      <div
                        className={`relative rounded-lg border-2 p-4 min-w-[200px] cursor-pointer transition-colors ${
                          selectedNode === node.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                        onClick={() => setSelectedNode(node.id)}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar fallback={getInitials(node.agentName)} size="sm" />
                          <div>
                            <p className="font-medium text-slate-900">{node.agentName}</p>
                            <Badge variant="outline" className="text-xs mt-1">
                              {node.type}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      {index < nodes.length - 1 && (
                        <ArrowRight className="h-6 w-6 text-slate-300" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
