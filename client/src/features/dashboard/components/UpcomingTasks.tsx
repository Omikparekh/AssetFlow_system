import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarClock, ClipboardCheck } from 'lucide-react';

interface TaskItem {
  id: string;
  type: 'RETURN' | 'MAINTENANCE' | 'AUDIT';
  item: string;
  due: string;
  status: string;
}

interface UpcomingTasksProps {
  tasks: TaskItem[];
}

export const UpcomingTasks: React.FC<UpcomingTasksProps> = ({ tasks }) => {
  if (tasks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Tasks</CardTitle>
        </CardHeader>
        <CardContent className="py-8 text-center text-muted-foreground text-sm flex flex-col items-center justify-center gap-2">
          <ClipboardCheck className="h-8 w-8 opacity-60" />
          No upcoming tasks scheduled.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0 hover:bg-muted/10 transition-colors rounded-lg p-1">
              <div className="space-y-1">
                <p className="text-sm font-semibold leading-none">{task.item}</p>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <CalendarClock className="h-3 w-3 mr-1 text-primary" />
                  {task.due}
                </div>
              </div>
              <Badge variant={task.status as any}>{task.type}</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
