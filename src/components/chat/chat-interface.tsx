'use client';

import { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '@/types';
import { agents, chatMessages as initialMessages } from '@/data/mockData';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getInitials, formatRelativeTime } from '@/lib/utils';
import { Send, Bot, User, FileText, Workflow, Paperclip } from 'lucide-react';

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      agentId: 'user',
      agentName: 'You',
      role: 'user',
      content: input,
      timestamp: new Date(),
      type: 'text',
    };

    setMessages([...messages, userMessage]);
    setInput('');

    setTimeout(() => {
      const cmo = agents.find((a) => a.id === 'cmo-1');
      if (cmo) {
        const agentMessage: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          agentId: cmo.id,
          agentName: cmo.name,
          role: 'agent',
          content: `I've received your request. I'll coordinate with the team to get this done. Is there anything specific you'd like me to prioritize?`,
          timestamp: new Date(),
          type: 'text',
        };
        setMessages((prev) => [...prev, agentMessage]);
      }
    }, 1500);
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'workflow':
        return <Workflow className="h-4 w-4" />;
      case 'task':
        return <FileText className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      <div className="w-64 border-r border-slate-200 bg-white rounded-lg p-4">
        <h3 className="font-semibold text-slate-900 mb-4">Chat with Agents</h3>
        <div className="space-y-2">
          <button
            onClick={() => setSelectedAgent(null)}
            className={`w-full flex items-center gap-3 rounded-lg p-3 text-left transition-colors ${
              selectedAgent === null ? 'bg-slate-100' : 'hover:bg-slate-50'
            }`}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">All Agents</p>
              <p className="text-xs text-slate-500">General channel</p>
            </div>
          </button>
          {agents.slice(0, 8).map((agent) => (
            <button
              key={agent.id}
              onClick={() => setSelectedAgent(agent.id)}
              className={`w-full flex items-center gap-3 rounded-lg p-3 text-left transition-colors ${
                selectedAgent === agent.id ? 'bg-slate-100' : 'hover:bg-slate-50'
              }`}
            >
              <Avatar fallback={getInitials(agent.name)} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{agent.name}</p>
                <p className="text-xs text-slate-500 truncate">{agent.role}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-white rounded-lg border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900">
              {selectedAgent ? (
                <Avatar
                  fallback={getInitials(agents.find((a) => a.id === selectedAgent)?.name || 'A')}
                  size="sm"
                />
              ) : (
                <Bot className="h-5 w-5 text-white" />
              )}
            </div>
            <div>
              <p className="font-semibold text-slate-900">
                {selectedAgent ? agents.find((a) => a.id === selectedAgent)?.name : 'All Agents'}
              </p>
              <p className="text-xs text-slate-500">
                {selectedAgent
                  ? agents.find((a) => a.id === selectedAgent)?.role
                  : 'Your AI marketing team'}
              </p>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1 p-6">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                {message.role === 'user' ? (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900">
                    <User className="h-4 w-4 text-white" />
                  </div>
                ) : (
                  <Avatar fallback={getInitials(message.agentName)} size="sm" />
                )}
                <div
                  className={`max-w-[70%] rounded-lg p-4 ${
                    message.role === 'user'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium opacity-70">
                      {message.agentName}
                    </span>
                    <span className="text-xs opacity-50">
                      {formatRelativeTime(message.timestamp)}
                    </span>
                  </div>
                  {message.type !== 'text' && (
                    <div className="flex items-center gap-2 mb-2 text-xs opacity-70">
                      {getMessageIcon(message.type)}
                      <span className="capitalize">{message.type}</span>
                    </div>
                  )}
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="border-t border-slate-200 p-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="shrink-0">
              <Paperclip className="h-5 w-5 text-slate-400" />
            </Button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your message..."
              className="flex-1 h-10 px-4 rounded-lg border border-slate-200 outline-none focus:border-slate-300"
            />
            <Button onClick={handleSend} className="shrink-0">
              <Send className="h-4 w-4 mr-2" />
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
