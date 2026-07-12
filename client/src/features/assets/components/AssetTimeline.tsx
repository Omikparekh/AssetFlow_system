import React from 'react';
import { ArrowRightLeft, Plus, Wrench, CheckCircle } from 'lucide-react';

const history = [
  { id: 1, action: 'Returned', user: 'Jane Smith', date: '2024-03-15 10:30 AM', icon: CheckCircle, color: 'text-green-500' },
  { id: 2, action: 'Maintenance Completed', user: 'Tech Vendor A', date: '2024-03-10 14:00 PM', icon: Wrench, color: 'text-blue-500' },
  { id: 3, action: 'Allocated', user: 'Jane Smith', date: '2023-11-01 09:15 AM', icon: ArrowRightLeft, color: 'text-orange-500' },
  { id: 4, action: 'Registered', user: 'System Admin', date: '2023-10-25 11:45 AM', icon: Plus, color: 'text-primary' },
];

export const AssetTimeline: React.FC = () => {
  return (
    <div className="space-y-4">
      {history.map((event, index) => (
        <div key={event.id} className="relative flex gap-4">
          {/* Vertical Line */}
          {index !== history.length - 1 && (
            <div className="absolute left-4 top-8 bottom-[-16px] w-0.5 bg-border"></div>
          )}
          
          <div className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-background border shadow-sm ${event.color}`}>
            <event.icon className="h-4 w-4" />
          </div>
          
          <div className="flex-1 pb-4">
            <h4 className="text-sm font-semibold">{event.action}</h4>
            <p className="text-sm text-muted-foreground mt-0.5">
              by {event.user} &bull; {event.date}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
