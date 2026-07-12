import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { allocationsService, Allocation } from '../services/allocations.service';
import { toast } from 'sonner';

export const useAllocations = (filters?: { status?: string; employeeId?: string }) => {
  const queryClient = useQueryClient();

  const allocationsQuery = useQuery<Allocation[]>({
    queryKey: ['allocations', filters],
    queryFn: () => allocationsService.getAllocations(filters),
  });

  const createMutation = useMutation({
    mutationFn: allocationsService.createAllocation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allocations'] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      toast.success('Asset allocated successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to allocate asset';
      toast.error(message);
    },
  });

  const returnMutation = useMutation({
    mutationFn: allocationsService.returnAllocation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allocations'] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      toast.success('Asset returned successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to return asset';
      toast.error(message);
    },
  });

  return {
    allocations: allocationsQuery.data || [],
    isLoading: allocationsQuery.isLoading,
    isError: allocationsQuery.isError,
    createAllocation: createMutation.mutate,
    isCreating: createMutation.isPending,
    returnAllocation: returnMutation.mutate,
    isReturning: returnMutation.isPending,
  };
};

export const useReturnRequests = (filters?: { status?: string }) => {
  const queryClient = useQueryClient();

  const requestsQuery = useQuery({
    queryKey: ['returnRequests', filters],
    queryFn: () => allocationsService.getReturnRequests(filters),
  });

  const requestReturnMutation = useMutation({
    mutationFn: allocationsService.requestReturn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['returnRequests'] });
      queryClient.invalidateQueries({ queryKey: ['allocations'] });
      toast.success('Asset return request submitted successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to request return';
      toast.error(message);
    },
  });

  const actionMutation = useMutation({
    mutationFn: allocationsService.actionReturnRequest,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['returnRequests'] });
      queryClient.invalidateQueries({ queryKey: ['allocations'] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success(`Return request ${variables.status.toLowerCase()} successfully`);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to action return request';
      toast.error(message);
    },
  });

  return {
    requests: requestsQuery.data || [],
    isLoading: requestsQuery.isLoading,
    isError: requestsQuery.isError,
    requestReturn: requestReturnMutation.mutate,
    isRequesting: requestReturnMutation.isPending,
    actionReturnRequest: actionMutation.mutate,
    isActioning: actionMutation.isPending,
  };
};
