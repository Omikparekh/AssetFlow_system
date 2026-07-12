import { api } from '@/services/api';

export const bookingsService = {
  getAvailability: async (assetId: string, date: string): Promise<{ unavailableHours: number[] }> => {
    const response = await api.get('/bookings/availability', { params: { assetId, date } });
    return response.data.data;
  },
  create: async (data: { assetId: string; startTime: string; endTime: string; purpose?: string }) => {
    const response = await api.post('/bookings', data);
    return response.data.data;
  },
};
