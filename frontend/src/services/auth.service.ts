import api, { ApiResponse } from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface PhoneOTPRequest {
  phoneNumber: string;
}

export interface VerifyOTPRequest {
  phoneNumber: string;
  otp: string;
}

export interface Parent {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber?: string;
  profilePicture?: string;
}

export interface AuthResponse {
  parent: Parent;
  accessToken: string;
}

class AuthService {
  async register(data: RegisterData): Promise<ApiResponse<AuthResponse>> {
    const response = await api.post('/auth/register', data);
    
    if (response.data.success && response.data.data.accessToken) {
      localStorage.setItem('accessToken', response.data.data.accessToken);
    }
    
    return response.data;
  }

  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    const response = await api.post('/auth/login', credentials);
    
    if (response.data.success && response.data.data.accessToken) {
      localStorage.setItem('accessToken', response.data.data.accessToken);
    }
    
    return response.data;
  }

  async requestOTP(data: PhoneOTPRequest): Promise<ApiResponse> {
    const response = await api.post('/auth/request-otp', data);
    return response.data;
  }

  async verifyOTP(data: VerifyOTPRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await api.post('/auth/verify-otp', data);
    
    if (response.data.success && response.data.data.accessToken) {
      localStorage.setItem('accessToken', response.data.data.accessToken);
    }
    
    return response.data;
  }

  async logout(): Promise<void> {
    await api.post('/auth/logout');
    localStorage.removeItem('accessToken');
  }

  async requestPasswordReset(email: string): Promise<ApiResponse> {
    const response = await api.post('/auth/request-password-reset', { email });
    return response.data;
  }

  async resetPassword(email: string, resetToken: string, newPassword: string): Promise<ApiResponse> {
    const response = await api.post('/auth/reset-password', {
      email,
      resetToken,
      newPassword,
    });
    return response.data;
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  }
}

export default new AuthService();
