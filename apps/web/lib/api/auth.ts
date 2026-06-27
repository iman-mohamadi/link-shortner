import { apiClient } from './client';
import type { SendOtpInput, SendOtpResponse, VerifyOtpInput, VerifyOtpResponse } from './types';

export const authApi = {
  sendOtp: async (data: SendOtpInput): Promise<SendOtpResponse> => {
    return apiClient.post<SendOtpResponse>('/auth/send-otp', data);
  },

  verifyOtp: async (data: VerifyOtpInput): Promise<VerifyOtpResponse> => {
    const response = await apiClient.post<VerifyOtpResponse>('/auth/verify-otp', data);
    if (response.token) {
      apiClient.setToken(response.token);
    }
    return response;
  },

  logout: () => {
    apiClient.clearToken();
  },
};
