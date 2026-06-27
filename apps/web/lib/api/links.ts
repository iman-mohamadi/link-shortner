import { apiClient } from './client';
import type { 
  CreateLinkInput, 
  CreateLinkResponse, 
  Link, 
  LinkStats, 
  UpdateLinkInput 
} from './types';

export const linksApi = {
  createLink: async (data: CreateLinkInput): Promise<CreateLinkResponse> => {
    return apiClient.post<CreateLinkResponse>('/links/create', data);
  },

  getMyLinks: async (): Promise<Link[]> => {
    return apiClient.get<Link[]>('/user/me/links');
  },

  updateLink: async (id: string, data: UpdateLinkInput): Promise<{ message: string; data: Link }> => {
    return apiClient.patch<{ message: string; data: Link }>(`/user/links/${id}`, data);
  },

  deleteLink: async (id: string): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>(`/user/links/${id}`);
  },

  getLinkStats: async (id: string): Promise<LinkStats> => {
    return apiClient.get<LinkStats>(`/user/links/${id}/stats`);
  },
};
