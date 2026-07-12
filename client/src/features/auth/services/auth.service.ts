import { api } from '@/services/api';
import { AuthResponse, GenericResponse } from '../types/auth.types';
import { LoginFormData, SignupFormData, ForgotPasswordFormData, ResetPasswordFormData } from '../schemas/auth.schemas';

export const authService = {
  login: async (data: LoginFormData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
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
