import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ArrowRightLeft, AlertCircle, Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface QuickActionsProps {
  layout?: 'grid' | 'horizontal';
}

export const QuickActions: React.FC<QuickActionsProps> = ({ layout = 'grid' }) => {
  const { user } = useAuth();
  const isAdminOrManager = user?.role === 'ADMIN' || user?.role === 'ASSET_MANAGER';

  const isHorizontal = layout === 'horizontal';

  const btnClass = isHorizontal
    ? "flex flex-row items-center justify-center gap-3 h-12 w-full text-sm font-semibold transition-all duration-300"
    : "flex flex-col gap-2 h-20 w-full transition-all duration-300";

  return (
    <Card className={`hover:shadow-md transition-shadow duration-300 ${isHorizontal ? 'mt-6' : ''}`}>
      {!isHorizontal && (
        <CardHeader className="pb-3">
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
      )}
      <CardContent className={`p-4 ${isHorizontal ? 'py-4' : ''}`}>
        <div className={`grid gap-4 ${isHorizontal ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : 'grid-cols-2'}`}>
          {isAdminOrManager ? (
            <>
              <Button variant="outline" asChild className={`${btnClass} hover:bg-primary/5 hover:text-primary hover:border-primary/30`}>
                <Link to="/assets/new">
                  <Plus className="h-5 w-5 text-primary" />
                  <span>New Asset</span>
                </Link>
              </Button>
              <Button variant="outline" asChild className={`${btnClass} hover:bg-emerald-500/5 hover:text-emerald-500 hover:border-emerald-500/30`}>
                <Link to="/allocations">
                  <ArrowRightLeft className="h-5 w-5 text-emerald-500" />
                  <span>Allocate</span>
                </Link>
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" asChild className={`${btnClass} hover:bg-primary/5 hover:text-primary hover:border-primary/30`}>
                <Link to="/assets">
                  <Plus className="h-5 w-5 text-primary" />
                  <span>View Assets</span>
                </Link>
              </Button>
              <Button variant="outline" asChild className={`${btnClass} hover:bg-emerald-500/5 hover:text-emerald-500 hover:border-emerald-500/30`}>
                <Link to="/assets">
                  <ArrowRightLeft className="h-5 w-5 text-emerald-500" />
                  <span>My Assets</span>
                </Link>
              </Button>
            </>
          )}
          <Button variant="outline" asChild className={`${btnClass} hover:bg-amber-500/5 hover:text-amber-500 hover:border-amber-500/30`}>
            <Link to="/maintenance">
              <Wrench className="h-5 w-5 text-amber-500" />
              <span>Maintenance</span>
            </Link>
          </Button>
          <Button variant="outline" asChild className={`${btnClass} hover:bg-rose-500/5 hover:text-rose-500 hover:border-rose-500/30`}>
            <Link to="/maintenance">
              <AlertCircle className="h-5 w-5 text-rose-500" />
              <span>Report Issue</span>
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
