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
        throw new Error(error.message);
      }
      throw error;
    }
  },

  /**
   * Re-fetches the profile and syncs it into the store. The JWT carries the
   * plan from login time, so this is how a fresh upgrade/promotion becomes
   * visible without forcing the user to log out and back in.
   */
  refreshProfile: async () => {
    try {
      const profile: any = await authApi.getUserProfile();
      if (profile?.id) {
        useAuthStore.setState((state) => ({
          user: {
            id: profile.id,
            phone: profile.phone,
            isPro: Boolean(profile.isPro),
            createdAt: profile.createdAt ?? state.user?.createdAt ?? '',
          },
        }));
      }
      return profile;
    } catch {
      // Non-fatal: a 401 is already handled centrally by the API client.
      return null;
    }
  },
};
