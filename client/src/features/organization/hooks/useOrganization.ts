import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { organizationService, Department, Employee, OrganizationSettings, RoleEntity } from '../services/organization.service';
import { toast } from 'sonner';

export const useOrganizationSettings = () => {
  const queryClient = useQueryClient();

  const settingsQuery = useQuery<OrganizationSettings>({
    queryKey: ['organization', 'settings'],
    queryFn: organizationService.getSettings,
  });

  const updateMutation = useMutation({
    mutationFn: organizationService.updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization', 'settings'] });
      toast.success('Organization settings updated successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update settings';
      toast.error(message);
    },
  });

  return {
    settings: settingsQuery.data,
    isLoading: settingsQuery.isLoading,
    isError: settingsQuery.isError,
    updateSettings: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
  };
};

export const useDepartments = (filters?: { search?: string; status?: string }) => {
  const queryClient = useQueryClient();

  const departmentsQuery = useQuery<Department[]>({
    queryKey: ['organization', 'departments', filters],
    queryFn: () => organizationService.getDepartments(filters),
  });

  const createMutation = useMutation({
    mutationFn: organizationService.createDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization', 'departments'] });
      toast.success('Department created successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to create department';
      toast.error(message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Department> }) => 
      organizationService.updateDepartment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization', 'departments'] });
      toast.success('Department updated successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update department';
      toast.error(message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: organizationService.deleteDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization', 'departments'] });
      toast.success('Department deleted successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to delete department';
      toast.error(message);
    },
  });

  return {
    departments: departmentsQuery.data || [],
    isLoading: departmentsQuery.isLoading,
    isError: departmentsQuery.isError,
    createDepartment: createMutation.mutate,
    isCreating: createMutation.isPending,
    updateDepartment: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    deleteDepartment: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
};

export const useEmployees = (filters?: { search?: string; status?: string; departmentId?: string }) => {
  const queryClient = useQueryClient();

  const employeesQuery = useQuery<Employee[]>({
    queryKey: ['organization', 'employees', filters],
    queryFn: () => organizationService.getEmployees(filters),
  });

  const createMutation = useMutation({
    mutationFn: organizationService.createEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization', 'employees'] });
      toast.success('Employee created successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to create employee';
      toast.error(message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      organizationService.updateEmployee(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization', 'employees'] });
      toast.success('Employee profile updated successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update employee';
      toast.error(message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: organizationService.deleteEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization', 'employees'] });
      toast.success('Employee profile deleted successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to delete employee';
      toast.error(message);
    },
  });

  return {
    employees: employeesQuery.data || [],
    isLoading: employeesQuery.isLoading,
    isError: employeesQuery.isError,
    createEmployee: createMutation.mutate,
    isCreating: createMutation.isPending,
    updateEmployee: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    deleteEmployee: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
};

export const useRoles = () => {
  return useQuery<RoleEntity[]>({
    queryKey: ['organization', 'roles'],
    queryFn: organizationService.getRoles,
    staleTime: 24 * 60 * 60 * 1000, // Roles do not change frequently
  });
};
