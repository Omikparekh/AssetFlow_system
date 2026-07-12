import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarClock } from 'lucide-react';

const tasks = [
  { id: 1, type: 'RETURN', item: 'Dell XPS 15', due: 'Today', status: 'warning' },
  { id: 2, type: 'TRANSFER', item: 'Sony Alpha Camera', due: 'Tomorrow', status: 'outline' },
  { id: 3, type: 'MAINTENANCE', item: 'AC Unit - Floor 2', due: 'In 3 days', status: 'outline' },
];

export const UpcomingTasks: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">{task.item}</p>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <CalendarClock className="h-3 w-3 mr-1" />
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
