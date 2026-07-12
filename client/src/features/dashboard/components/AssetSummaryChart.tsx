import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface AssetSummaryChartProps {
  data: Array<{ status: string; count: number }>;
}

const statusLabels: Record<string, string> = {
  AVAILABLE: 'Available',
  ALLOCATED: 'Allocated',
  UNDER_MAINTENANCE: 'Maintenance',
  RETIRED: 'Retired',
};

const statusColors: Record<string, string> = {
  AVAILABLE: 'hsl(142.1 76.2% 36.3%)', // Vibrant green
  ALLOCATED: 'hsl(221.2 83.2% 53.3%)', // Vibrant blue
  UNDER_MAINTENANCE: 'hsl(38 92% 50%)', // Warning Amber
  RETIRED: 'hsl(215.4 16.3% 56.9%)', // Soft Slate
};

export const AssetSummaryChart: React.FC<AssetSummaryChartProps> = ({ data }) => {
  const chartData = data.map((d) => ({
    name: statusLabels[d.status] || d.status.replace('_', ' '),
    value: d.count,
    color: statusColors[d.status] || 'hsl(var(--muted-foreground))',
  })).filter(item => item.value > 0); // Hide 0 count items for clean UI

  // If no data exists yet
  if (chartData.length === 0) {
    return (
      <Card className="col-span-1 lg:col-span-3">
        <CardHeader>
          <CardTitle>Asset Status Distribution</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
          No inventory assets to display in chart.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-1 lg:col-span-3">
      <CardHeader>
        <CardTitle>Asset Status Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--background))' }}
                itemStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
