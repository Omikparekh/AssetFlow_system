import { api } from '@/services/api';
import { Asset } from '../../assets/services/assets.service';

export interface Allocation {
  id: string;
  assetId: string;
  employeeId?: string;
  departmentId?: string;
  allocatedById: string;
  allocatedAt: string;
  expectedReturn?: string;
  actualReturn?: string;
  returnCondition?: string;
  status: 'ACTIVE' | 'RETURNED' | 'OVERDUE';
  notes?: string;
  asset?: Asset;
  employee?: { fullName: string; email: string };
  department?: { name: string };
}

export interface ReturnRequest {
  id: string;
  assetId: string;
  requestedById: string;
  returnCondition: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  notes?: string;
  createdAt: string;
  asset?: Asset;
  requestedBy?: { fullName: string; email: string };
}

export const allocationsService = {
  getAllocations: async (filters?: { status?: string; employeeId?: string }): Promise<Allocation[]> => {
    const response = await api.get('/allocations', { params: filters });
    return response.data.data;
  },
  createAllocation: async (data: { assetId: string; employeeId?: string | null; departmentId?: string | null; expectedReturn?: string; notes?: string }): Promise<Allocation> => {
    const response = await api.post('/allocations', data);
    return response.data.data;
  },
  returnAllocation: async (data: { allocationId: string; returnCondition?: string; notes?: string }): Promise<Allocation> => {
    const response = await api.post('/allocations/return', data);
    return response.data.data;
  },
  requestReturn: async (data: { assetId: string; returnCondition?: string; notes?: string }): Promise<ReturnRequest> => {
    const response = await api.post('/allocations/request-return', data);
    return response.data.data;
  },
  getReturnRequests: async (filters?: { status?: string }): Promise<ReturnRequest[]> => {
    const response = await api.get('/allocations/requests', { params: filters });
    return response.data.data;
  },
  actionReturnRequest: async (data: { requestId: string; status: 'APPROVED' | 'REJECTED'; notes?: string }): Promise<ReturnRequest> => {
    const response = await api.post('/allocations/requests/action', data);
    return response.data.data;
  },
};
