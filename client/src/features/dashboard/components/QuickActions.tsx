import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ArrowRightLeft, AlertCircle, Wrench } from 'lucide-react';

export const QuickActions: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        <Button variant="outline" className="h-20 flex flex-col gap-2">
          <Plus className="h-5 w-5 text-primary" />
          <span>New Asset</span>
        </Button>
        <Button variant="outline" className="h-20 flex flex-col gap-2">
          <ArrowRightLeft className="h-5 w-5 text-primary" />
          <span>Allocate</span>
        </Button>
        <Button variant="outline" className="h-20 flex flex-col gap-2">
          <Wrench className="h-5 w-5 text-primary" />
          <span>Maintenance</span>
        </Button>
        <Button variant="outline" className="h-20 flex flex-col gap-2">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <span>Report Issue</span>
        </Button>
      </CardContent>
    </Card>
  );
};
