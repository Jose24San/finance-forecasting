'use client';

import React, { useState } from 'react';
import { useScenarioStore } from '@/store/scenario';
import { useAuthStore } from '@/store/auth';

export function SaveScenarioButton() {
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [tempName, setTempName] = useState('');
  const [tempDescription, setTempDescription] = useState('');

  const {
    scenarioId,
    scenarioName,
    scenarioDescription,
    isSaving,
    saveError,
    canSave,
    saveScenario,
    updateScenarioInfo,
    isDirty,
    lastSaved,
  } = useScenarioStore();

  const { user } = useAuthStore();

  // Check if user needs to name the scenario
  const needsName = !scenarioName.trim() && canSave();

  const handleSaveClick = async () => {
    if (!user) {
      // TODO: Show login modal or redirect to login
      return;
    }

    if (needsName) {
      setTempName(scenarioName);
      setTempDescription(scenarioDescription);
      setShowNameDialog(true);
      return;
    }

    await saveScenario();
  };

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tempName.trim()) {
      return;
    }

    updateScenarioInfo(tempName.trim(), tempDescription.trim());
    setShowNameDialog(false);

    // Save immediately after naming
    await saveScenario();
  };

  const getSaveButtonText = () => {
    if (isSaving) return 'Saving...';
    if (scenarioId && isDirty) return 'Save Changes';
    if (scenarioId && !isDirty) return 'Saved';
    return 'Save Scenario';
  };

  const getSaveButtonIcon = () => {
    if (isSaving) {
      return (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
      );
    }

    if (scenarioId && !isDirty) {
      return (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      );
    }

    return (
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
        />
      </svg>
    );
  };

  if (!user) {
    return (
      <div className="text-sm text-muted-foreground">
        <a href="/login" className="text-blue-600 hover:text-blue-700">
          Sign in
        </a>{' '}
        to save scenarios
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col items-end gap-2">
        <button
          onClick={handleSaveClick}
          disabled={!canSave() || (isSaving && !showNameDialog)}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            canSave() && !isSaving
              ? 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
              : scenarioId && !isDirty
              ? 'bg-green-600 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {getSaveButtonIcon()}
          {getSaveButtonText()}
        </button>

        {/* Status info */}
        <div className="text-xs text-muted-foreground text-right">
          {saveError && <div className="text-red-600 mb-1">{saveError}</div>}
          {lastSaved && !isDirty && (
            <div>
              Last saved:{' '}
              {typeof lastSaved === 'string'
                ? new Date(lastSaved).toLocaleTimeString()
                : lastSaved.toLocaleTimeString()}
            </div>
          )}
          {!canSave() && !saveError && <div>Add assets & income to save</div>}
        </div>
      </div>

      {/* Name Dialog */}
      {showNameDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Name Your Scenario</h3>

            <form onSubmit={handleNameSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="scenario-name"
                  className="block text-sm font-medium mb-1"
                >
                  Scenario Name *
                </label>
                <input
                  id="scenario-name"
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  placeholder="e.g., Retirement Plan 2024"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  autoFocus
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="scenario-description"
                  className="block text-sm font-medium mb-1"
                >
                  Description (optional)
                </label>
                <textarea
                  id="scenario-description"
                  value={tempDescription}
                  onChange={(e) => setTempDescription(e.target.value)}
                  placeholder="Brief description of this scenario..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNameDialog(false)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!tempName.trim() || isSaving}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Saving...' : 'Save Scenario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
