import fastify from 'fastify';
import { build } from '../../app/app';
import { PrismaClient } from '@prisma/client';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Mock PrismaClient
vi.mock('@prisma/client', () => {
  const mockPrisma = {
    asset: {
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

describe('Asset Routes', () => {
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
    it('should create a new asset', async () => {
      const mockAsset = {
        id: '1',
        name: 'Stock Portfolio',
        amount: 100000,
        category: 'STOCKS',
        growthRate: 7.0,
        scenarioId: '123',
        createdAt: '2025-05-27T12:49:44.063Z',
        updatedAt: '2025-05-27T12:49:44.063Z',
      };

      (prisma.asset.create as any).mockResolvedValue({
        ...mockAsset,
        createdAt: new Date(mockAsset.createdAt),
        updatedAt: new Date(mockAsset.updatedAt),
      });

      const response = await app.inject({
        method: 'POST',
        url: '/assets',
        payload: {
          name: 'Stock Portfolio',
          amount: 100000,
          category: 'STOCKS',
          growthRate: 7.0,
          scenarioId: '123',
        },
      });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.payload)).toEqual(mockAsset);
      expect(prisma.asset.create).toHaveBeenCalledWith({
        data: {
          name: 'Stock Portfolio',
          amount: 100000,
          category: 'STOCKS',
          growthRate: 7.0,
          scenarioId: '123',
        },
      });
    });

    it('should handle errors when creating an asset', async () => {
      (prisma.asset.create as any).mockRejectedValue(
        new Error('Database error')
      );

      const response = await app.inject({
        method: 'POST',
        url: '/assets',
        payload: {
          name: 'Stock Portfolio',
          amount: 100000,
          category: 'STOCKS',
          growthRate: 7.0,
          scenarioId: '123',
        },
      });

      expect(response.statusCode).toBe(500);
      expect(JSON.parse(response.payload)).toEqual({
        error: 'Failed to create asset',
      });
    });
  });

  describe('GET /scenario/:scenarioId', () => {
    it('should get all assets for a scenario', async () => {
      const mockAssets = [
        {
          id: '1',
          name: 'Stock Portfolio',
          amount: 100000,
          category: 'STOCKS',
          growthRate: 7.0,
          scenarioId: '123',
          createdAt: '2025-05-27T12:49:44.295Z',
          updatedAt: '2025-05-27T12:49:44.295Z',
        },
      ];

      (prisma.asset.findMany as any).mockResolvedValue(
        mockAssets.map((asset) => ({
          ...asset,
          createdAt: new Date(asset.createdAt),
          updatedAt: new Date(asset.updatedAt),
        }))
      );

      const response = await app.inject({
        method: 'GET',
        url: '/assets/scenario/123',
      });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.payload)).toEqual(mockAssets);
      expect(prisma.asset.findMany).toHaveBeenCalledWith({
        where: { scenarioId: '123' },
      });
    });

    it('should handle errors when fetching assets', async () => {
      (prisma.asset.findMany as any).mockRejectedValue(
        new Error('Database error')
      );

      const response = await app.inject({
        method: 'GET',
        url: '/assets/scenario/123',
      });

      expect(response.statusCode).toBe(500);
      expect(JSON.parse(response.payload)).toEqual({
        error: 'Failed to fetch assets',
      });
    });
  });

  describe('PUT /:id', () => {
    it('should update an asset', async () => {
      const mockUpdatedAsset = {
        id: '1',
        name: 'Updated Stock Portfolio',
        amount: 150000,
        category: 'STOCKS',
        growthRate: 8.0,
        scenarioId: '123',
        createdAt: '2025-05-27T12:49:44.328Z',
        updatedAt: '2025-05-27T12:49:44.328Z',
      };

      (prisma.asset.update as any).mockResolvedValue({
        ...mockUpdatedAsset,
        createdAt: new Date(mockUpdatedAsset.createdAt),
        updatedAt: new Date(mockUpdatedAsset.updatedAt),
      });

      const response = await app.inject({
        method: 'PUT',
        url: '/assets/1',
        payload: {
          name: 'Updated Stock Portfolio',
          amount: 150000,
          growthRate: 8.0,
        },
      });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.payload)).toEqual(mockUpdatedAsset);
    });

    it('should handle errors when updating an asset', async () => {
      (prisma.asset.update as any).mockRejectedValue(
        new Error('Database error')
      );

      const response = await app.inject({
        method: 'PUT',
        url: '/assets/1',
        payload: {
          name: 'Updated Stock Portfolio',
        },
      });

      expect(response.statusCode).toBe(500);
      expect(JSON.parse(response.payload)).toEqual({
        error: 'Failed to update asset',
      });
    });
  });

  describe('DELETE /:id', () => {
    it('should delete an asset', async () => {
      (prisma.asset.delete as any).mockResolvedValue({});

      const response = await app.inject({
        method: 'DELETE',
        url: '/assets/1',
      });

      expect(response.statusCode).toBe(204);
      expect(prisma.asset.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should handle errors when deleting an asset', async () => {
      (prisma.asset.delete as any).mockRejectedValue(
        new Error('Database error')
      );

      const response = await app.inject({
        method: 'DELETE',
        url: '/assets/1',
      });

      expect(response.statusCode).toBe(500);
      expect(JSON.parse(response.payload)).toEqual({
        error: 'Failed to delete asset',
      });
    });
  });
});
