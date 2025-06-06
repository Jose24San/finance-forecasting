'use client';

import { useState } from 'react';
import {
  useScenarioStore,
  AssetType,
  getDefaultGrowthRate,
} from '../store/scenario';

export function AssetManagementForm() {
  const { assets, addAsset, removeAsset, updateAsset } = useScenarioStore();
  const [showAddForm, setShowAddForm] = useState(false);

  // Form state for new asset
  const [newAsset, setNewAsset] = useState({
    name: '',
    amount: 0,
    category: 'TAXABLE' as AssetType,
    growthRate: 7.0,
  });

  const assetCategories: {
    value: AssetType;
    label: string;
    description: string;
  }[] = [
    {
      value: 'TAXABLE',
      label: 'Taxable Investments',
      description: 'Stocks, bonds, mutual funds',
    },
    {
      value: 'TAX_DEFERRED',
      label: 'Tax-Deferred',
      description: '401k, traditional IRA',
    },
    { value: 'TAX_FREE', label: 'Tax-Free', description: 'Roth IRA, HSA' },
    {
      value: 'REAL_ESTATE',
      label: 'Real Estate',
      description: 'Primary home, rental property',
    },
    {
      value: 'CRYPTO',
      label: 'Cryptocurrency',
      description: 'Bitcoin, Ethereum, etc.',
    },
  ];

  const handleCategoryChange = (category: AssetType) => {
    const defaultGrowthRate = getDefaultGrowthRate(category);
    setNewAsset({ ...newAsset, category, growthRate: defaultGrowthRate });
  };

  const handleAddAsset = () => {
    if (newAsset.name.trim() && newAsset.amount > 0) {
      addAsset({
        name: newAsset.name.trim(),
        amount: newAsset.amount,
        category: newAsset.category,
        growthRate: newAsset.growthRate,
      });
      setNewAsset({
        name: '',
        amount: 0,
        category: 'TAXABLE',
        growthRate: 7.0,
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

  const totalAssets = assets.reduce((sum, asset) => sum + asset.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Assets</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Add your investments, savings, and property to model your financial
          growth.
        </p>
      </div>

      {/* Assets Summary */}
      {assets.length > 0 && (
        <div className="p-4 bg-muted rounded-md">
          <h4 className="text-sm font-medium mb-2">Portfolio Summary</h4>
          <p className="text-lg font-semibold text-green-600">
            {formatCurrency(totalAssets)}
          </p>
          <p className="text-xs text-muted-foreground">
            {assets.length} asset{assets.length === 1 ? '' : 's'}
          </p>
        </div>
      )}

      {/* Existing Assets List */}
      {assets.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Your Assets</h4>
          {assets.map((asset) => (
            <div key={asset.id} className="p-3 border rounded-md bg-background">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{asset.name}</span>
                    <span className="text-xs px-2 py-1 bg-muted rounded-full">
                      {
                        assetCategories.find(
                          (cat) => cat.value === asset.category
                        )?.label
                      }
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatCurrency(asset.amount)} • {asset.growthRate}% growth
                  </div>
                </div>
                <button
                  onClick={() => removeAsset(asset.id)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Asset Button */}
      {!showAddForm && (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full p-4 border-2 border-dashed border-border rounded-md text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors"
        >
          + Add Asset
        </button>
      )}

      {/* Add Asset Form */}
      {showAddForm && (
        <div className="p-4 border rounded-md bg-background space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Add New Asset</h4>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-muted-foreground hover:text-foreground text-sm"
            >
              Cancel
            </button>
          </div>

          {/* Asset Name */}
          <div>
            <label className="block text-sm font-medium mb-2">Asset Name</label>
            <input
              type="text"
              value={newAsset.name}
              onChange={(e) =>
                setNewAsset({ ...newAsset, name: e.target.value })
              }
              placeholder="e.g., Emergency Fund, 401k, House"
              className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
          </div>

          {/* Current Value */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Current Value
            </label>
            <input
              type="number"
              min="0"
              step="100"
              value={newAsset.amount || ''}
              onChange={(e) =>
                setNewAsset({
                  ...newAsset,
                  amount: parseFloat(e.target.value) || 0,
                })
              }
              placeholder="50000"
              className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
          </div>

          {/* Asset Category */}
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              value={newAsset.category}
              onChange={(e) =>
                handleCategoryChange(e.target.value as AssetType)
              }
              className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              {assetCategories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground mt-1">
              {
                assetCategories.find((cat) => cat.value === newAsset.category)
                  ?.description
              }
            </p>
          </div>

          {/* Growth Rate */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Expected Annual Growth (%)
            </label>
            <input
              type="number"
              min="0"
              max="30"
              step="0.1"
              value={newAsset.growthRate}
              onChange={(e) =>
                setNewAsset({
                  ...newAsset,
                  growthRate: parseFloat(e.target.value) || 0,
                })
              }
              className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Default rates: Stocks 7%, Real Estate 3%, Crypto 10%
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleAddAsset}
              disabled={!newAsset.name.trim() || newAsset.amount <= 0}
              className="flex-1 inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Asset
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
      {assets.length === 0 && !showAddForm && (
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
          <h4 className="text-sm font-medium mb-2">No assets added yet</h4>
          <p className="text-xs text-muted-foreground mb-4">
            Add your investments, savings, and property to start forecasting.
          </p>
        </div>
      )}
    </div>
  );
}
