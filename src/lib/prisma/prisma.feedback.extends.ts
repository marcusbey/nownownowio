import type { PrismaClient, OrganizationPlanType, BillingCycle } from "@prisma/client";

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
    
    // Build the query parts
    const whereClause = `WHERE "organizationId" = ${organizationId}${options?.status ? ` AND "status" = '${options.status}'` : ''}`;
    const orderByClause = options?.orderBy 
      ? `ORDER BY ${options.orderBy.map(o => Object.entries(o).map(([k, v]) => `"${k}" ${v}`).join(', ')).join(', ')}`
      : `ORDER BY "status" ASC, "votes" DESC, "createdAt" DESC`;
    const limitClause = options?.limit ? `LIMIT ${options.limit}` : '';
    const offsetClause = options?.skip ? `OFFSET ${options.skip}` : '';
    
    // Use raw query since WidgetFeedback model might not be recognized by TypeScript
    const feedback = await prisma.$queryRaw<WidgetFeedback[]>`
      SELECT * FROM "WidgetFeedback"
      ${whereClause}
      ${orderByClause}
      ${limitClause}
      ${offsetClause}
    `;
    
    return feedback;
  },
  
  /**
   * Count feedback for an organization
   */
  async countForOrganization(organizationId: string, status?: string): Promise<number> {
    const prisma = await getPrismaClient();
    
    // Build the query parts
    const whereClause = `WHERE "organizationId" = ${organizationId}${status ? ` AND "status" = '${status}'` : ''}`;
    
    // Use raw query since WidgetFeedback model might not be recognized by TypeScript
    const result = await prisma.$queryRaw<[{ count: number }]>`
      SELECT COUNT(*) as count FROM "WidgetFeedback"
      ${whereClause}
    `;
    
    return result[0].count;
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
