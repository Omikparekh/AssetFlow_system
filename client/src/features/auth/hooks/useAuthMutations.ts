import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/auth.service';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export const useLoginMutation = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      login(data.data.accessToken, data.data.user);
      toast.success(data.message || 'Login successful');
      navigate('/dashboard', { replace: true });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to login';
      toast.error(message);
    },
  });
};

export const useSignupMutation = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authService.signup,
    onSuccess: (data) => {
      toast.success(data.message || 'Registration successful! Please login.');
      navigate('/login', { replace: true });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to register';
      toast.error(message);
    },
  });
};

export const useForgotPasswordMutation = () => {
  return useMutation({
    mutationFn: authService.forgotPassword,
    onSuccess: (data) => {
      toast.success(data.message || 'Password reset link sent to your email.');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to request password reset';
      toast.error(message);
    },
  });
};

export const useResetPasswordMutation = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authService.resetPassword,
    onSuccess: (data) => {
      toast.success(data.message || 'Password reset successful! Please login.');
      navigate('/login', { replace: true });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to reset password';
      toast.error(message);
    },
  });
};
