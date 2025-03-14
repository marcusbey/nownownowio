import { env } from '../env';

const API_BASE = env.NEXT_PUBLIC_API_URL;

export class DatabaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
    throw new DatabaseError(error.message);
  }

  return response.json();
}

// Example database operations through API
export const dbClient = {
  users: {
    findUnique: async (id: string) => fetchApi(`/api/users/${id}`),
    create: async (data: any) => fetchApi('/api/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    // Add other user operations
  },
  organizations: {
    findUnique: async (slug: string) => fetchApi(`/api/organizations/${slug}`),
    create: async (data: any) => fetchApi('/api/organizations', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    // Add other organization operations
  },
  // Add other models
};
