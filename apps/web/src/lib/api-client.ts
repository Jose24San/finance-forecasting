import { supabase } from './supabase';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Types matching the Prisma schema
export interface CreateScenarioRequest {
  name: string;
  description?: string;
  personalProfile: {
    age: number | null;
    location: string;
    dependents: number;
  };
  assets: Array<{
    name: string;
    amount: number;
    category: string;
    growthRate: number;
  }>;
  incomeStreams: Array<{
    name: string;
    amount: number;
    frequency: string;
    startDate: string;
    endDate?: string;
    raiseRate?: number;
  }>;
  milestones: Array<{
    name: string;
    type: string;
    date: string;
    impact: number;
  }>;
  settings: {
    inflationRate: number;
    stockGrowthRate: number;
    realEstateGrowth: number;
  };
}

export interface ScenarioResponse {
  id: string;
  name: string;
  description?: string;
  userId: string;
  assets: Array<{
    id: string;
    name: string;
    amount: number;
    category: string;
    growthRate: number;
  }>;
  incomeStreams: Array<{
    id: string;
    name: string;
    amount: number;
    frequency: string;
    startDate: string;
    endDate?: string;
    raiseRate?: number;
  }>;
  milestones: Array<{
    id: string;
    name: string;
    type: string;
    date: string;
    impact: number;
  }>;
  settings?: {
    id: string;
    inflationRate: number;
    stockGrowthRate: number;
    realEstateGrowth: number;
  };
  createdAt: string;
  updatedAt: string;
}

class ApiError extends Error {
  constructor(message: string, public status: number, public details?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

// Helper function to get auth token
async function getAuthToken(): Promise<string | null> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.access_token || null;
  } catch (error) {
    console.error('Failed to get auth token:', error);
    return null;
  }
}

// Helper function for authenticated API requests
async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getAuthToken();

  if (!token) {
    throw new ApiError('Authentication required', 401);
  }

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `API request failed: ${response.status} ${response.statusText}`;

    try {
      const errorData = JSON.parse(errorText);
      errorMessage = errorData.error || errorData.message || errorMessage;
    } catch {
      // If parsing fails, use the raw text or default message
      errorMessage = errorText || errorMessage;
    }

    throw new ApiError(errorMessage, response.status, errorText);
  }

  return response;
}

export const apiClient = {
  // Create a new scenario
  async createScenario(data: CreateScenarioRequest): Promise<ScenarioResponse> {
    const response = await authenticatedFetch('/scenarios', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    return response.json();
  },

  // Update an existing scenario
  async updateScenario(
    id: string,
    data: Partial<CreateScenarioRequest>
  ): Promise<ScenarioResponse> {
    const response = await authenticatedFetch(`/scenarios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });

    return response.json();
  },

  // Get scenario by ID
  async getScenario(id: string): Promise<ScenarioResponse> {
    const response = await authenticatedFetch(`/scenarios/${id}`);
    return response.json();
  },

  // Get all scenarios for the user
  async getScenarios(): Promise<ScenarioResponse[]> {
    const response = await authenticatedFetch('/scenarios');
    return response.json();
  },

  // Delete a scenario
  async deleteScenario(id: string): Promise<void> {
    await authenticatedFetch(`/scenarios/${id}`, {
      method: 'DELETE',
    });
  },

  // Check if user is authenticated
  async checkAuth(): Promise<boolean> {
    try {
      const token = await getAuthToken();
      return !!token;
    } catch {
      return false;
    }
  },
};

export { ApiError };
