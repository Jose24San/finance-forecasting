export interface YearlyProjection {
  year: number;
  netWorth: number;
  totalIncome: number;
  totalExpenses: number;
  assets: AssetProjection[];
  milestones: Milestone[];
  savingsRate?: number;
}

export interface AssetProjection {
  id: string;
  name: string;
  amount: number;
  growthRate: number;
  category: string;
}

export interface Milestone {
  id: string;
  name: string;
  type: string;
  date: string;
  impact: number;
}

export interface ForecastResponse {
  timeline: YearlyProjection[];
  summary: {
    startingNetWorth: number;
    endingNetWorth: number;
    totalYears: number;
    totalIncomeProjected: number;
    averageAnnualGrowth: number;
  };
}

export interface ForecastSettings {
  inflationRate: number;
  stockGrowthRate: number;
  realEstateGrowth: number;
}
