import { api } from '@/services/api';

export interface GivenAssetItem {
  id: string;
  tag: string;
  name: string;
  category: string;
  assignee: string;
  allocatedAt: string | null;
}

export interface NotEquippedAssetItem {
  id: string;
  tag: string;
  name: string;
  category: string;
  condition: string;
  location: string;
}

export interface InRepairAssetItem {
  id: string;
  tag: string;
  name: string;
  category: string;
  priority: string;
  repairStatus: string;
}

export interface ReturnedAssetItem {
  id: string;
  tag: string;
  name: string;
  category: string;
  assignee: string;
  returnedAt: string | null;
  condition: string;
}

export interface DashboardStats {
  kpis: {
    totalAssets: number;
    activeEmployees: number;
    pendingMaintenance: number;
    criticalAlerts: number;
    amountDue?: number;
    amountCollected?: number;
    amountOutstanding?: number;
  };
  statusDistribution: Array<{
    status: 'AVAILABLE' | 'ALLOCATED' | 'UNDER_MAINTENANCE' | 'RETIRED';
    count: number;
  }>;
  recentActivity: Array<{
    id: string;
    user: string;
    role: string;
    module: string;
    action: string;
    createdAt: string;
  }>;
  upcomingTasks: Array<{
    id: string;
    type: 'RETURN' | 'MAINTENANCE' | 'AUDIT';
    item: string;
    due: string;
    status: string;
  }>;
  lifecycleLists?: {
    given: GivenAssetItem[];
    notEquipped: NotEquippedAssetItem[];
    inRepair: InRepairAssetItem[];
    returned: ReturnedAssetItem[];
  };
}

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get('/dashboard/stats');
    return response.data.data;
  },
};
