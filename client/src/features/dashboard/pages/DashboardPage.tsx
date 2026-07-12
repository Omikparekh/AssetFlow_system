import React from 'react';
import { motion } from 'framer-motion';
import { Users, Box, Wrench, AlertCircle } from 'lucide-react';
import { KpiCard } from '../components/KpiCard';
import { AssetSummaryChart } from '../components/AssetSummaryChart';
import { RecentActivityFeed } from '../components/RecentActivityFeed';
import { QuickActions } from '../components/QuickActions';
import { UpcomingTasks } from '../components/UpcomingTasks';
import { useAuth } from '@/contexts/AuthContext';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  // Animations
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back, {user?.fullName || 'User'}. Here's what's happening with your assets today.
        </p>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        {/* KPI Cards Row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <motion.div variants={item}>
            <KpiCard 
              title="Total Assets" 
              value="1,284" 
              icon={Box} 
              trend={{ value: 12, isPositive: true }} 
              description="from last month"
            />
          </motion.div>
          <motion.div variants={item}>
            <KpiCard 
              title="Active Employees" 
              value="342" 
              icon={Users} 
            />
          </motion.div>
          <motion.div variants={item}>
            <KpiCard 
              title="Pending Maintenance" 
              value="14" 
              icon={Wrench} 
              trend={{ value: 2, isPositive: false }}
              description="requires attention"
            />
          </motion.div>
          <motion.div variants={item}>
            <KpiCard 
              title="Critical Alerts" 
              value="3" 
              icon={AlertCircle} 
            />
          </motion.div>
        </div>

        {/* Charts and Quick Actions */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          <motion.div variants={item} className="lg:col-span-3">
            <AssetSummaryChart />
          </motion.div>
          <motion.div variants={item} className="flex flex-col gap-6">
            <QuickActions />
            <UpcomingTasks />
          </motion.div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          <motion.div variants={item} className="lg:col-span-4">
            <RecentActivityFeed />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};
