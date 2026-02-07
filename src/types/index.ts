export type AgentLevel = 'executive' | 'director' | 'specialist';
export type AgentStatus = 'idle' | 'working' | 'paused' | 'error';
export type WorkflowStatus = 'draft' | 'active' | 'paused' | 'completed' | 'failed';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'waiting_approval';
export type ModelPreference = 'gpt-4' | 'gpt-4-turbo' | 'gpt-3.5-turbo' | 'claude-3-opus' | 'claude-3-sonnet' | 'claude-3-haiku';
export type MemoryScope = 'session' | 'conversation' | 'persistent';

export interface Department {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  agentCount: number;
}

export interface AgentConfig {
  id: string;
  role: string;
  systemPrompt: string;
  allowedTools: string[];
  modelPreference: ModelPreference;
  memoryScope: MemoryScope;
  temperature?: number;
  maxTokens?: number;
  capabilities?: string[];
  metadata?: Record<string, unknown>;
}

export interface AgentExecutionContext {
  sessionId?: string;
  userId?: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface AgentExecutionResult {
  output: string;
  agentId: string;
  context: AgentExecutionContext;
  error?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  level: AgentLevel;
  department: string;
  departmentId: string;
  description: string;
  status: AgentStatus;
  avatar?: string;
  skills: string[];
  tools: string[];
  kpis: {
    tasksCompleted: number;
    successRate: number;
    avgResponseTime: number;
  };
  memory: {
    shortTerm: string[];
    longTerm: string[];
  };
  isActive: boolean;
}

export interface WorkflowNode {
  id: string;
  agentId: string;
  agentName: string;
  type: 'task' | 'approval' | 'condition' | 'parallel';
  position: { x: number; y: number };
  config: {
    inputs?: string[];
    outputs?: string[];
    conditions?: string[];
    timeout?: number;
  };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  condition?: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  departmentId: string;
  status: WorkflowStatus;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  createdAt: Date;
  updatedAt: Date;
  lastRun?: Date;
  runCount: number;
  successRate: number;
  isTemplate: boolean;
}

export interface WorkflowRun {
  id: string;
  workflowId: string;
  status: WorkflowStatus;
  startedAt: Date;
  completedAt?: Date;
  tasks: Task[];
  currentNodeId?: string;
}

export interface Task {
  id: string;
  workflowRunId: string;
  agentId: string;
  agentName: string;
  status: TaskStatus;
  input: string;
  output?: string;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  requiresApproval: boolean;
  approved?: boolean;
  approvedBy?: string;
}

export interface ChatMessage {
  id: string;
  agentId: string;
  agentName: string;
  agentAvatar?: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;
  type: 'text' | 'task' | 'workflow' | 'file';
  metadata?: {
    taskId?: string;
    workflowId?: string;
    fileUrl?: string;
  };
}

export interface AnalyticsMetrics {
  totalAgents: number;
  activeAgents: number;
  totalWorkflows: number;
  completedWorkflows: number;
  totalTasks: number;
  completedTasks: number;
  avgCompletionTime: number;
  successRate: number;
}

export interface DepartmentMetrics {
  departmentId: string;
  departmentName: string;
  tasksCompleted: number;
  avgResponseTime: number;
  successRate: number;
  outputVolume: number;
}

export interface TimeSeriesData {
  date: string;
  value: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'viewer';
  organizationId: string;
  permissions: string[];
}

export interface Organization {
  id: string;
  name: string;
  plan: 'free' | 'pro' | 'enterprise';
  settings: {
    maxAgents: number;
    maxWorkflows: number;
    allowCustomAgents: boolean;
    apiAccess: boolean;
  };
}
