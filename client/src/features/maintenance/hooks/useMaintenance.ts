import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { maintenanceService, MaintenanceRequest } from '../services/maintenance.service';
import { toast } from 'sonner';

export const useMaintenance = (filters?: { status?: string }) => {
  const queryClient = useQueryClient();

  const requestsQuery = useQuery<MaintenanceRequest[]>({
    queryKey: ['maintenance', filters],
    queryFn: () => maintenanceService.getRequests(filters),
  });

  const createMutation = useMutation({
    mutationFn: maintenanceService.createRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      toast.success('Maintenance request submitted successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to submit maintenance request';
      toast.error(message);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { status: string; actualCost?: number; notes?: string } }) => 
      maintenanceService.updateStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      toast.success('Maintenance status updated successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update status';
      toast.error(message);
    },
  });

  return {
    requests: requestsQuery.data || [],
    isLoading: requestsQuery.isLoading,
    isError: requestsQuery.isError,
    createRequest: createMutation.mutate,
    isCreating: createMutation.isPending,
    updateStatus: updateStatusMutation.mutate,
    isUpdating: updateStatusMutation.isPending,
  };
};
