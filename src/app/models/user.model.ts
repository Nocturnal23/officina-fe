export type Role = 'USER' | 'ADMIN';

export interface UserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

export interface UserResponse {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: Role;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}