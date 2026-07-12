export interface UserResponseDto {
  id: string;
  email: string;
  fullName: string;
  employeeCode: string;
  phone: string | null;
  profileImage: string | null;
  status: string;
  mfaReady: boolean;
  roleId: string;
  roleName: string;
  departmentId: string | null;
  createdAt: Date;
}

export interface AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  user: UserResponseDto;
}

export interface RefreshTokenResponseDto {
  accessToken: string;
  refreshToken: string;
}
