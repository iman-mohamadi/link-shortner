import { apiClient, ApiError } from './client';
import type { User } from './types';
import { useAuthStore } from '../store/auth';

interface CheckoutResponse {
  message: string;
  token?: string;
  user?: User;
  alreadyPro?: boolean;
}

export const billingApi = {
  /**
   * Starts a Pro upgrade. In development the API completes the (simulated)
   * checkout and returns a fresh token + user, which we swap into the session
   * so Pro unlocks instantly.
   */
  checkout: async (): Promise<CheckoutResponse> => {
    try {
      const res = await apiClient.post<CheckoutResponse>('/api/billing/checkout');
      const data = ((res as any).token || (res as any).user ? res : res.data) as CheckoutResponse;

      if (data?.token) apiClient.setToken(data.token);
      if (data?.token || data?.user) {
        useAuthStore.setState((state) => ({
          token: data.token ?? state.token,
          user: data.user ?? state.user,
        }));
      }
      return data;
    } catch (error) {
      if (error instanceof ApiError) throw new Error(error.message);
      throw error;
    }
  },
};
