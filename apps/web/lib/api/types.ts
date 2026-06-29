export interface User {
  id: string;
  phone: string;
  isPro: boolean;
  createdAt: string;
  _count?: {
    links: number;
  };
}

export interface Link {
  id: string;
  originalUrl: string;
  slug: string;
  userId: string;
  expiresAt: string | null;
  password: string | null;
  clicks: number;
  customSlug: boolean;
  isActive: boolean;
  title: string | null;
  description: string | null;
  favicon: string | null;
  createdAt: string;
  updatedAt?: string;
  _count?: {
    analytics: number;
  };
}

export interface Analytics {
  id: string;
  linkId: string;
  country?: string;
  city?: string | null;
  region?: string | null;
  device?: string;
  browser?: string;
  referrer?: string | null;
  ip?: string | null;
  timestamp?: string;
  createdAt?: string;
}

export interface LinkStats {
  totalClicks: number;
  linkId: string;
  slug: string;
  countries:  Array<{ country:  string; count: number }>;
  cities:     Array<{ city:     string; count: number }>;
  devices:    Array<{ device:   string; count: number }>;
  browsers:   Array<{ browser:  string; count: number }>;
  referrers:  Array<{ referrer: string; count: number }>;
  recentActivity: Analytics[];
  createdAt: string;
}

export interface CreateLinkInput {
  original_url: string;
  custom_alias?: string;
  expires_at?: string;
  password?: string;
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
  code?: string;
}

export interface VerifyOtpInput {
  phone: string;
  code: string;
}

export interface VerifyOtpResponse {
  message: string;
  token: string;
  user: User;
}

export interface UpdateLinkInput {
  originalUrl?: string;
  slug?: string;
  // `null` clears the field, a string sets it, omitted leaves it unchanged.
  password?: string | null;
  expiresAt?: string | null;
  isActive?: boolean;
}

export interface LinkStatsResponse {
  message: string;
  data: LinkStats;
}

export interface UserLinksResponse {
  message: string;
  data: Link[];
}

