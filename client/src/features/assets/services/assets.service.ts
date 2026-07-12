import { api } from '@/services/api';

export interface Asset {
  id: string;
  assetTag: string;
  qrCode?: string;
  barcode?: string;
  serialNumber?: string;
  purchaseDate?: string;
  purchaseCost?: number;
  warrantyExpiry?: string;
  currentStatus: 'AVAILABLE' | 'ALLOCATED' | 'UNDER_MAINTENANCE' | 'WRITTEN_OFF';
  location?: string;
  condition?: string;
  description?: string;
  categoryId: string;
  brandId: string;
  modelId: string;
  departmentId?: string;
  category?: { name: string };
  brand?: { name: string };
  model?: { name: string };
  department?: { name: string };
  allocations?: Array<{
    id: string;
    employee?: { id: string; fullName: string; email: string };
  }>;
}

export interface Brand { id: string; name: string }
export interface Category { id: string; name: string; description?: string }
export interface Model { id: string; name: string; brandId: string; categoryId: string; brand: Brand; category: Category }

export const assetsService = {
  getAssets: async (filters?: { search?: string; status?: string; categoryId?: string }): Promise<Asset[]> => {
    const response = await api.get('/assets', { params: filters });
    return response.data.data;
  },
  getAsset: async (id: string): Promise<Asset> => {
    const response = await api.get(`/assets/${id}`);
    return response.data.data;
  },
  createAsset: async (data: any): Promise<Asset> => {
    const response = await api.post('/assets', data);
    return response.data.data;
  },
  updateAsset: async (id: string, data: any): Promise<Asset> => {
    const response = await api.put(`/assets/${id}`, data);
    return response.data.data;
  },
  deleteAsset: async (id: string): Promise<void> => {
    await api.delete(`/assets/${id}`);
  },
  getCategories: async (): Promise<Category[]> => {
    const response = await api.get('/assets/categories');
    return response.data.data;
  },
  getBrands: async (): Promise<Brand[]> => {
    const response = await api.get('/assets/brands');
    return response.data.data;
  },
  getModels: async (): Promise<Model[]> => {
    const response = await api.get('/assets/models');
    return response.data.data;
  },
};
