import { User } from '@/contexts/AuthContext';

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    user: User;
  };
}

export interface GenericResponse {
  success: boolean;
  message: string;
}
