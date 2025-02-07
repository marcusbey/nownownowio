import { type NextRequest } from 'next/server';
import { getClientIp } from './ip';
import { type ApiContext } from './apiHandler';

export interface PaginationParams {
  cursor?: string;
  pageSize: number;
  orderBy?: Record<string, 'asc' | 'desc'>;
}

export interface PaginatedResponse<T> {
  data: T[];
  nextCursor: string | null;
}

export const withPagination = (defaultPageSize: number = 10) => 
  async ({ req }: ApiContext): Promise<PaginationParams> => {
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;
    const pageSize = Number(req.nextUrl.searchParams.get("pageSize")) || defaultPageSize;
    return { cursor, pageSize };
  };

export const withIpTracking = async ({ req }: ApiContext) => ({
  clientIp: await getClientIp(req)
});

export const createPaginatedQuery = async <T>(
  query: Promise<T[]>,
  { pageSize }: PaginationParams
): Promise<PaginatedResponse<T>> => {
  // Fetch one extra item to determine if there are more pages
  const items = await query;
  const hasMore = items.length > pageSize;
  
  return {
    data: hasMore ? items.slice(0, pageSize) : items,
    nextCursor: hasMore ? (items[pageSize - 1] as any).id : null
  };
};
