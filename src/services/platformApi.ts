import type {
  AppUser,
  PublicRatesPayload,
  WebsiteCmsContent,
  SalesEnquiry,
  ActivityLogEntry,
  ErpRole,
  UserPermissions,
} from '../types';

const TOKEN_STORAGE_KEY = 'nd_erp_auth_token_v1';

export function getStoredAuthToken(): string | null {
  try {
    return window.localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredAuthToken(token: string | null): void {
  try {
    if (token) {
      window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch {
    // noop
  }
}

async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error || `Request failed (${res.status})`);
  }
  return data as T;
}

export const PlatformApi = {
  async fetchPublicWebsite(): Promise<{
    cms: WebsiteCmsContent;
    rateSummary: {
      mediumSectionRate: number;
      lightSectionRate: number;
      lastUpdated: string;
      rateStatus: 'Published' | 'Indicative';
    };
  }> {
    return apiFetch('/api/public/website');
  },

  async fetchPublicRates(): Promise<PublicRatesPayload> {
    return apiFetch('/api/public/rates');
  },

  async submitPublicEnquiry(payload: {
    name: string;
    companyName?: string;
    phone: string;
    email?: string;
    city?: string;
    product?: string;
    grade?: string;
    quantity?: number;
    unit?: string;
    notes?: string;
  }): Promise<{ success: boolean; enquiry: SalesEnquiry; message: string }> {
    return apiFetch('/api/public/enquiries', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async login(
    identifier: string,
    password: string,
    rememberMe: boolean
  ): Promise<{ success: boolean; token: string; user: AppUser }> {
    const res = await apiFetch<{ success: boolean; token: string; user: AppUser }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password, rememberMe }),
    });
    if (res.token) {
      setStoredAuthToken(res.token);
    }
    return res;
  },

  async logout(): Promise<void> {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } finally {
      setStoredAuthToken(null);
    }
  },

  async fetchCurrentUser(): Promise<{ authenticated: boolean; user?: AppUser }> {
    try {
      return await apiFetch('/api/auth/me');
    } catch {
      return { authenticated: false };
    }
  },

  async forgotPassword(identifier: string): Promise<{
    success: boolean;
    message: string;
    verificationCodeHint?: string;
  }> {
    return apiFetch('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ identifier }),
    });
  },

  async resetPassword(code: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    return apiFetch('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ code, newPassword }),
    });
  },

  async fetchErpBootstrap(): Promise<{
    user: AppUser;
    cms: WebsiteCmsContent;
    publicRates: PublicRatesPayload;
    enquiries: SalesEnquiry[];
    users: AppUser[];
    activityLogs: ActivityLogEntry[];
  }> {
    return apiFetch('/api/erp/bootstrap');
  },

  async saveErpRates(payload: {
    categoryBasicRates?: Record<string, number | undefined>;
    products?: Array<{
      id: string;
      code?: string;
      gaugeDifference?: number;
      finalRate?: number;
      inStock?: boolean;
      status?: string;
      description?: string;
    }>;
    rateStatus?: 'Published' | 'Indicative';
  }): Promise<{ success: boolean; publicRates: PublicRatesPayload }> {
    return apiFetch('/api/erp/rates', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async saveWebsiteCms(cms: Partial<WebsiteCmsContent>): Promise<{ success: boolean; cms: WebsiteCmsContent }> {
    return apiFetch('/api/erp/website', {
      method: 'PUT',
      body: JSON.stringify(cms),
    });
  },

  async fetchTeamUsers(): Promise<{ users: AppUser[]; activityLogs: ActivityLogEntry[] }> {
    return apiFetch('/api/users');
  },

  async createTeamUser(payload: {
    username: string;
    name: string;
    email: string;
    phone: string;
    password: string;
    rbacRole: ErpRole;
    permissions?: Partial<UserPermissions>;
  }): Promise<{ success: boolean; user: AppUser }> {
    return apiFetch('/api/users', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateTeamUser(
    id: string,
    payload: {
      name?: string;
      email?: string;
      phone?: string;
      status?: 'Active' | 'Inactive';
      rbacRole?: ErpRole;
      permissions?: Partial<UserPermissions>;
    }
  ): Promise<{ success: boolean; user: AppUser }> {
    return apiFetch(`/api/users/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async resetTeamUserPassword(id: string, newPassword: string): Promise<{ success: boolean }> {
    return apiFetch(`/api/users/${encodeURIComponent(id)}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ newPassword }),
    });
  },
};
