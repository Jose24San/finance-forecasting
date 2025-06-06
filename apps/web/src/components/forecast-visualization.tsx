'use client';

import React, { useState, useEffect } from 'react';
import { NetWorthTimelineChart } from './net-worth-timeline-chart';
import { YearlyDataTable } from './yearly-data-table';
import { ForecastResponse } from '@/types/forecast';
import { useScenarioStore } from '@/store/scenario';

interface ForecastVisualizationProps {
  scenarioId?: string;
  className?: string;
}

export function ForecastVisualization({
  scenarioId,
  className = '',
}: ForecastVisualizationProps) {
  const [forecastData, setForecastData] = useState<ForecastResponse | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'chart' | 'table'>('chart');

  // Get current scenario data from store for draft scenarios
  const {
    scenarioId: storeScenarioId,
    scenarioName,
    personalProfile,
    assets,
    incomeStreams,
    milestones,
    canSave,
  } = useScenarioStore();

  // Generate forecast from draft data in the store
  const generateDraftForecast = async () => {
    setLoading(true);
    setError(null);

    try {
      const draftData = {
        personalProfile,
        assets,
        incomeStreams,
        milestones,
        settings: {
          inflationRate: 2.5,
          stockGrowthRate: 7.0,
          realEstateGrowth: 3.0,
        },
      };

      console.log('🚀 Sending draft data:', {
        personalProfile,
        assetsCount: assets.length,
        incomeStreamsCount: incomeStreams.length,
        milestonesCount: milestones.length,
        assets,
        incomeStreams,
      });

      // Call the forecast API with draft data
      const response = await fetch('/api/forecast/draft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(draftData),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate forecast: ${response.statusText}`);
      }

      const data = await response.json();
      setForecastData(data);
    } catch (err) {
      console.error('Error generating draft forecast:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to generate forecast'
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch forecast data
  const fetchForecast = async () => {
    console.log('🔄 Fetching forecast...', { scenarioId, storeScenarioId });
    const targetScenarioId = scenarioId || storeScenarioId;

    // For draft scenarios, check if we have minimum data
    if (scenarioId === 'draft' || !targetScenarioId) {
      console.log('📝 Draft scenario detected, checking data completeness...', {
        assets: assets.length,
        incomeStreams: incomeStreams.length,
        location: personalProfile.location,
      });

      // Check for minimum required data BEFORE making any API calls
      const hasAssets = assets.length > 0;
      const hasIncomeStreams = incomeStreams.length > 0;
      const hasBasicInfo = personalProfile.location.trim().length > 0;

      if (!hasAssets || !hasIncomeStreams || !hasBasicInfo) {
        console.log('❌ Missing required data, not calling API:', {
          hasAssets,
          hasIncomeStreams,
          hasBasicInfo,
        });

        // Clear loading state and forecast data
        setLoading(false);
        setForecastData(null);

        // Set specific error message based on what's missing
        if (!hasAssets && !hasIncomeStreams) {
          setError('Add assets and income streams to generate forecast');
        } else if (!hasAssets) {
          setError('Add at least one asset to generate forecast');
        } else if (!hasIncomeStreams) {
          setError('Add at least one income stream to generate forecast');
        } else if (!hasBasicInfo) {
          setError(
            'Add your location in the personal profile to generate forecast'
          );
        }
        return;
      }

      // Clear any existing errors since we have complete data
      setError(null);

      // Generate forecast from draft data
      console.log('🎯 Generating forecast from draft data');
      await generateDraftForecast();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/forecast/${targetScenarioId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch forecast: ${response.statusText}`);
      }

      const data = await response.json();
      setForecastData(data);
    } catch (err) {
      console.error('Error fetching forecast:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch forecast');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast();
  }, [scenarioId, storeScenarioId, assets, incomeStreams, milestones]);

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="border rounded-lg p-8">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-muted-foreground">
                Generating forecast...
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className}`}>
        <div className="border rounded-lg p-8">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">
              Failed to Generate Forecast
            </h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <button
              onClick={fetchForecast}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!forecastData) {
    return (
      <div className={`${className}`}>
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-muted flex items-center justify-center">
            <svg
              className="h-6 w-6 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-2">No Forecast Available</h3>
          <p className="text-muted-foreground mb-4">
            Add some assets, income streams, and milestones to generate a
            forecast.
          </p>
        </div>
      </div>
    );
  }

  const { timeline, summary } = forecastData;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 border rounded-lg">
          <div className="text-sm text-muted-foreground">
            Starting Net Worth
          </div>
          <div className="text-xl font-semibold text-green-600">
            ${summary.startingNetWorth.toLocaleString()}
          </div>
        </div>
        <div className="p-4 border rounded-lg">
          <div className="text-sm text-muted-foreground">Ending Net Worth</div>
          <div className="text-xl font-semibold text-green-600">
            ${summary.endingNetWorth.toLocaleString()}
          </div>
        </div>
        <div className="p-4 border rounded-lg">
          <div className="text-sm text-muted-foreground">
            Total Income Projected
          </div>
          <div className="text-xl font-semibold">
            ${summary.totalIncomeProjected.toLocaleString()}
          </div>
        </div>
        <div className="p-4 border rounded-lg">
          <div className="text-sm text-muted-foreground">
            Average Annual Growth
          </div>
          <div className="text-xl font-semibold">
            {summary.averageAnnualGrowth.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('chart')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'chart'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-muted-foreground hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Timeline Chart
          </button>
          <button
            onClick={() => setActiveTab('table')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'table'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-muted-foreground hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Year-by-Year Table
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="min-h-96">
        {activeTab === 'chart' ? (
          <NetWorthTimelineChart data={timeline} />
        ) : (
          <YearlyDataTable data={timeline} />
        )}
      </div>

      {/* Refresh Button */}
      <div className="flex justify-center">
        <button
          onClick={fetchForecast}
          disabled={loading}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
              Refreshing...
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh Forecast
            </>
          )}
        </button>
      </div>
    </div>
  );
}
