import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assetsService, Asset } from '../services/assets.service';
import { toast } from 'sonner';

export const useAssets = (filters?: { search?: string; status?: string; categoryId?: string }) => {
  const queryClient = useQueryClient();

  const assetsQuery = useQuery<Asset[]>({
    queryKey: ['assets', filters],
    queryFn: () => assetsService.getAssets(filters),
  });

  const createMutation = useMutation({
    mutationFn: assetsService.createAsset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      toast.success('Asset registered successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to register asset';
      toast.error(message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => assetsService.updateAsset(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      toast.success('Asset updated successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update asset';
      toast.error(message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: assetsService.deleteAsset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      toast.success('Asset deleted successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to delete asset';
      toast.error(message);
    },
  });

  return {
    assets: assetsQuery.data || [],
    isLoading: assetsQuery.isLoading,
    isError: assetsQuery.isError,
    createAsset: createMutation.mutate,
    isCreating: createMutation.isPending,
    updateAsset: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    deleteAsset: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
};

export const useAsset = (id: string) => {
  return useQuery<Asset>({
    queryKey: ['asset', id],
    queryFn: () => assetsService.getAsset(id),
    enabled: !!id,
  });
};

export const useAssetMeta = () => {
  const categoriesQuery = useQuery({
    queryKey: ['assets', 'categories'],
    queryFn: assetsService.getCategories,
  });

  const brandsQuery = useQuery({
    queryKey: ['assets', 'brands'],
    queryFn: assetsService.getBrands,
  });

  const modelsQuery = useQuery({
    queryKey: ['assets', 'models'],
    queryFn: assetsService.getModels,
  });

  return {
    categories: categoriesQuery.data || [],
    brands: brandsQuery.data || [],
    models: modelsQuery.data || [],
    isLoading: categoriesQuery.isLoading || brandsQuery.isLoading || modelsQuery.isLoading,
  };
};
