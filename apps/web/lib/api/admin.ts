import { apiClient, ApiError } from "./client"

export interface PlatformStats {
  totalUsers: number
  proUsers: number
  freeUsers: number
  totalLinks: number
  totalClicks: number
}

export const adminApi = {
  getStats: async (): Promise<PlatformStats | null> => {
    try {
      const response = await apiClient.get<PlatformStats>("/api/admin/stats")
      return response.data ?? null
    } catch (error) {
      if (error instanceof ApiError) return null
      return null
    }
  },
}
