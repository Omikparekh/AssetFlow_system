import { api } from '@/services/api';

export interface Department {
  id: string;
  name: string;
  departmentCode: string;
  description?: string;
  parentId?: string | null;
  parent?: { id: string; name: string } | null;
  headId?: string | null;
  head?: { id: string; fullName: string } | null;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export interface Employee {
  id: string;
  email: string;
  fullName: string;
  employeeCode: string;
  phone?: string;
  profileImage?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  roleId: string;
  role: { id: string; name: string };
  departmentId?: string | null;
  department?: { id: string; name: string } | null;
  createdAt: string;
}

export interface RoleEntity {
  id: string;
  name: string;
  description?: string;
}

export interface OrganizationSettings {
  name: string;
  taxId: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  currency: string;
}

export const organizationService = {
  // Organization Settings
  getSettings: async (): Promise<OrganizationSettings> => {
    const response = await api.get('/organization');
    return response.data.data;
  },

  updateSettings: async (data: Partial<OrganizationSettings>): Promise<OrganizationSettings> => {
    const response = await api.put('/organization', data);
    return response.data.data;
  },

  // Departments
  getDepartments: async (filters?: { search?: string; status?: string }): Promise<Department[]> => {
    const response = await api.get('/departments', { params: filters });
    // Backend returns { success: true, message: "...", data: [...] }
    return response.data.data;
  },

  createDepartment: async (data: Omit<Partial<Department>, 'id'>): Promise<Department> => {
    const response = await api.post('/departments', data);
    return response.data.data;
  },

  updateDepartment: async (id: string, data: Partial<Department>): Promise<Department> => {
    const response = await api.put(`/departments/${id}`, data);
    return response.data.data;
  },

  deleteDepartment: async (id: string): Promise<void> => {
    await api.delete(`/departments/${id}`);
  },

  // Employees
  getEmployees: async (filters?: { search?: string; status?: string; departmentId?: string }): Promise<Employee[]> => {
    const response = await api.get('/employees', { params: filters });
    return response.data.data;
  },

  createEmployee: async (data: any): Promise<Employee> => {
    const response = await api.post('/employees', data);
    return response.data.data;
  },

  updateEmployee: async (id: string, data: any): Promise<Employee> => {
    const response = await api.put(`/employees/${id}`, data);
    return response.data.data;
  },

  deleteEmployee: async (id: string): Promise<void> => {
    await api.delete(`/employees/${id}`);
  },

  // Roles
  getRoles: async (): Promise<RoleEntity[]> => {
    const response = await api.get('/employees/roles');
    return response.data.data;
  },
};
