import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRightLeft, Plus, Wrench, CalendarCheck } from 'lucide-react';

const activities = [
  { id: 1, type: 'ALLOCATION', user: 'Sarah Jenkins', asset: 'MacBook Pro 16"', time: '2 hours ago', icon: ArrowRightLeft },
  { id: 2, type: 'NEW_ASSET', user: 'System', asset: 'Dell Ultrasharp Monitor', time: '5 hours ago', icon: Plus },
  { id: 3, type: 'MAINTENANCE', user: 'Mike Ross', asset: 'Office Printer A4', time: '1 day ago', icon: Wrench },
  { id: 4, type: 'BOOKING', user: 'Emma Watson', asset: 'Conference Room B', time: '1 day ago', icon: CalendarCheck },
];

export const RecentActivityFeed: React.FC = () => {
  return (
    <Card className="col-span-1 lg:col-span-4">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-4">
              <div className="bg-muted p-2 rounded-full">
                <activity.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">
                  {activity.user}
                </p>
                <p className="text-sm text-muted-foreground">
                  {activity.type === 'ALLOCATION' && `Allocated ${activity.asset}`}
                  {activity.type === 'NEW_ASSET' && `Registered ${activity.asset}`}
                  {activity.type === 'MAINTENANCE' && `Requested maintenance for ${activity.asset}`}
                  {activity.type === 'BOOKING' && `Booked ${activity.asset}`}
                </p>
              </div>
              <div className="text-xs text-muted-foreground">{activity.time}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
