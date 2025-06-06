'use client';

import { useState } from 'react';
import {
  useScenarioStore,
  Frequency,
  getAnnualIncome,
} from '../store/scenario';

export function IncomeStreamForm() {
  const { incomeStreams, addIncomeStream, removeIncomeStream } =
    useScenarioStore();
  const [showAddForm, setShowAddForm] = useState(false);

  // Form state for new income stream
  const [newIncomeStream, setNewIncomeStream] = useState({
    name: '',
    amount: 0,
    frequency: 'MONTHLY' as Frequency,
    startDate: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
    endDate: '',
    raiseRate: 0,
  });

  const frequencyOptions: {
    value: Frequency;
    label: string;
    description: string;
  }[] = [
    { value: 'MONTHLY', label: 'Monthly', description: 'Paid every month' },
    {
      value: 'QUARTERLY',
      label: 'Quarterly',
      description: 'Paid every 3 months',
    },
    { value: 'ANNUALLY', label: 'Annually', description: 'Paid once per year' },
  ];

  const handleAddIncomeStream = () => {
    if (newIncomeStream.name.trim() && newIncomeStream.amount > 0) {
      addIncomeStream({
        name: newIncomeStream.name.trim(),
        amount: newIncomeStream.amount,
        frequency: newIncomeStream.frequency,
        startDate: newIncomeStream.startDate,
        endDate: newIncomeStream.endDate || undefined,
        raiseRate:
          newIncomeStream.raiseRate > 0 ? newIncomeStream.raiseRate : undefined,
      });
      setNewIncomeStream({
        name: '',
        amount: 0,
        frequency: 'MONTHLY',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        raiseRate: 0,
      });
      setShowAddForm(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const totalAnnualIncome = incomeStreams.reduce(
    (sum, stream) => sum + getAnnualIncome(stream.amount, stream.frequency),
    0
  );

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Income Streams</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Track your salary, bonuses, and other income sources over time.
        </p>
      </div>

      {/* Income Summary */}
      {incomeStreams.length > 0 && (
        <div className="p-4 bg-muted rounded-md">
          <h4 className="text-sm font-medium mb-2">Annual Income Summary</h4>
          <p className="text-lg font-semibold text-green-600">
            {formatCurrency(totalAnnualIncome)}
          </p>
          <p className="text-xs text-muted-foreground">
            {incomeStreams.length} income stream
            {incomeStreams.length === 1 ? '' : 's'}
          </p>
        </div>
      )}

      {/* Existing Income Streams List */}
      {incomeStreams.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Your Income Streams</h4>
          {incomeStreams.map((stream) => (
            <div
              key={stream.id}
              className="p-3 border rounded-md bg-background"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{stream.name}</span>
                    <span className="text-xs px-2 py-1 bg-muted rounded-full">
                      {
                        frequencyOptions.find(
                          (freq) => freq.value === stream.frequency
                        )?.label
                      }
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>
                      {formatCurrency(stream.amount)} per{' '}
                      {stream.frequency.toLowerCase()}•{' '}
                      {formatCurrency(
                        getAnnualIncome(stream.amount, stream.frequency)
                      )}{' '}
                      annually
                    </p>
                    <p>
                      Starts: {formatDate(stream.startDate)}
                      {stream.endDate &&
                        ` • Ends: ${formatDate(stream.endDate)}`}
                    </p>
                    {stream.raiseRate && (
                      <p>Annual raise: {stream.raiseRate}%</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => removeIncomeStream(stream.id)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Income Stream Button */}
      {!showAddForm && (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full p-4 border-2 border-dashed border-border rounded-md text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors"
        >
          + Add Income Stream
        </button>
      )}

      {/* Add Income Stream Form */}
      {showAddForm && (
        <div className="p-4 border rounded-md bg-background space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Add New Income Stream</h4>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-muted-foreground hover:text-foreground text-sm"
            >
              Cancel
            </button>
          </div>

          {/* Income Name */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Income Name
            </label>
            <input
              type="text"
              value={newIncomeStream.name}
              onChange={(e) =>
                setNewIncomeStream({ ...newIncomeStream, name: e.target.value })
              }
              placeholder="e.g., Primary Salary, Freelance, Bonus"
              className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
          </div>

          {/* Amount and Frequency in a row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-2">Amount</label>
              <input
                type="number"
                min="0"
                step="100"
                value={newIncomeStream.amount || ''}
                onChange={(e) =>
                  setNewIncomeStream({
                    ...newIncomeStream,
                    amount: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="5000"
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Frequency
              </label>
              <select
                value={newIncomeStream.frequency}
                onChange={(e) =>
                  setNewIncomeStream({
                    ...newIncomeStream,
                    frequency: e.target.value as Frequency,
                  })
                }
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                {frequencyOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Annual equivalent display */}
          {newIncomeStream.amount > 0 && (
            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm text-muted-foreground">
                Annual equivalent:{' '}
                <span className="font-medium text-green-600">
                  {formatCurrency(
                    getAnnualIncome(
                      newIncomeStream.amount,
                      newIncomeStream.frequency
                    )
                  )}
                </span>
              </p>
            </div>
          )}

          {/* Start and End Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={newIncomeStream.startDate}
                onChange={(e) =>
                  setNewIncomeStream({
                    ...newIncomeStream,
                    startDate: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                End Date (Optional)
              </label>
              <input
                type="date"
                value={newIncomeStream.endDate}
                onChange={(e) =>
                  setNewIncomeStream({
                    ...newIncomeStream,
                    endDate: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Leave blank for ongoing income
              </p>
            </div>
          </div>

          {/* Annual Raise Rate */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Annual Raise (% Optional)
            </label>
            <input
              type="number"
              min="0"
              max="20"
              step="0.1"
              value={newIncomeStream.raiseRate || ''}
              onChange={(e) =>
                setNewIncomeStream({
                  ...newIncomeStream,
                  raiseRate: parseFloat(e.target.value) || 0,
                })
              }
              placeholder="3.0"
              className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Expected annual percentage increase
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleAddIncomeStream}
              disabled={
                !newIncomeStream.name.trim() || newIncomeStream.amount <= 0
              }
              className="flex-1 inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Income Stream
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="flex-1 inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {incomeStreams.length === 0 && !showAddForm && (
        <div className="text-center py-8">
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
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
              />
            </svg>
          </div>
          <h4 className="text-sm font-medium mb-2">
            No income streams added yet
          </h4>
          <p className="text-xs text-muted-foreground mb-4">
            Add your salary, bonuses, and other income sources to start
            planning.
          </p>
        </div>
      )}
    </div>
  );
}
