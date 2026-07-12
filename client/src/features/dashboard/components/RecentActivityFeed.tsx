import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRightLeft, Plus, Wrench, Users, ShieldAlert, History } from 'lucide-react';

interface ActivityItem {
  id: string;
  user: string;
  role: string;
  module: string;
  action: string;
  createdAt: string;
}

interface RecentActivityFeedProps {
  activities: ActivityItem[];
}

const moduleIcons: Record<string, any> = {
  DEPARTMENT: Users,
  ASSET: Plus,
  ALLOCATION: ArrowRightLeft,
  MAINTENANCE: Wrench,
  AUTH: ShieldAlert,
};

const formatActionText = (action: string): string => {
  return action
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

export const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({ activities }) => {
  if (activities.length === 0) {
    return (
      <Card className="col-span-1 lg:col-span-4">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="py-8 text-center text-muted-foreground text-sm flex flex-col items-center justify-center gap-2">
          <History className="h-8 w-8 opacity-60" />
          No recent activity logs found.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-1 lg:col-span-4">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {activities.map((activity) => {
            const Icon = moduleIcons[activity.module] || History;
            const timeFormatted = new Date(activity.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });
            const dateFormatted = new Date(activity.createdAt).toLocaleDateString([], {
              month: 'short',
              day: 'numeric',
            });

            return (
              <div key={activity.id} className="flex items-start gap-4 hover:bg-muted/30 p-2 rounded-xl transition-colors">
                <div className="bg-muted p-2 rounded-full mt-0.5">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-semibold leading-none">
                    {activity.user}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatActionText(activity.action)} ({activity.module.toLowerCase()})
                  </p>
                </div>
                <div className="text-[11px] text-muted-foreground text-right">
                  <div>{timeFormatted}</div>
                  <div className="opacity-75">{dateFormatted}</div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
