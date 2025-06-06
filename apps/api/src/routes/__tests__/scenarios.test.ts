import fastify from 'fastify';
import { build } from '../../app/app';
import { PrismaClient } from '@prisma/client';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Mock PrismaClient
vi.mock('@prisma/client', () => {
  const mockPrisma = {
    scenario: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  };
  return {
    PrismaClient: vi.fn(() => mockPrisma),
  };
});

describe('Scenario Routes', () => {
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
    it('should create a new scenario', async () => {
      const mockScenario = {
        id: '1',
        name: 'Retirement Plan',
        description: 'My retirement planning scenario',
        userId: 'user123',
        createdAt: '2025-05-27T12:49:44.063Z',
        updatedAt: '2025-05-27T12:49:44.063Z',
      };

      (prisma.scenario.create as any).mockResolvedValue({
        ...mockScenario,
        createdAt: new Date(mockScenario.createdAt),
        updatedAt: new Date(mockScenario.updatedAt),
      });

      const response = await app.inject({
        method: 'POST',
        url: '/scenarios',
        payload: {
          name: 'Retirement Plan',
          description: 'My retirement planning scenario',
          userId: 'user123',
        },
      });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.payload)).toEqual(mockScenario);
      expect(prisma.scenario.create).toHaveBeenCalledWith({
        data: {
          name: 'Retirement Plan',
          description: 'My retirement planning scenario',
          userId: 'user123',
        },
      });
    });

    it('should handle errors when creating a scenario', async () => {
      (prisma.scenario.create as any).mockRejectedValue(
        new Error('Database error')
      );

      const response = await app.inject({
        method: 'POST',
        url: '/scenarios',
        payload: {
          name: 'Retirement Plan',
          description: 'My retirement planning scenario',
          userId: 'user123',
        },
      });

      expect(response.statusCode).toBe(500);
      expect(JSON.parse(response.payload)).toEqual({
        error: 'Failed to create scenario',
      });
    });
  });

  describe('GET /:id', () => {
    it('should get a scenario by ID with all relations', async () => {
      const mockScenario = {
        id: '1',
        name: 'Retirement Plan',
        description: 'My retirement planning scenario',
        userId: 'user123',
        createdAt: '2025-05-27T12:49:44.295Z',
        updatedAt: '2025-05-27T12:49:44.295Z',
        assets: [],
        incomeStreams: [],
        milestones: [],
        settings: null,
        withdrawalOrder: null,
      };

      (prisma.scenario.findUnique as any).mockResolvedValue({
        ...mockScenario,
        createdAt: new Date(mockScenario.createdAt),
        updatedAt: new Date(mockScenario.updatedAt),
      });

      const response = await app.inject({
        method: 'GET',
        url: '/scenarios/1',
      });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.payload)).toEqual(mockScenario);
      expect(prisma.scenario.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: {
          assets: true,
          incomeStreams: true,
          milestones: true,
          settings: true,
          withdrawalOrder: true,
        },
      });
    });

    it('should return 404 when scenario is not found', async () => {
      (prisma.scenario.findUnique as any).mockResolvedValue(null);

      const response = await app.inject({
        method: 'GET',
        url: '/scenarios/1',
      });

      expect(response.statusCode).toBe(404);
      expect(JSON.parse(response.payload)).toEqual({
        error: 'Scenario not found',
      });
    });

    it('should handle errors when fetching a scenario', async () => {
      (prisma.scenario.findUnique as any).mockRejectedValue(
        new Error('Database error')
      );

      const response = await app.inject({
        method: 'GET',
        url: '/scenarios/1',
      });

      expect(response.statusCode).toBe(500);
      expect(JSON.parse(response.payload)).toEqual({
        error: 'Failed to fetch scenario',
      });
    });
  });

  describe('PUT /:id', () => {
    it('should update a scenario', async () => {
      const mockUpdatedScenario = {
        id: '1',
        name: 'Updated Retirement Plan',
        description: 'Updated retirement planning scenario',
        userId: 'user123',
        createdAt: '2025-05-27T12:49:44.328Z',
        updatedAt: '2025-05-27T12:49:44.328Z',
      };

      (prisma.scenario.update as any).mockResolvedValue({
        ...mockUpdatedScenario,
        createdAt: new Date(mockUpdatedScenario.createdAt),
        updatedAt: new Date(mockUpdatedScenario.updatedAt),
      });

      const response = await app.inject({
        method: 'PUT',
        url: '/scenarios/1',
        payload: {
          name: 'Updated Retirement Plan',
          description: 'Updated retirement planning scenario',
        },
      });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.payload)).toEqual(mockUpdatedScenario);
    });

    it('should handle errors when updating a scenario', async () => {
      (prisma.scenario.update as any).mockRejectedValue(
        new Error('Database error')
      );

      const response = await app.inject({
        method: 'PUT',
        url: '/scenarios/1',
        payload: {
          name: 'Updated Retirement Plan',
        },
      });

      expect(response.statusCode).toBe(500);
      expect(JSON.parse(response.payload)).toEqual({
        error: 'Failed to update scenario',
      });
    });
  });

  describe('DELETE /:id', () => {
    it('should delete a scenario', async () => {
      (prisma.scenario.delete as any).mockResolvedValue({});

      const response = await app.inject({
        method: 'DELETE',
        url: '/scenarios/1',
      });

      expect(response.statusCode).toBe(204);
      expect(prisma.scenario.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should handle errors when deleting a scenario', async () => {
      (prisma.scenario.delete as any).mockRejectedValue(
        new Error('Database error')
      );

      const response = await app.inject({
        method: 'DELETE',
        url: '/scenarios/1',
      });

      expect(response.statusCode).toBe(500);
      expect(JSON.parse(response.payload)).toEqual({
        error: 'Failed to delete scenario',
      });
    });
  });
});
