import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const KpiCard: React.FC<KpiCardProps> = ({ title, value, icon: Icon, description, trend }) => {
  // Determine gradient color mapping based on title
  const getGradientClass = () => {
    switch (title.toLowerCase()) {
      case 'total assets':
        return 'from-blue-500/10 to-indigo-500/10 text-blue-500 border-blue-500/20';
      case 'active employees':
        return 'from-emerald-500/10 to-teal-500/10 text-emerald-500 border-emerald-500/20';
      case 'pending maintenance':
        return 'from-amber-500/10 to-orange-500/10 text-amber-500 border-amber-500/20';
      case 'alerts / overdue':
        return 'from-rose-500/10 to-red-500/10 text-rose-500 border-rose-500/20';
      default:
        return 'from-primary/10 to-primary/5 text-primary border-primary/20';
    }
  };

  return (
    <Card className="relative overflow-hidden group border bg-card/60 backdrop-blur-md hover:shadow-xl hover:-translate-y-1 hover:border-primary/30 transition-all duration-300 cursor-pointer">
      {/* Background glow on group hover */}
      <div className="absolute -right-12 -top-12 w-24 h-24 bg-primary/5 rounded-full group-hover:scale-150 transition-transform duration-500 blur-xl" />

      <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
        <CardTitle className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">{title}</CardTitle>
        <div className={`p-2 rounded-xl border bg-gradient-to-br ${getGradientClass()} shadow-inner`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      
      <CardContent className="relative z-10">
        <div className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
          {value}
        </div>
        
        <p className="text-xs text-muted-foreground mt-2 flex items-center min-h-[1rem]">
          {trend && (
            <span className={`mr-1.5 flex items-center font-semibold ${trend.isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
              {trend.isPositive ? (
                <TrendingUp className="h-3 w-3 mr-0.5" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-0.5" />
              )}
              {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}
            </span>
          )}
          <span>{description || 'Active status'}</span>
        </p>
      </CardContent>
    </Card>
  );
};
