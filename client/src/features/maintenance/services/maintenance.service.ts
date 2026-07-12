import { api } from '@/services/api';
import { Asset } from '../../assets/services/assets.service';

export interface MaintenanceRequest {
  id: string;
  assetId: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  status: 'PENDING' | 'APPROVED' | 'UNDER_REPAIR' | 'RESOLVED' | 'CANCELLED';
  estimatedCost?: number;
  actualCost?: number;
  requestedById: string;
  approvedById?: string;
  createdAt: string;
  asset?: Asset;
  requestedBy?: { fullName: string; email: string };
}

export const maintenanceService = {
  getRequests: async (filters?: { status?: string }): Promise<MaintenanceRequest[]> => {
    const response = await api.get('/maintenance', { params: filters });
    return response.data.data;
  },
  createRequest: async (data: { assetId: string; priority?: string; description: string; estimatedCost?: number }): Promise<MaintenanceRequest> => {
    const response = await api.post('/maintenance', data);
    return response.data.data;
  },
  updateStatus: async (id: string, data: { status: string; actualCost?: number; notes?: string }): Promise<MaintenanceRequest> => {
    const response = await api.put(`/maintenance/${id}/status`, data);
    return response.data.data;
  },
};
