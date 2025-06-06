'use client';

import React, { useState, useMemo } from 'react';
import { YearlyProjection } from '@/types/forecast';

interface YearlyDataTableProps {
  data: YearlyProjection[];
  className?: string;
}

type SortField =
  | 'year'
  | 'netWorth'
  | 'totalIncome'
  | 'totalExpenses'
  | 'savingsRate';
type SortDirection = 'asc' | 'desc';

export function YearlyDataTable({
  data,
  className = '',
}: YearlyDataTableProps) {
  const [sortField, setSortField] = useState<SortField>('year');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [showOnlyMilestones, setShowOnlyMilestones] = useState(false);
  const [expandedYear, setExpandedYear] = useState<number | null>(null);

  // Filter and sort data
  const processedData = useMemo(() => {
    let filtered = data;

    // Filter to show only years with milestones if requested
    if (showOnlyMilestones) {
      filtered = data.filter(
        (item) => item.milestones && item.milestones.length > 0
      );
    }

    // Sort data
    return filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Handle undefined values
      if (aValue === undefined) aValue = 0;
      if (bValue === undefined) bValue = 0;

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [data, sortField, sortDirection, showOnlyMilestones]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return (
        <svg
          className="w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
          />
        </svg>
      );
    }

    return sortDirection === 'asc' ? (
      <svg
        className="w-4 h-4 text-blue-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 15l7-7 7 7"
        />
      </svg>
    ) : (
      <svg
        className="w-4 h-4 text-blue-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    );
  };

  const toggleExpanded = (year: number) => {
    setExpandedYear(expandedYear === year ? null : year);
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">Year-by-Year Breakdown</h3>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showOnlyMilestones}
                onChange={(e) => setShowOnlyMilestones(e.target.checked)}
                className="rounded"
              />
              Show only milestone years
            </label>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Detailed financial projections with asset breakdown
        </p>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-3 font-medium">
                  <button
                    onClick={() => handleSort('year')}
                    className="flex items-center gap-1 hover:text-blue-600"
                  >
                    Year
                    {getSortIcon('year')}
                  </button>
                </th>
                <th className="text-right p-3 font-medium">
                  <button
                    onClick={() => handleSort('netWorth')}
                    className="flex items-center gap-1 hover:text-blue-600 ml-auto"
                  >
                    Net Worth
                    {getSortIcon('netWorth')}
                  </button>
                </th>
                <th className="text-right p-3 font-medium">
                  <button
                    onClick={() => handleSort('totalIncome')}
                    className="flex items-center gap-1 hover:text-blue-600 ml-auto"
                  >
                    Income
                    {getSortIcon('totalIncome')}
                  </button>
                </th>
                <th className="text-right p-3 font-medium">
                  <button
                    onClick={() => handleSort('totalExpenses')}
                    className="flex items-center gap-1 hover:text-blue-600 ml-auto"
                  >
                    Expenses
                    {getSortIcon('totalExpenses')}
                  </button>
                </th>
                <th className="text-right p-3 font-medium">
                  <button
                    onClick={() => handleSort('savingsRate')}
                    className="flex items-center gap-1 hover:text-blue-600 ml-auto"
                  >
                    Savings Rate
                    {getSortIcon('savingsRate')}
                  </button>
                </th>
                <th className="text-center p-3 font-medium">Milestones</th>
                <th className="text-center p-3 font-medium">Details</th>
              </tr>
            </thead>
            <tbody>
              {processedData.map((yearData, index) => (
                <React.Fragment key={yearData.year}>
                  <tr
                    className={`border-t hover:bg-muted/50 ${
                      yearData.netWorth < 50000 ? 'bg-orange-50' : ''
                    }`}
                  >
                    <td className="p-3 font-medium">{yearData.year}</td>
                    <td
                      className={`p-3 text-right font-medium ${
                        yearData.netWorth < 0
                          ? 'text-red-600'
                          : 'text-green-600'
                      }`}
                    >
                      {formatCurrency(yearData.netWorth)}
                    </td>
                    <td className="p-3 text-right">
                      {formatCurrency(yearData.totalIncome)}
                    </td>
                    <td className="p-3 text-right">
                      {formatCurrency(yearData.totalExpenses)}
                    </td>
                    <td className="p-3 text-right">
                      {yearData.savingsRate
                        ? `${yearData.savingsRate.toFixed(1)}%`
                        : '-'}
                    </td>
                    <td className="p-3 text-center">
                      {yearData.milestones && yearData.milestones.length > 0 ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                          {yearData.milestones.length}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => toggleExpanded(yearData.year)}
                        className="text-blue-600 hover:text-blue-800 text-xs"
                      >
                        {expandedYear === yearData.year ? 'Hide' : 'Show'}
                      </button>
                    </td>
                  </tr>

                  {/* Expanded row showing asset breakdown and milestones */}
                  {expandedYear === yearData.year && (
                    <tr className="border-t bg-gray-50">
                      <td colSpan={7} className="p-4">
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          {/* Asset Breakdown */}
                          <div>
                            <h4 className="font-medium mb-2">
                              Asset Breakdown
                            </h4>
                            <div className="space-y-1">
                              {yearData.assets.map((asset) => (
                                <div
                                  key={asset.id}
                                  className="flex justify-between"
                                >
                                  <span className="text-muted-foreground">
                                    {asset.name} ({asset.category})
                                  </span>
                                  <span className="font-medium">
                                    {formatCurrency(asset.amount)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Milestones */}
                          <div>
                            <h4 className="font-medium mb-2">Milestones</h4>
                            {yearData.milestones &&
                            yearData.milestones.length > 0 ? (
                              <div className="space-y-1">
                                {yearData.milestones.map((milestone, idx) => (
                                  <div
                                    key={idx}
                                    className="flex justify-between"
                                  >
                                    <span className="text-muted-foreground">
                                      {milestone.name} ({milestone.type})
                                    </span>
                                    <span
                                      className={`font-medium ${
                                        milestone.impact > 0
                                          ? 'text-green-600'
                                          : 'text-red-600'
                                      }`}
                                    >
                                      {milestone.impact > 0 ? '+' : ''}
                                      {formatCurrency(milestone.impact)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-muted-foreground">
                                No milestones this year
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {processedData.length === 0 && showOnlyMilestones && (
        <div className="text-center py-8 text-muted-foreground">
          No years with milestones found.
        </div>
      )}
    </div>
  );
}
