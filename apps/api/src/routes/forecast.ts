import { FastifyPluginAsync } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Enhanced types for better type safety
interface ForecastSettings {
  inflationRate: number;
  stockGrowthRate: number;
  realEstateGrowth: number;
}

interface YearlyProjection {
  year: number;
  netWorth: number;
  totalIncome: number;
  totalExpenses: number;
  assets: AssetProjection[];
  milestones: any[];
  savingsRate?: number;
}

interface AssetProjection {
  id: string;
  name: string;
  amount: number;
  growthRate: number;
  category: string;
}

const forecast: FastifyPluginAsync = async (fastify) => {
  // Generate forecast for draft scenario data (not saved to database)
  fastify.post('/draft', async (request, reply) => {
    try {
      const draftData = request.body as any;

      if (!draftData) {
        reply.status(400).send({ error: 'Draft scenario data is required' });
        return;
      }

      // Validate minimum required fields
      const {
        personalProfile,
        assets,
        incomeStreams,
        milestones = [],
        settings,
      } = draftData;

      if (
        !personalProfile?.location ||
        !assets ||
        assets.length === 0 ||
        !incomeStreams ||
        incomeStreams.length === 0
      ) {
        reply.status(400).send({
          error:
            'Missing required data: location, assets, and income streams are required',
        });
        return;
      }

      // Use provided settings or defaults
      const forecastSettings: ForecastSettings = settings || {
        inflationRate: 2.5,
        stockGrowthRate: 7.0,
        realEstateGrowth: 3.0,
      };

      // Create a scenario-like object for the forecast calculation
      const scenarioData = {
        assets: assets.map((asset: any) => ({
          id: asset.id || `draft-${Date.now()}-${Math.random()}`,
          name: asset.name,
          amount: asset.amount,
          category: asset.category,
          growthRate: asset.growthRate,
        })),
        incomeStreams: incomeStreams.map((stream: any) => ({
          id: stream.id || `draft-${Date.now()}-${Math.random()}`,
          name: stream.name,
          amount: stream.amount,
          frequency: stream.frequency,
          startDate: stream.startDate,
          endDate: stream.endDate,
          raiseRate: stream.raiseRate,
        })),
        milestones: milestones.map((milestone: any) => ({
          id: milestone.id || `draft-${Date.now()}-${Math.random()}`,
          name: milestone.name,
          type: milestone.type,
          date: milestone.date,
          impact: milestone.impact,
        })),
        settings: forecastSettings,
      };

      // Calculate forecast using the same logic as saved scenarios
      const forecast = calculateEnhancedForecast(
        scenarioData,
        forecastSettings
      );

      return forecast;
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ error: 'Failed to generate draft forecast' });
      return;
    }
  });

  // Generate forecast for a scenario
  fastify.post('/:scenarioId', async (request, reply) => {
    const { scenarioId } = request.params as { scenarioId: string };

    try {
      // Fetch all scenario data
      const scenario = await prisma.scenario.findUnique({
        where: { id: scenarioId },
        include: {
          assets: true,
          incomeStreams: true,
          milestones: true,
          settings: true,
          withdrawalOrder: true,
          user: true, // Include user for age calculation
        },
      });

      if (!scenario) {
        reply.status(404).send({ error: 'Scenario not found' });
        return;
      }

      // Get settings or use defaults
      const settings: ForecastSettings = scenario.settings || {
        inflationRate: 2.5,
        stockGrowthRate: 7.0,
        realEstateGrowth: 3.0,
      };

      // Calculate forecast with enhanced logic
      const forecast = calculateEnhancedForecast(scenario, settings);

      return forecast;
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ error: 'Failed to generate forecast' });
      return;
    }
  });
};

// Enhanced forecast calculation function
function calculateEnhancedForecast(scenario: any, settings: ForecastSettings) {
  const projectionYears = 30; // Default to 30 years
  const timeline: YearlyProjection[] = [];
  const currentYear = 2024; // Fixed starting year for consistent forecasts

  // Initialize assets with proper categorization
  let assets: AssetProjection[] = scenario.assets.map((asset: any) => ({
    id: asset.id,
    name: asset.name,
    amount: asset.amount,
    growthRate: getAssetGrowthRate(asset.category, asset.growthRate, settings),
    category: asset.category,
  }));

  for (let yearIndex = 0; yearIndex < projectionYears; yearIndex++) {
    const projectionYear = currentYear + yearIndex;

    // 1. Project income for this year
    const yearlyIncome = projectIncomeForYear(
      scenario.incomeStreams,
      projectionYear,
      yearIndex,
      settings.inflationRate
    );

    // 2. Apply asset growth for this year
    assets = applyAssetGrowth(assets, settings.inflationRate);

    // 3. Apply milestone impacts for this year
    const yearMilestones = getYearMilestones(
      scenario.milestones,
      projectionYear
    );
    const milestoneImpact = yearMilestones.reduce(
      (sum: number, milestone: any) => sum + milestone.impact,
      0
    );

    // 4. Apply milestone impact to assets (if positive add to first taxable, if negative reduce assets)
    if (milestoneImpact !== 0) {
      if (milestoneImpact > 0) {
        // Positive impact - add to first taxable account or create one
        const targetAsset =
          assets.find((a) => a.category === 'TAXABLE') || assets[0];
        if (targetAsset) {
          targetAsset.amount += milestoneImpact;
        }
      } else {
        // Negative impact - reduce assets (could be more sophisticated later)
        const targetAsset =
          assets.find((a) => a.category === 'TAXABLE') || assets[0];
        if (targetAsset) {
          targetAsset.amount += milestoneImpact; // milestoneImpact is already negative
        }
      }
    }

    const netWorth = assets.reduce((sum, asset) => sum + asset.amount, 0);

    // 5. Add savings to assets (simplified - add to first taxable account or create one)
    const savingsFromIncome = yearlyIncome * 0.2; // Assume 20% savings rate for now
    if (savingsFromIncome > 0 && assets.length > 0) {
      // Find first taxable account or use first available
      const savingsTarget =
        assets.find((a) => a.category === 'TAXABLE') || assets[0];
      savingsTarget.amount += savingsFromIncome;
    }

    // 6. Create yearly projection
    timeline.push({
      year: projectionYear,
      netWorth,
      totalIncome: yearlyIncome,
      totalExpenses: yearlyIncome - savingsFromIncome, // Simple expense calculation
      assets: [...assets], // Clone for immutability
      milestones: yearMilestones,
      savingsRate:
        yearlyIncome > 0 ? (savingsFromIncome / yearlyIncome) * 100 : 0,
    });
  }

  return {
    timeline,
    summary: {
      startingNetWorth: timeline[0]?.netWorth || 0,
      endingNetWorth: timeline[timeline.length - 1]?.netWorth || 0,
      totalYears: projectionYears,
      totalIncomeProjected: timeline.reduce(
        (sum, year) => sum + year.totalIncome,
        0
      ),
      averageAnnualGrowth: calculateCAGR(
        timeline[0]?.netWorth || 0,
        timeline[timeline.length - 1]?.netWorth || 0,
        projectionYears
      ),
    },
  };
}

// Helper function to project income for a specific year
function projectIncomeForYear(
  incomeStreams: any[],
  targetYear: number,
  yearIndex: number,
  inflationRate: number
): number {
  return incomeStreams.reduce((totalIncome, stream) => {
    const startDate = new Date(stream.startDate);
    const endDate = stream.endDate ? new Date(stream.endDate) : null;

    // Check if income stream is active in target year
    if (
      startDate.getFullYear() <= targetYear &&
      (!endDate || endDate.getFullYear() >= targetYear)
    ) {
      // Calculate base annual amount based on frequency
      let annualAmount = 0;
      switch (stream.frequency) {
        case 'MONTHLY':
          annualAmount = stream.amount * 12;
          break;
        case 'QUARTERLY':
          annualAmount = stream.amount * 4;
          break;
        case 'ANNUALLY':
          annualAmount = stream.amount;
          break;
        default:
          annualAmount = stream.amount * 12; // Default to monthly
      }

      // Apply raises over time if specified
      if (stream.raiseRate && yearIndex > 0) {
        const yearsWithRaises = yearIndex;
        annualAmount *= Math.pow(1 + stream.raiseRate / 100, yearsWithRaises);
      }

      // Apply inflation adjustment
      const inflationAdjustedAmount =
        annualAmount * Math.pow(1 + inflationRate / 100, yearIndex);

      return totalIncome + inflationAdjustedAmount;
    }

    return totalIncome;
  }, 0);
}

// Helper function to apply asset growth with category-specific rates
function applyAssetGrowth(
  assets: AssetProjection[],
  inflationRate: number
): AssetProjection[] {
  return assets.map((asset) => ({
    ...asset,
    amount: asset.amount * (1 + asset.growthRate / 100),
  }));
}

// Helper function to get appropriate growth rate for asset category
function getAssetGrowthRate(
  category: string,
  customGrowthRate: number | null,
  settings: ForecastSettings
): number {
  // If custom growth rate is specified, use it
  if (customGrowthRate !== null && customGrowthRate !== undefined) {
    return customGrowthRate;
  }

  // Use category defaults from settings
  switch (category) {
    case 'TAXABLE':
    case 'TAX_DEFERRED':
    case 'TAX_FREE':
      return settings.stockGrowthRate; // Default 7%
    case 'REAL_ESTATE':
      return settings.realEstateGrowth; // Default 3%
    case 'CRYPTO':
      return settings.stockGrowthRate; // Use stock rate for crypto (conservative)
    default:
      return settings.stockGrowthRate;
  }
}

// Helper function to get milestones for a specific year
function getYearMilestones(milestones: any[], targetYear: number): any[] {
  return milestones.filter((milestone) => {
    const milestoneYear = new Date(milestone.date).getUTCFullYear();
    return milestoneYear === targetYear;
  });
}

// Helper function to calculate compound annual growth rate
function calculateCAGR(
  startValue: number,
  endValue: number,
  years: number
): number {
  if (startValue <= 0 || years <= 0) return 0;
  return (Math.pow(endValue / startValue, 1 / years) - 1) * 100;
}

export default forecast;
