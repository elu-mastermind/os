'use client';

import { departments } from '@/data/mockData';
import { Button } from '@/components/ui/button';

interface AgentFiltersProps {
  selectedDepartment: string | null;
  selectedLevel: string | null;
  onDepartmentChange: (dept: string | null) => void;
  onLevelChange: (level: string | null) => void;
}

const levels = [
  { value: 'executive', label: 'Executive' },
  { value: 'director', label: 'Director' },
  { value: 'specialist', label: 'Specialist' },
];

export function AgentFilters({
  selectedDepartment,
  selectedLevel,
  onDepartmentChange,
  onLevelChange,
}: AgentFiltersProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-slate-900 mb-2">Department</h3>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedDepartment === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => onDepartmentChange(null)}
          >
            All
          </Button>
          {departments.map((dept) => (
            <Button
              key={dept.id}
              variant={selectedDepartment === dept.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => onDepartmentChange(dept.id)}
            >
              {dept.name}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-slate-900 mb-2">Level</h3>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedLevel === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => onLevelChange(null)}
          >
            All
          </Button>
          {levels.map((level) => (
            <Button
              key={level.value}
              variant={selectedLevel === level.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => onLevelChange(level.value)}
            >
              {level.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
