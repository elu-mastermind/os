'use client';

import { Bell, Search, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search agents, workflows..."
            className="h-10 w-80 rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none placeholder:text-slate-400 focus:border-slate-300 focus:bg-white"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-slate-600" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
        </Button>

        <div className="flex items-center gap-3 pl-3">
          <div className="text-right">
            <p className="text-sm font-medium text-slate-900">Marketing Team</p>
            <p className="text-xs text-slate-500">Pro Plan</p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900">
            <User className="h-5 w-5 text-white" />
          </div>
        </div>
      </div>
    </header>
  );
}
