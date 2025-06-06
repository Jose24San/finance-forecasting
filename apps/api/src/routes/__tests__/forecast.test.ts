import fastify from 'fastify';
import { build } from '../../app/app';
import { PrismaClient } from '@prisma/client';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Mock PrismaClient
vi.mock('@prisma/client', () => {
  const mockPrisma = {
    scenario: {
      findUnique: vi.fn(),
    },
  };
  return {
    PrismaClient: vi.fn(() => mockPrisma),
  };
});

describe('Forecast API', () => {
  let app: ReturnType<typeof fastify>;
  let prisma: PrismaClient;

  beforeEach(async () => {
    app = await build();
    prisma = new PrismaClient();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /forecast/:scenarioId', () => {
    it('should generate comprehensive forecast with all components', async () => {
      const mockScenario = {
        id: 'test-scenario-id',
        name: 'Test Forecast Scenario',
        description: 'Complete scenario for testing forecasting engine',
        userId: 'test-user-id',
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
          age: 30,
        },
        assets: [
          {
            id: 'asset-1',
            name: 'Stock Portfolio',
            amount: 100000,
            category: 'TAXABLE',
            growthRate: 7.0,
          },
          {
            id: 'asset-2',
            name: 'Primary Residence',
            amount: 300000,
            category: 'REAL_ESTATE',
            growthRate: 3.0,
          },
          {
            id: 'asset-3',
            name: '401k',
            amount: 50000,
            category: 'TAX_DEFERRED',
            growthRate: null, // Should use default
          },
        ],
        incomeStreams: [
          {
            id: 'income-1',
            name: 'Primary Salary',
            amount: 8000, // $8k/month = $96k/year
            frequency: 'MONTHLY',
            startDate: new Date('2024-01-01'),
            endDate: null,
            raiseRate: 3.0, // 3% annual raises
          },
          {
            id: 'income-2',
            name: 'Consulting Income',
            amount: 5000, // $5k/quarter = $20k/year
            frequency: 'QUARTERLY',
            startDate: new Date('2024-01-01'),
            endDate: new Date('2027-12-31'), // 4 years only
            raiseRate: null,
          },
        ],
        milestones: [
          {
            id: 'milestone-1',
            name: 'New Car Purchase',
            type: 'MAJOR_PURCHASE',
            date: new Date('2026-06-01'),
            impact: -30000, // $30k expense
          },
          {
            id: 'milestone-2',
            name: 'Inheritance',
            type: 'CUSTOM',
            date: new Date('2028-01-01'),
            impact: 75000, // $75k windfall
          },
        ],
        settings: {
          id: 'settings-1',
          inflationRate: 2.5,
          stockGrowthRate: 7.0,
          realEstateGrowth: 3.0,
        },
        withdrawalOrder: null,
      };

      (prisma.scenario.findUnique as any).mockResolvedValue(mockScenario);

      const response = await app.inject({
        method: 'POST',
        url: '/forecast/test-scenario-id',
      });

      expect(response.statusCode).toBe(200);
      const forecast = JSON.parse(response.payload);

      // Should have timeline and summary
      expect(forecast).toHaveProperty('timeline');
      expect(forecast).toHaveProperty('summary');
      expect(forecast.timeline).toHaveLength(30); // 30 years

      // First year validation
      const firstYear = forecast.timeline[0];
      expect(firstYear).toHaveProperty('year');
      expect(firstYear).toHaveProperty('netWorth');
      expect(firstYear).toHaveProperty('totalIncome');
      expect(firstYear).toHaveProperty('totalExpenses');
      expect(firstYear).toHaveProperty('assets');
      expect(firstYear).toHaveProperty('milestones');
      expect(firstYear).toHaveProperty('savingsRate');

      // Assets should have proper structure
      expect(firstYear.assets).toHaveLength(3);
      firstYear.assets.forEach((asset: any) => {
        expect(asset).toHaveProperty('id');
        expect(asset).toHaveProperty('name');
        expect(asset).toHaveProperty('amount');
        expect(asset).toHaveProperty('growthRate');
        expect(asset).toHaveProperty('category');
      });

      expect(prisma.scenario.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-scenario-id' },
        include: {
          assets: true,
          incomeStreams: true,
          milestones: true,
          settings: true,
          withdrawalOrder: true,
          user: true,
        },
      });
    });

    it('should correctly calculate income with frequency and raises', async () => {
      const mockScenario = {
        id: 'test-scenario-id',
        name: 'Income Test Scenario',
        userId: 'test-user-id',
        user: { id: 'test-user-id', email: 'test@example.com', age: 30 },
        assets: [
          {
            id: 'asset-1',
            name: 'Investment Account',
            amount: 50000,
            category: 'TAXABLE',
            growthRate: 7.0,
          },
        ],
        incomeStreams: [
          {
            id: 'income-1',
            name: 'Salary',
            amount: 8000, // $8k/month = $96k/year
            frequency: 'MONTHLY',
            startDate: new Date('2024-01-01'),
            endDate: null,
            raiseRate: 3.0, // 3% annual raises
          },
          {
            id: 'income-2',
            name: 'Consulting',
            amount: 5000, // $5k/quarter = $20k/year
            frequency: 'QUARTERLY',
            startDate: new Date('2024-01-01'),
            endDate: new Date('2027-12-31'), // 4 years only
            raiseRate: null,
          },
        ],
        milestones: [],
        settings: {
          inflationRate: 2.5,
          stockGrowthRate: 7.0,
          realEstateGrowth: 3.0,
        },
        withdrawalOrder: null,
      };

      (prisma.scenario.findUnique as any).mockResolvedValue(mockScenario);

      const response = await app.inject({
        method: 'POST',
        url: '/forecast/test-scenario-id',
      });

      const forecast = JSON.parse(response.payload);

      // Year 1: $96k salary + $20k consulting = $116k base
      const year1 = forecast.timeline[0];
      expect(year1.totalIncome).toBeCloseTo(116000, -2000); // Within $2000

      // Year 2: Should have 3% raise on salary + inflation adjustment
      const year2 = forecast.timeline[1];
      expect(year2.totalIncome).toBeGreaterThan(year1.totalIncome);

      // Year 5 (2028): Consulting should have ended in 2027
      const year5 = forecast.timeline[4];
      expect(year5.totalIncome).toBeLessThan(year2.totalIncome); // No more consulting
    });

    it('should apply category-specific asset growth rates', async () => {
      const mockScenario = {
        id: 'test-scenario-id',
        name: 'Asset Growth Test',
        userId: 'test-user-id',
        user: { id: 'test-user-id', email: 'test@example.com', age: 30 },
        assets: [
          {
            id: 'asset-1',
            name: 'Stock Portfolio',
            amount: 100000,
            category: 'TAXABLE',
            growthRate: 7.0,
          },
          {
            id: 'asset-2',
            name: 'Real Estate',
            amount: 300000,
            category: 'REAL_ESTATE',
            growthRate: 3.0,
          },
        ],
        incomeStreams: [],
        milestones: [],
        settings: {
          inflationRate: 2.5,
          stockGrowthRate: 7.0,
          realEstateGrowth: 3.0,
        },
        withdrawalOrder: null,
      };

      (prisma.scenario.findUnique as any).mockResolvedValue(mockScenario);

      const response = await app.inject({
        method: 'POST',
        url: '/forecast/test-scenario-id',
      });

      const forecast = JSON.parse(response.payload);

      const year1 = forecast.timeline[0];
      const year2 = forecast.timeline[1];

      // Find assets by category
      const stockAsset1 = year1.assets.find(
        (a: any) => a.category === 'TAXABLE'
      );
      const stockAsset2 = year2.assets.find(
        (a: any) => a.category === 'TAXABLE'
      );
      const realEstateAsset1 = year1.assets.find(
        (a: any) => a.category === 'REAL_ESTATE'
      );
      const realEstateAsset2 = year2.assets.find(
        (a: any) => a.category === 'REAL_ESTATE'
      );

      // Stock should grow at ~7%
      const stockGrowth =
        (stockAsset2.amount - stockAsset1.amount) / stockAsset1.amount;
      expect(stockGrowth).toBeCloseTo(0.07, 2);

      // Real estate should grow at ~3%
      const realEstateGrowth =
        (realEstateAsset2.amount - realEstateAsset1.amount) /
        realEstateAsset1.amount;
      expect(realEstateGrowth).toBeCloseTo(0.03, 2);
    });

    it('should apply milestone impacts in correct years', async () => {
      const mockScenario = {
        id: 'test-scenario-id',
        name: 'Milestone Test',
        userId: 'test-user-id',
        user: { id: 'test-user-id', email: 'test@example.com', age: 30 },
        assets: [
          {
            id: 'asset-1',
            name: 'Savings',
            amount: 50000,
            category: 'TAXABLE',
            growthRate: 7.0,
          },
        ],
        incomeStreams: [],
        milestones: [
          {
            id: 'milestone-1',
            name: 'Car Purchase',
            type: 'MAJOR_PURCHASE',
            date: new Date('2026-06-01'),
            impact: -30000,
          },
          {
            id: 'milestone-2',
            name: 'Inheritance',
            type: 'CUSTOM',
            date: new Date('2028-01-01'),
            impact: 75000,
          },
        ],
        settings: {
          inflationRate: 2.5,
          stockGrowthRate: 7.0,
          realEstateGrowth: 3.0,
        },
        withdrawalOrder: null,
      };

      (prisma.scenario.findUnique as any).mockResolvedValue(mockScenario);

      const response = await app.inject({
        method: 'POST',
        url: '/forecast/test-scenario-id',
      });

      const forecast = JSON.parse(response.payload);

      // Find 2026 (car purchase year) and 2028 (inheritance year)
      const purchaseYear = forecast.timeline.find((y: any) => y.year === 2026);
      const inheritanceYear = forecast.timeline.find(
        (y: any) => y.year === 2028
      );

      expect(purchaseYear.milestones).toHaveLength(1);
      expect(purchaseYear.milestones[0].impact).toBe(-30000);

      expect(inheritanceYear.milestones).toHaveLength(1);
      expect(inheritanceYear.milestones[0].impact).toBe(75000);
    });

    it('should handle missing scenario gracefully', async () => {
      (prisma.scenario.findUnique as any).mockResolvedValue(null);

      const response = await app.inject({
        method: 'POST',
        url: '/forecast/non-existent-id',
      });

      expect(response.statusCode).toBe(404);
      const error = JSON.parse(response.payload);
      expect(error).toEqual({ error: 'Scenario not found' });
    });

    it('should use default settings when none provided', async () => {
      const mockScenario = {
        id: 'test-scenario-id',
        name: 'No Settings Test',
        userId: 'test-user-id',
        user: { id: 'test-user-id', email: 'test@example.com', age: 30 },
        assets: [
          {
            id: 'asset-1',
            name: 'Test Asset',
            amount: 10000,
            category: 'TAXABLE',
            growthRate: null, // Should use default
          },
        ],
        incomeStreams: [],
        milestones: [],
        settings: null, // No settings provided
        withdrawalOrder: null,
      };

      (prisma.scenario.findUnique as any).mockResolvedValue(mockScenario);

      const response = await app.inject({
        method: 'POST',
        url: '/forecast/test-scenario-id',
      });

      expect(response.statusCode).toBe(200);
      const forecast = JSON.parse(response.payload);

      // Should use default 7% growth for taxable assets
      const year1 = forecast.timeline[0];
      const year2 = forecast.timeline[1];
      const asset1 = year1.assets[0];
      const asset2 = year2.assets[0];

      const growthRate = (asset2.amount - asset1.amount) / asset1.amount;
      expect(growthRate).toBeCloseTo(0.07, 2);
    });
  });
});
