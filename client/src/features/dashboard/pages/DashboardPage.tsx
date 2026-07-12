import React from 'react';
import { motion } from 'framer-motion';
import { Users, Box, Wrench, AlertCircle, ClipboardCheck, Loader2, ArrowRightLeft, WalletCards } from 'lucide-react';
import { KpiCard } from '../components/KpiCard';
import { AssetSummaryChart } from '../components/AssetSummaryChart';
import { RecentActivityFeed } from '../components/RecentActivityFeed';
import { QuickActions } from '../components/QuickActions';
import { UpcomingTasks } from '../components/UpcomingTasks';
import { MyAllocationsTable } from '@/features/assets/components/MyAllocationsTable';
import { MyReturnRequestsTable } from '@/features/assets/components/MyReturnRequestsTable';
import { MyReturnLogsTable } from '@/features/assets/components/MyReturnLogsTable';
import { AdminAssetStatusTabs } from '../components/AdminAssetStatusTabs';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboard } from '../hooks/useDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { stats, isLoading, isError } = useDashboard();
  const isEmployee = user?.role === 'EMPLOYEE';
  const isAssetManager = user?.role === 'ASSET_MANAGER';
  const isDepartmentHead = user?.role === 'DEPARTMENT_HEAD';

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

  if (isLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm font-medium">Loading Overview metrics...</p>
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center p-6 bg-card rounded-xl border max-w-md mx-auto my-12 space-y-3">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <span className="font-semibold text-lg text-foreground">Failed to Load Dashboard</span>
        <p className="text-sm text-muted-foreground">
          There was an error communicating with the live database server. Make sure the backend server is running and Supabase is accessible.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <p className="text-muted-foreground mt-1">
          {isEmployee
            ? `Welcome back, ${user?.fullName || 'User'}. Track and manage your assigned work equipment.`
            : isAssetManager
              ? `Asset Manager workspace for ${user?.fullName || 'User'}. Oversee inventory, allocations, and maintenance.`
              : isDepartmentHead
                ? `Department Head workspace for ${user?.fullName || 'User'}. Monitor your team's equipment and requests.`
            : `Welcome back, ${user?.fullName || 'User'}. Here's what's happening with your assets today.`}
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
          {isEmployee ? (
            <>
              <motion.div variants={item}>
                <KpiCard 
                  title="My Allocated Assets" 
                  value={stats.kpis.totalAssets} 
                  icon={Box} 
                  description="actively in use"
                />
              </motion.div>
              <motion.div variants={item}>
                <KpiCard 
                  title="My Return Requests" 
                  value={stats.kpis.activeEmployees} 
                  icon={ArrowRightLeft} 
                  description="pending processing"
                />
              </motion.div>
              <motion.div variants={item}>
                <KpiCard 
                  title="My Open Repairs" 
                  value={stats.kpis.pendingMaintenance} 
                  icon={Wrench} 
                  description="under repair tickets"
                />
              </motion.div>
              <motion.div variants={item}>
                <KpiCard 
                  title="Amount to Pay" 
                  value={`$${Number(stats.kpis.amountDue || 0).toLocaleString()}`}
                  icon={WalletCards} 
                  description="outstanding asset charges"
                />
              </motion.div>
            </>
          ) : (
            <>
              <motion.div variants={item}>
                <KpiCard 
                  title={isAssetManager ? 'Assets Under Management' : isDepartmentHead ? 'Department Assets' : 'Total Assets'} 
                  value={stats.kpis.totalAssets.toLocaleString()} 
                  icon={Box} 
                />
              </motion.div>
              <motion.div variants={item}>
                <KpiCard 
                  title={isDepartmentHead ? 'Department Employees' : 'Active Employees'} 
                  value={stats.kpis.activeEmployees.toLocaleString()} 
                  icon={Users} 
                />
              </motion.div>
              <motion.div variants={item}>
                <KpiCard 
                  title={isAssetManager ? 'Open Maintenance' : 'Pending Maintenance'} 
                  value={stats.kpis.pendingMaintenance.toLocaleString()} 
                  icon={Wrench} 
                  trend={stats.kpis.pendingMaintenance > 0 ? { value: stats.kpis.pendingMaintenance, isPositive: false } : undefined}
                  description={stats.kpis.pendingMaintenance > 0 ? "requires attention" : "all resolved"}
                />
              </motion.div>
              <motion.div variants={item}>
                <KpiCard 
                  title={isDepartmentHead ? 'Department Collection' : 'Amount Collected'} 
                  value={`$${Number(stats.kpis.amountCollected || 0).toLocaleString()}`}
                  icon={WalletCards}
                  description={`$${Number(stats.kpis.amountOutstanding || 0).toLocaleString()} outstanding`}
                />
              </motion.div>
            </>
          )}
        </div>

        {/* Dynamic Center Section (Lifecycle lists vs personal allocations) */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          <motion.div variants={item} className="lg:col-span-3 space-y-6">
            {isEmployee ? (
              <>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Equipment Workspace</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="active-assets" className="space-y-4">
                      <TabsList className="grid w-full grid-cols-3 lg:w-[480px]">
                        <TabsTrigger value="active-assets">My Active Equipment</TabsTrigger>
                        <TabsTrigger value="requests">My Return Requests</TabsTrigger>
                        <TabsTrigger value="return-logs">My Return Logs</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="active-assets" className="m-0 pt-1">
                        <MyAllocationsTable />
                      </TabsContent>
                      
                      <TabsContent value="requests" className="m-0 pt-1">
                        <MyReturnRequestsTable />
                      </TabsContent>

                      <TabsContent value="return-logs" className="m-0 pt-1">
                        <MyReturnLogsTable />
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
                <QuickActions layout="horizontal" />
              </>
            ) : (
              <>
                <AdminAssetStatusTabs lists={stats.lifecycleLists} />
                <QuickActions layout="horizontal" />
              </>
            )}
          </motion.div>
          <motion.div variants={item} className="flex flex-col gap-6">
            {!isEmployee ? (
              <>
                <AssetSummaryChart data={stats.statusDistribution} />
                <UpcomingTasks tasks={stats.upcomingTasks} />
              </>
            ) : (
              <>
                <UpcomingTasks tasks={stats.upcomingTasks} />
              </>
            )}
          </motion.div>
        </div>

        {/* Bottom Activity Logs Row (Only for non-employees, since employees have it in the sidebar now!) */}
        {!isEmployee && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
            <motion.div variants={item} className="lg:col-span-4">
              <RecentActivityFeed activities={stats.recentActivity} />
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
