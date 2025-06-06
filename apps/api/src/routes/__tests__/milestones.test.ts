import fastify from 'fastify';
import { build } from '../../app/app';
import { PrismaClient } from '@prisma/client';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Mock PrismaClient
vi.mock('@prisma/client', () => {
  const mockPrisma = {
    milestone: {
      create: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  };
  return {
    PrismaClient: vi.fn(() => mockPrisma),
  };
});

describe('Milestone Routes', () => {
  let app: ReturnType<typeof fastify>;
  let prisma: PrismaClient;

  beforeEach(async () => {
    app = await build();
    prisma = new PrismaClient();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /', () => {
    it('should create a new milestone', async () => {
      const mockMilestone = {
        id: '1',
        name: 'Retirement',
        type: 'RETIREMENT',
        date: '2050-01-01T00:00:00.000Z',
        impact: 100000,
        scenarioId: '123',
        createdAt: '2025-05-27T12:49:44.063Z',
        updatedAt: '2025-05-27T12:49:44.063Z',
      };

      (prisma.milestone.create as any).mockResolvedValue({
        ...mockMilestone,
        date: new Date(mockMilestone.date),
        createdAt: new Date(mockMilestone.createdAt),
        updatedAt: new Date(mockMilestone.updatedAt),
      });

      const response = await app.inject({
        method: 'POST',
        url: '/milestones',
        payload: {
          name: 'Retirement',
          type: 'RETIREMENT',
          date: '2050-01-01',
          impact: 100000,
          scenarioId: '123',
        },
      });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.payload)).toEqual(mockMilestone);
      expect(prisma.milestone.create).toHaveBeenCalledWith({
        data: {
          name: 'Retirement',
          type: 'RETIREMENT',
          date: new Date('2050-01-01'),
          impact: 100000,
          scenarioId: '123',
        },
      });
    });

    it('should handle errors when creating a milestone', async () => {
      (prisma.milestone.create as any).mockRejectedValue(
        new Error('Database error')
      );

      const response = await app.inject({
        method: 'POST',
        url: '/milestones',
        payload: {
          name: 'Retirement',
          type: 'RETIREMENT',
          date: '2050-01-01',
          impact: 100000,
          scenarioId: '123',
        },
      });

      expect(response.statusCode).toBe(500);
      expect(JSON.parse(response.payload)).toEqual({
        error: 'Failed to create milestone',
      });
    });
  });

  describe('GET /scenario/:scenarioId', () => {
    it('should get all milestones for a scenario', async () => {
      const mockMilestones = [
        {
          id: '1',
          name: 'Retirement',
          type: 'RETIREMENT',
          date: '2050-01-01T00:00:00.000Z',
          impact: 100000,
          scenarioId: '123',
          createdAt: '2025-05-27T12:49:44.295Z',
          updatedAt: '2025-05-27T12:49:44.295Z',
        },
      ];

      (prisma.milestone.findMany as any).mockResolvedValue(
        mockMilestones.map((milestone) => ({
          ...milestone,
          date: new Date(milestone.date),
          createdAt: new Date(milestone.createdAt),
          updatedAt: new Date(milestone.updatedAt),
        }))
      );

      const response = await app.inject({
        method: 'GET',
        url: '/milestones/scenario/123',
      });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.payload)).toEqual(mockMilestones);
      expect(prisma.milestone.findMany).toHaveBeenCalledWith({
        where: { scenarioId: '123' },
      });
    });

    it('should handle errors when fetching milestones', async () => {
      (prisma.milestone.findMany as any).mockRejectedValue(
        new Error('Database error')
      );

      const response = await app.inject({
        method: 'GET',
        url: '/milestones/scenario/123',
      });

      expect(response.statusCode).toBe(500);
      expect(JSON.parse(response.payload)).toEqual({
        error: 'Failed to fetch milestones',
      });
    });
  });

  describe('PUT /:id', () => {
    it('should update a milestone', async () => {
      const mockUpdatedMilestone = {
        id: '1',
        name: 'Updated Retirement',
        type: 'RETIREMENT',
        date: '2051-01-01T00:00:00.000Z',
        impact: 150000,
        scenarioId: '123',
        createdAt: '2025-05-27T12:49:44.328Z',
        updatedAt: '2025-05-27T12:49:44.328Z',
      };

      (prisma.milestone.update as any).mockResolvedValue({
        ...mockUpdatedMilestone,
        date: new Date(mockUpdatedMilestone.date),
        createdAt: new Date(mockUpdatedMilestone.createdAt),
        updatedAt: new Date(mockUpdatedMilestone.updatedAt),
      });

      const response = await app.inject({
        method: 'PUT',
        url: '/milestones/1',
        payload: {
          name: 'Updated Retirement',
          date: '2051-01-01',
          impact: 150000,
        },
      });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.payload)).toEqual(mockUpdatedMilestone);
    });

    it('should handle errors when updating a milestone', async () => {
      (prisma.milestone.update as any).mockRejectedValue(
        new Error('Database error')
      );

      const response = await app.inject({
        method: 'PUT',
        url: '/milestones/1',
        payload: {
          name: 'Updated Retirement',
        },
      });

      expect(response.statusCode).toBe(500);
      expect(JSON.parse(response.payload)).toEqual({
        error: 'Failed to update milestone',
      });
    });
  });

  describe('DELETE /:id', () => {
    it('should delete a milestone', async () => {
      (prisma.milestone.delete as any).mockResolvedValue({});

      const response = await app.inject({
        method: 'DELETE',
        url: '/milestones/1',
      });

      expect(response.statusCode).toBe(204);
      expect(prisma.milestone.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should handle errors when deleting a milestone', async () => {
      (prisma.milestone.delete as any).mockRejectedValue(
        new Error('Database error')
      );

      const response = await app.inject({
        method: 'DELETE',
        url: '/milestones/1',
      });

      expect(response.statusCode).toBe(500);
      expect(JSON.parse(response.payload)).toEqual({
        error: 'Failed to delete milestone',
      });
    });
  });
});
