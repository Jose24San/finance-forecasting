'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Dot,
} from 'recharts';
import { YearlyProjection, Milestone } from '@/types/forecast';

interface NetWorthTimelineChartProps {
  data: YearlyProjection[];
  className?: string;
}

// Custom dot component to highlight milestone years
const MilestoneDot = (props: any) => {
  const { cx, cy, payload } = props;

  // Check if this year has milestones
  if (payload.milestones && payload.milestones.length > 0) {
    return (
      <Dot
        cx={cx}
        cy={cy}
        r={6}
        fill="#ef4444"
        stroke="#dc2626"
        strokeWidth={2}
      />
    );
  }

  return null;
};

// Custom tooltip to show rich information
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as YearlyProjection;

    return (
      <div className="bg-background border rounded-lg p-4 shadow-lg">
        <p className="font-semibold text-lg mb-2">Year {label}</p>
        <div className="space-y-1 text-sm">
          <p>
            <span className="font-medium">Net Worth:</span>
            <span className="ml-2 text-green-600">
              ${data.netWorth.toLocaleString()}
            </span>
          </p>
          <p>
            <span className="font-medium">Income:</span>
            <span className="ml-2">${data.totalIncome.toLocaleString()}</span>
          </p>
          <p>
            <span className="font-medium">Expenses:</span>
            <span className="ml-2">${data.totalExpenses.toLocaleString()}</span>
          </p>
          {data.savingsRate && (
            <p>
              <span className="font-medium">Savings Rate:</span>
              <span className="ml-2">{data.savingsRate.toFixed(1)}%</span>
            </p>
          )}
        </div>

        {/* Show milestones if any */}
        {data.milestones && data.milestones.length > 0 && (
          <div className="mt-3 pt-2 border-t">
            <p className="font-medium text-sm mb-1">Milestones:</p>
            {data.milestones.map((milestone, index) => (
              <p key={index} className="text-xs text-muted-foreground">
                • {milestone.name}: {milestone.impact > 0 ? '+' : ''}$
                {milestone.impact.toLocaleString()}
              </p>
            ))}
          </div>
        )}
      </div>
    );
  }

  return null;
};

// Format currency for Y-axis
const formatCurrency = (value: number) => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value.toLocaleString()}`;
};

export function NetWorthTimelineChart({
  data,
  className = '',
}: NetWorthTimelineChartProps) {
  // Find risk years (negative or very low net worth)
  const riskYears = data.filter((d) => d.netWorth < 50000);

  return (
    <div className={`w-full ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-1">Net Worth Timeline</h3>
        <p className="text-sm text-muted-foreground">
          Your projected financial trajectory over the next {data.length} years
        </p>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-2 text-sm">
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5 bg-blue-500"></div>
            <span>Net Worth</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span>Milestones</span>
          </div>
          {riskYears.length > 0 && (
            <div className="flex items-center gap-1">
              <div className="w-3 h-0.5 bg-orange-500"></div>
              <span>Risk Years</span>
            </div>
          )}
        </div>
      </div>

      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />

            <XAxis dataKey="year" stroke="currentColor" className="text-xs" />

            <YAxis
              tickFormatter={formatCurrency}
              stroke="currentColor"
              className="text-xs"
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Reference line at $0 */}
            <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="5 5" />

            {/* Highlight risk years */}
            {riskYears.map((riskYear) => (
              <ReferenceLine
                key={riskYear.year}
                x={riskYear.year}
                stroke="#f97316"
                strokeDasharray="2 2"
                strokeOpacity={0.6}
              />
            ))}

            <Line
              type="monotone"
              dataKey="netWorth"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={<MilestoneDot />}
              activeDot={{ r: 4, fill: '#3b82f6' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Risk warning if applicable */}
      {riskYears.length > 0 && (
        <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-sm text-orange-800">
            ⚠️ <strong>Risk Alert:</strong> Your scenario shows{' '}
            {riskYears.length} years with net worth below $50,000. Consider
            adjusting your savings rate or milestone timing.
          </p>
        </div>
      )}
    </div>
  );
}
