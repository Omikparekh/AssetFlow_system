import { api } from '@/services/api';
import { AuthResponse, GenericResponse } from '../types/auth.types';
import { LoginFormData, SignupFormData, ForgotPasswordFormData, ResetPasswordFormData } from '../schemas/auth.schemas';

export const authService = {
  login: async (data: LoginFormData): Promise<AuthResponse> => {
    // SIMULATED BACKEND: Since the real Node.js backend is not yet built,
    // we intercept the login request and return a fake Admin user immediately 
    // so you can explore the dashboard.
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: 'Mock Login Successful',
          data: {
            user: {
              id: 'admin-123',
              email: data.email,
              firstName: 'Admin',
              lastName: 'User',
              fullName: 'Admin User',
              role: 'ADMIN',
              isActive: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            accessToken: 'fake-jwt-token-for-ui-testing',
          }
        });
      }, 800); // simulate network delay
    });
  },
  
  signup: async (data: Omit<SignupFormData, 'confirmPassword'>): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  forgotPassword: async (data: ForgotPasswordFormData): Promise<GenericResponse> => {
    const response = await api.post<GenericResponse>('/auth/forgot-password', data);
    return response.data;
  },

  resetPassword: async (data: Omit<ResetPasswordFormData, 'confirmPassword'> & { token: string }): Promise<GenericResponse> => {
    const response = await api.post<GenericResponse>('/auth/reset-password', data);
    return response.data;
  },
};
