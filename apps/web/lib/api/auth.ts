import { apiClient, ApiError } from './client';
import type { SendOtpInput, SendOtpResponse, VerifyOtpInput, VerifyOtpResponse } from './types';
import { useAuthStore } from '../store/auth';

export const authApi = {
  sendOtp: async (data: SendOtpInput): Promise<SendOtpResponse> => {
    try {
      const response = await apiClient.post<SendOtpResponse>('/api/auth/send-otp', data);
      return (response.data || response) as SendOtpResponse;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw error;
    }
  },

  verifyOtp: async (data: VerifyOtpInput): Promise<VerifyOtpResponse> => {
    try {
      const response = await apiClient.post<VerifyOtpResponse>('/api/auth/verify-otp', data);
      const authData = (response.data || response) as VerifyOtpResponse;

      if (authData.token) {
        apiClient.setToken(authData.token);
        useAuthStore.setState({
          token: authData.token,
          user: authData.user,
          error: null,
        });
      }

      return authData;
    } catch (error) {
      if (error instanceof ApiError) {
        useAuthStore.setState({ error: error.message });
        throw new Error(error.message);
      }
      throw error;
    }
  },

  logout: () => {
    apiClient.clearToken();
    useAuthStore.setState({ user: null, token: null });
  },

  getUserProfile: async () => {
    try {
      const response = await apiClient.get('/api/user/me');
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 401) {
          authApi.logout();
        }
        throw new Error(error.message);
      }
      throw error;
    }
  },
};
