import type { PrismaClient, OrganizationPlanType, BillingCycle, Prisma } from "@prisma/client";
import { FeedbackStatus } from "@prisma/client";
import { logger } from '@/lib/logger';

// Define extended OrganizationPlan type with feedback fields
export type ExtendedOrganizationPlan = {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  type: OrganizationPlanType;
  maximumMembers: number;
  maxPostsPerDay: number;
  maxCommentsPerDay: number;
  maxStorageGb: number;
  maxTeams: number;
  maxProjects: number;
  billingCycle: BillingCycle;
  // Feedback-specific fields
  hasFeedbackFeature: boolean;
  maxFeedbackItems: number;
}

// Define feedback types based on the Prisma schema
type WidgetFeedback = {
  id: string;
  content: string;
  email?: string | null;
  votes: number;
  status: "NEW" | "ACKNOWLEDGED" | "IN_PROGRESS" | "COMPLETED" | "REJECTED";
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
};

type WidgetFeedbackVoter = {
  id: string;
  email: string;
  feedbackId: string;
  ipAddress?: string;
  createdAt: Date;
};

// Get a fresh PrismaClient instance when needed
let localPrismaClient: PrismaClient | null = null;

async function getPrismaClient(): Promise<PrismaClient> {
  if (!localPrismaClient) {
    // Dynamically import to avoid circular dependency
    const { prisma } = await import("../prisma");
    localPrismaClient = prisma;
  }
  return localPrismaClient;
}

/**
 * Extension for WidgetFeedback model to add custom methods
 */
export const feedbackExtensions = {
  /**
   * Find all feedback for an organization
   */
  async findForOrganization(
    organizationId: string, 
    options?: { 
      status?: string; 
      limit?: number; 
      skip?: number;
      orderBy?: Record<string, "asc" | "desc">[];
    }
  ): Promise<WidgetFeedback[]> {
    const prisma = await getPrismaClient();
    
    try {
      // Use Prisma's built-in query builder instead of raw SQL
      const query: Prisma.WidgetFeedbackFindManyArgs = {
        where: {
          organizationId: organizationId
        },
        orderBy: [
          { status: 'asc' as const },
          { votes: 'desc' as const },
          { createdAt: 'desc' as const }
        ]
      };
      
      // Add status filter if provided
      if (options?.status && query.where) {
        // Ensure status is a valid FeedbackStatus enum value
        if (Object.values(FeedbackStatus).includes(options.status as FeedbackStatus)) {
          query.where.status = options.status as FeedbackStatus;
        } else {
          logger.warn(`Invalid feedback status: ${options.status}`);
        }
      }
      
      // Add custom order by if provided
      if (options?.orderBy && options.orderBy.length > 0) {
        query.orderBy = options.orderBy;
      }
      
      // Add pagination if provided
      if (options?.limit) {
        query.take = options.limit;
      }
      
      if (options?.skip) {
        query.skip = options.skip;
      }
      
      // Use Prisma's findMany method
      const feedback = await prisma.widgetFeedback.findMany(query);
      return feedback;
    } catch (error) {
      // Log error to server logs
      logger.error('Error finding feedback for organization', { organizationId, error });
      return [];
    }
  },
  
  /**
   * Count feedback for an organization
   */
  async countForOrganization(organizationId: string, status?: string): Promise<number> {
    const prisma = await getPrismaClient();
    
    try {
      // Use Prisma's built-in query builder instead of raw SQL
      const whereCondition: Prisma.WidgetFeedbackWhereInput = {
        organizationId: organizationId
      };
      
      // Add status filter if provided
      if (status) {
        // Ensure status is a valid FeedbackStatus enum value
        if (Object.values(FeedbackStatus).includes(status as FeedbackStatus)) {
          whereCondition.status = status as FeedbackStatus;
        } else {
          logger.warn(`Invalid feedback status: ${status}`);
        }
      }
      
      // Use Prisma's count method
      const count = await prisma.widgetFeedback.count({
        where: whereCondition
      });
      
      return count;
    } catch (error) {
      // Log error to server logs
      logger.error('Error counting feedback for organization', { organizationId, error });
      return 0;
    }
  },
  
  /**
   * Create a new feedback item
   */
  async create(data: { 
    content: string; 
    email?: string | null; 
    organizationId: string;
    votes?: number;
  }): Promise<WidgetFeedback> {
    const prisma = await getPrismaClient();
    
    // Use raw query since WidgetFeedback model might not be recognized by TypeScript
    const result = await prisma.$queryRaw<[WidgetFeedback]>`
      INSERT INTO "WidgetFeedback" ("content", "email", "organizationId", "votes", "status")
      VALUES (${data.content}, ${data.email}, ${data.organizationId}, ${data.votes ?? 1}, 'NEW')
      RETURNING *
    `;
    
    return result[0];
  },
  
  /**
   * Update a feedback item
   */
  async update(id: string, data: Partial<Omit<WidgetFeedback, 'id' | 'createdAt' | 'updatedAt'>>): Promise<WidgetFeedback> {
    const prisma = await getPrismaClient();
    
    // Build the SET clause
    const setClauses = Object.entries(data)
      .map(([key, value]) => `"${key}" = ${typeof value === 'string' ? `'${value}'` : value}`)
      .join(', ');
    
    // Use raw query since WidgetFeedback model might not be recognized by TypeScript
    const result = await prisma.$queryRaw<[WidgetFeedback]>`
      UPDATE "WidgetFeedback"
      SET ${setClauses}, "updatedAt" = NOW()
      WHERE "id" = ${id}
      RETURNING *
    `;
    
    return result[0];
  },
  
  /**
   * Delete a feedback item
   */
  async delete(id: string): Promise<WidgetFeedback> {
    const prisma = await getPrismaClient();
    
    // Use raw query since WidgetFeedback model might not be recognized by TypeScript
    const result = await prisma.$queryRaw<[WidgetFeedback]>`
      DELETE FROM "WidgetFeedback"
      WHERE "id" = ${id}
      RETURNING *
    `;
    
    return result[0];
  }
};

/**
 * Extension for WidgetFeedbackVoter model to add custom methods
 */
export const feedbackVoterExtensions = {
  /**
   * Check if a user has already voted on a feedback item by email
   */
  async hasVoted(feedbackId: string, email: string): Promise<boolean> {
    const prisma = await getPrismaClient();
    
    // Use raw query since WidgetFeedbackVoter model might not be recognized by TypeScript
    const result = await prisma.$queryRaw<[{ count: number }]>`
      SELECT COUNT(*) as count FROM "WidgetFeedbackVoter"
      WHERE "feedbackId" = ${feedbackId} AND "email" = ${email}
    `;
    
    return result[0].count > 0;
  },
  
  /**
   * Check if a user has already voted on a feedback item by IP address
   */
  async hasVotedByIp(feedbackId: string, ipAddress: string): Promise<boolean> {
    const prisma = await getPrismaClient();
    
    // Use raw query since WidgetFeedbackVoter model might not be recognized by TypeScript
    const result = await prisma.$queryRaw<[{ count: number }]>`
      SELECT COUNT(*) as count FROM "WidgetFeedbackVoter"
      WHERE "feedbackId" = ${feedbackId} AND "ipAddress" = ${ipAddress}
    `;
    
    return result[0].count > 0;
  },
  
  /**
   * Add a vote to a feedback item
   */
  async create(data: { feedbackId: string; email: string; ipAddress?: string }): Promise<WidgetFeedbackVoter> {
    const prisma = await getPrismaClient();
    
    // Use raw query since WidgetFeedbackVoter model might not be recognized by TypeScript
    const result = await prisma.$queryRaw<[WidgetFeedbackVoter]>`
      INSERT INTO "WidgetFeedbackVoter" ("feedbackId", "email", "ipAddress")
      VALUES (${data.feedbackId}, ${data.email}, ${data.ipAddress ?? null})
      RETURNING *
    `;
    
    return result[0];
  },
  
  /**
   * Get voters for a feedback item
   */
  async findForFeedback(feedbackId: string): Promise<WidgetFeedbackVoter[]> {
    const prisma = await getPrismaClient();
    
    // Use raw query since WidgetFeedbackVoter model might not be recognized by TypeScript
    const voters = await prisma.$queryRaw<WidgetFeedbackVoter[]>`
      SELECT * FROM "WidgetFeedbackVoter"
      WHERE "feedbackId" = ${feedbackId}
      ORDER BY "createdAt" DESC
    `;
    
    return voters;
  }
};
