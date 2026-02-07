'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { departmentMetrics } from '@/data/mockData';

export function MetricsGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {departmentMetrics.map((dept) => (
        <Card key={dept.departmentId}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">{dept.departmentName}</h3>
              <span className="text-2xl font-bold text-slate-900">{dept.successRate}%</span>
            </div>

            <Progress value={dept.successRate} size="md" className="mb-4" />

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500">Tasks</p>
                <p className="font-semibold text-slate-900">{dept.tasksCompleted}</p>
              </div>
              <div>
                <p className="text-slate-500">Avg Time</p>
                <p className="font-semibold text-slate-900">{dept.avgResponseTime}h</p>
              </div>
              <div>
                <p className="text-slate-500">Output</p>
                <p className="font-semibold text-slate-900">{dept.outputVolume}</p>
              </div>
              <div>
                <p className="text-slate-500">Efficiency</p>
                <p className="font-semibold text-green-600">
                  {Math.round((dept.tasksCompleted / dept.avgResponseTime) * 10)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
