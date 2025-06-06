'use client';

import { useState } from 'react';
import { useScenarioStore, MilestoneType } from '../store/scenario';

export function MilestoneForm() {
  const { milestones, addMilestone, removeMilestone } = useScenarioStore();
  const [showAddForm, setShowAddForm] = useState(false);

  // Form state for new milestone
  const [newMilestone, setNewMilestone] = useState({
    name: '',
    type: 'RETIREMENT' as MilestoneType,
    date: '',
    impact: 0,
  });

  const milestoneTypes: {
    value: MilestoneType;
    label: string;
    description: string;
  }[] = [
    {
      value: 'RETIREMENT',
      label: 'Retirement',
      description: 'End of working career',
    },
    {
      value: 'COLLEGE',
      label: 'College/Education',
      description: 'Tuition and education expenses',
    },
    {
      value: 'MAJOR_PURCHASE',
      label: 'Major Purchase',
      description: 'Home, car, or significant expense',
    },
    {
      value: 'INCOME_CHANGE',
      label: 'Income Change',
      description: 'Career change or promotion',
    },
    {
      value: 'DEATH_OF_SPOUSE',
      label: 'Death of Spouse',
      description: 'Loss of partner and income (Premium)',
    },
    {
      value: 'CUSTOM',
      label: 'Custom Event',
      description: 'Other life event',
    },
  ];

  const handleAddMilestone = () => {
    if (newMilestone.name.trim() && newMilestone.date) {
      addMilestone({
        name: newMilestone.name.trim(),
        type: newMilestone.type,
        date: newMilestone.date,
        impact: newMilestone.impact,
      });
      setNewMilestone({
        name: '',
        type: 'RETIREMENT',
        date: '',
        impact: 0,
      });
      setShowAddForm(false);
    }
  };

  const formatCurrency = (amount: number) => {
    const isNegative = amount < 0;
    const absAmount = Math.abs(amount);
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(absAmount);

    return isNegative ? `-${formatted}` : formatted;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getImpactColor = (impact: number) => {
    if (impact > 0) return 'text-green-600';
    if (impact < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const sortedMilestones = [...milestones].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Financial Milestones</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Plan for major life events that will impact your financial trajectory.
        </p>
      </div>

      {/* Milestones Summary */}
      {milestones.length > 0 && (
        <div className="p-4 bg-muted rounded-md">
          <h4 className="text-sm font-medium mb-2">Milestone Overview</h4>
          <p className="text-lg font-semibold">
            {milestones.length} milestone{milestones.length === 1 ? '' : 's'}{' '}
            planned
          </p>
          <p className="text-xs text-muted-foreground">
            Next:{' '}
            {sortedMilestones[0]
              ? `${sortedMilestones[0].name} (${formatDate(
                  sortedMilestones[0].date
                )})`
              : 'None'}
          </p>
        </div>
      )}

      {/* Existing Milestones List */}
      {sortedMilestones.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Your Milestones</h4>
          {sortedMilestones.map((milestone) => (
            <div
              key={milestone.id}
              className="flex items-center justify-between p-3 bg-muted rounded-md"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h5 className="font-medium">{milestone.name}</h5>
                  <span className="text-xs bg-background px-2 py-1 rounded">
                    {milestoneTypes.find((t) => t.value === milestone.type)
                      ?.label || milestone.type}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{formatDate(milestone.date)}</span>
                  {milestone.impact !== 0 && (
                    <span className={getImpactColor(milestone.impact)}>
                      {milestone.impact > 0 ? '+' : ''}
                      {formatCurrency(milestone.impact)}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => removeMilestone(milestone.id)}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add New Milestone */}
      {!showAddForm ? (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full p-3 border-2 border-dashed border-muted rounded-md text-muted-foreground hover:border-primary hover:text-primary transition-colors"
        >
          + Add Financial Milestone
        </button>
      ) : (
        <div className="p-4 border rounded-md space-y-4">
          <h4 className="font-medium">Add New Milestone</h4>

          {/* Milestone Name */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Milestone Name
            </label>
            <input
              type="text"
              value={newMilestone.name}
              onChange={(e) =>
                setNewMilestone({ ...newMilestone, name: e.target.value })
              }
              placeholder="e.g., Retirement, College Tuition, New Home"
              className="w-full p-2 border rounded-md"
            />
          </div>

          {/* Milestone Type */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Milestone Type
            </label>
            <select
              value={newMilestone.type}
              onChange={(e) =>
                setNewMilestone({
                  ...newMilestone,
                  type: e.target.value as MilestoneType,
                })
              }
              className="w-full p-2 border rounded-md"
            >
              {milestoneTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground mt-1">
              {
                milestoneTypes.find((t) => t.value === newMilestone.type)
                  ?.description
              }
            </p>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Target Date
            </label>
            <input
              type="date"
              value={newMilestone.date}
              onChange={(e) =>
                setNewMilestone({ ...newMilestone, date: e.target.value })
              }
              className="w-full p-2 border rounded-md"
            />
          </div>

          {/* Financial Impact */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Financial Impact
            </label>
            <input
              type="number"
              step="1000"
              value={newMilestone.impact || ''}
              onChange={(e) =>
                setNewMilestone({
                  ...newMilestone,
                  impact: parseFloat(e.target.value) || 0,
                })
              }
              placeholder="e.g., -50000 for expense, +100000 for windfall"
              className="w-full p-2 border rounded-md"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Negative for expenses, positive for income/windfalls. Leave as 0
              for informational milestones.
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleAddMilestone}
              disabled={!newMilestone.name.trim() || !newMilestone.date}
              className="flex-1 bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Milestone
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setNewMilestone({
                  name: '',
                  type: 'RETIREMENT',
                  date: '',
                  impact: 0,
                });
              }}
              className="px-4 py-2 border rounded-md hover:bg-muted"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Tips */}
      {milestones.length === 0 && (
        <div className="p-4 bg-blue-50 rounded-md border border-blue-200">
          <h4 className="text-sm font-medium text-blue-900 mb-2">
            💡 Planning Tips
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>
              • Start with major life events (retirement, kids&apos; college)
            </li>
            <li>• Include both expenses and income changes</li>
            <li>• Consider the timing of these events for better planning</li>
          </ul>
        </div>
      )}
    </div>
  );
}
