import { useQuery } from '@tanstack/react-query';
import { dashboardService, DashboardStats } from '../services/dashboard.service';

export const useDashboard = () => {
  const statsQuery = useQuery<DashboardStats>({
    queryKey: ['dashboard', 'stats'],
    queryFn: dashboardService.getStats,
    refetchInterval: 15000, // Poll every 15 seconds for real-time reactivity!
  });

  return {
    stats: statsQuery.data,
    isLoading: statsQuery.isLoading,
    isError: statsQuery.isError,
    refetch: statsQuery.refetch,
  };
};
