import fastify from 'fastify';
import { build } from '../../app/app';
import { PrismaClient } from '@prisma/client';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Mock PrismaClient
vi.mock('@prisma/client', () => {
  const mockPrisma = {
    incomeStream: {
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

describe('Income Stream Routes', () => {
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
    it('should create a new income stream', async () => {
      const mockIncomeStream = {
        id: '1',
        name: 'Salary',
        amount: 100000,
        frequency: 'MONTHLY',
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2050-01-01T00:00:00.000Z',
        raiseRate: 3.0,
        scenarioId: '123',
        createdAt: '2025-05-27T12:49:44.063Z',
        updatedAt: '2025-05-27T12:49:44.063Z',
      };

      (prisma.incomeStream.create as any).mockResolvedValue({
        ...mockIncomeStream,
        startDate: new Date(mockIncomeStream.startDate),
        endDate: new Date(mockIncomeStream.endDate),
        createdAt: new Date(mockIncomeStream.createdAt),
        updatedAt: new Date(mockIncomeStream.updatedAt),
      });

      const response = await app.inject({
        method: 'POST',
        url: '/income-streams',
        payload: {
          name: 'Salary',
          amount: 100000,
          frequency: 'MONTHLY',
          startDate: '2024-01-01',
          endDate: '2050-01-01',
          raiseRate: 3.0,
          scenarioId: '123',
        },
      });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.payload)).toEqual(mockIncomeStream);
      expect(prisma.incomeStream.create).toHaveBeenCalledWith({
        data: {
          name: 'Salary',
          amount: 100000,
          frequency: 'MONTHLY',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2050-01-01'),
          raiseRate: 3.0,
          scenarioId: '123',
        },
      });
    });

    it('should handle errors when creating an income stream', async () => {
      (prisma.incomeStream.create as any).mockRejectedValue(
        new Error('Database error')
      );

      const response = await app.inject({
        method: 'POST',
        url: '/income-streams',
        payload: {
          name: 'Salary',
          amount: 100000,
          frequency: 'MONTHLY',
          startDate: '2024-01-01',
          endDate: '2050-01-01',
          raiseRate: 3.0,
          scenarioId: '123',
        },
      });

      expect(response.statusCode).toBe(500);
      expect(JSON.parse(response.payload)).toEqual({
        error: 'Failed to create income stream',
      });
    });
  });

  describe('GET /scenario/:scenarioId', () => {
    it('should get all income streams for a scenario', async () => {
      const mockIncomeStreams = [
        {
          id: '1',
          name: 'Salary',
          amount: 100000,
          frequency: 'MONTHLY',
          startDate: '2024-01-01T00:00:00.000Z',
          endDate: '2050-01-01T00:00:00.000Z',
          raiseRate: 3.0,
          scenarioId: '123',
          createdAt: '2025-05-27T12:49:44.295Z',
          updatedAt: '2025-05-27T12:49:44.295Z',
        },
      ];

      (prisma.incomeStream.findMany as any).mockResolvedValue(
        mockIncomeStreams.map((stream) => ({
          ...stream,
          startDate: new Date(stream.startDate),
          endDate: new Date(stream.endDate),
          createdAt: new Date(stream.createdAt),
          updatedAt: new Date(stream.updatedAt),
        }))
      );

      const response = await app.inject({
        method: 'GET',
        url: '/income-streams/scenario/123',
      });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.payload)).toEqual(mockIncomeStreams);
      expect(prisma.incomeStream.findMany).toHaveBeenCalledWith({
        where: { scenarioId: '123' },
      });
    });

    it('should handle errors when fetching income streams', async () => {
      (prisma.incomeStream.findMany as any).mockRejectedValue(
        new Error('Database error')
      );

      const response = await app.inject({
        method: 'GET',
        url: '/income-streams/scenario/123',
      });

      expect(response.statusCode).toBe(500);
      expect(JSON.parse(response.payload)).toEqual({
        error: 'Failed to fetch income streams',
      });
    });
  });

  describe('PUT /:id', () => {
    it('should update an income stream', async () => {
      const mockUpdatedIncomeStream = {
        id: '1',
        name: 'Updated Salary',
        amount: 150000,
        frequency: 'MONTHLY',
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2051-01-01T00:00:00.000Z',
        raiseRate: 4.0,
        scenarioId: '123',
        createdAt: '2025-05-27T12:49:44.328Z',
        updatedAt: '2025-05-27T12:49:44.328Z',
      };

      (prisma.incomeStream.update as any).mockResolvedValue({
        ...mockUpdatedIncomeStream,
        startDate: new Date(mockUpdatedIncomeStream.startDate),
        endDate: new Date(mockUpdatedIncomeStream.endDate),
        createdAt: new Date(mockUpdatedIncomeStream.createdAt),
        updatedAt: new Date(mockUpdatedIncomeStream.updatedAt),
      });

      const response = await app.inject({
        method: 'PUT',
        url: '/income-streams/1',
        payload: {
          name: 'Updated Salary',
          amount: 150000,
          raiseRate: 4.0,
          endDate: '2051-01-01',
        },
      });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.payload)).toEqual(mockUpdatedIncomeStream);
    });

    it('should handle errors when updating an income stream', async () => {
      (prisma.incomeStream.update as any).mockRejectedValue(
        new Error('Database error')
      );

      const response = await app.inject({
        method: 'PUT',
        url: '/income-streams/1',
        payload: {
          name: 'Updated Salary',
        },
      });

      expect(response.statusCode).toBe(500);
      expect(JSON.parse(response.payload)).toEqual({
        error: 'Failed to update income stream',
      });
    });
  });

  describe('DELETE /:id', () => {
    it('should delete an income stream', async () => {
      (prisma.incomeStream.delete as any).mockResolvedValue({});

      const response = await app.inject({
        method: 'DELETE',
        url: '/income-streams/1',
      });

      expect(response.statusCode).toBe(204);
      expect(prisma.incomeStream.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should handle errors when deleting an income stream', async () => {
      (prisma.incomeStream.delete as any).mockRejectedValue(
        new Error('Database error')
      );

      const response = await app.inject({
        method: 'DELETE',
        url: '/income-streams/1',
      });

      expect(response.statusCode).toBe(500);
      expect(JSON.parse(response.payload)).toEqual({
        error: 'Failed to delete income stream',
      });
    });
  });
});
