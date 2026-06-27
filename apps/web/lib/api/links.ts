import { apiClient, ApiError } from './client';
import type {
  CreateLinkInput,
  CreateLinkResponse,
  Link,
  LinkStats,
  UpdateLinkInput,
  LinkStatsResponse,
  UserLinksResponse
} from './types';

export const linksApi = {
  createLink: async (data: CreateLinkInput): Promise<CreateLinkResponse> => {
    try {
      const response = await apiClient.post<CreateLinkResponse>('/api/links/create', data);
      return response.data || response;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw error;
    }
  },

  getMyLinks: async (): Promise<Link[]> => {
    try {
      const response = await apiClient.get<Link[]>('/api/user/me/links');
      return response.data || [];
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw error;
    }
  },

  updateLink: async (id: string, data: UpdateLinkInput): Promise<{ message: string; data: Link }> => {
    try {
      const response = await apiClient.patch<Link>(`/api/user/links/${id}`, data);
      return {
        message: response.message || 'Link updated',
        data: response.data || {}
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw error;
    }
  },

  deleteLink: async (id: string): Promise<{ message: string }> => {
    try {
      const response = await apiClient.delete<void>(`/api/user/links/${id}`);
      return { message: response.message || 'Link deleted' };
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw error;
    }
  },

  getLinkStats: async (id: string): Promise<LinkStats> => {
    try {
      const response = await apiClient.get<LinkStats>(`/api/user/links/${id}/stats`);
      return response.data || {};
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw error;
    }
  },
};
