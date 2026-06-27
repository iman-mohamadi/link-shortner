export interface User {
  id: string;
  phone: string;
  isPro: boolean;
  createdAt: string;
}

export interface Link {
  id: string;
  originalUrl: string;
  shortCode: string;
  slug: string;
  userId: string;
  expiresAt: string | null;
  password: string | null;
  clicks: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    analytics: number;
  };
}

export interface Analytics {
  id: string;
  linkId: string;
  country: string;
  device: string;
  referrer: string | null;
  createdAt: string;
}

export interface LinkStats {
  totalClicks: number;
  countries: Array<{
    country: string;
    _count: { country: number };
  }>;
  devices: Array<{
    device: string;
    _count: { device: number };
  }>;
  recentActivity: Analytics[];
}

export interface CreateLinkInput {
  original_url: string;
  custom_alias?: string;
  expires_at?: string;
  password?: string;
  metadata?: any;
}

export interface CreateLinkResponse {
  message: string;
  shortUrl: string;
  qrCode: string;
  data: Link;
}

export interface SendOtpInput {
  phone: string;
}

export interface SendOtpResponse {
  message: string;
  phone: string;
}

export interface VerifyOtpInput {
  phone: string;
  code: string;
}

export interface VerifyOtpResponse {
  message: string;
  token: string;
  user: {
    phone: string;
    isPro: boolean;
  };
}

export interface UpdateLinkInput {
  originalUrl?: string;
  slug?: string;
  password?: string;
  expiresAt?: string;
}
