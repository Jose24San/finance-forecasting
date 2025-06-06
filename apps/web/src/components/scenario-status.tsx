'use client';

import { useScenarioStore } from '../store/scenario';
import { useAutoSave } from '../hooks/useAutoSave';

export function ScenarioStatus() {
  const {
    validationErrors,
    isFormValid,
    isDirty,
    lastSaved,
    scenarioName,
    personalProfile,
    assets,
    incomeStreams,
    milestones,
  } = useScenarioStore();

  // Enable auto-save for the entire scenario
  useAutoSave();

  const formatLastSaved = (date: Date | string | null) => {
    if (!date) return 'Never';

    // Handle both Date objects and date strings (from localStorage persistence)
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    // Check if the date is valid
    if (isNaN(dateObj.getTime())) return 'Never';

    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    return dateObj.toLocaleTimeString();
  };

  const getValidationErrorCount = () => {
    let count = 0;
    if (validationErrors.scenarioName) count += 1;
    if (validationErrors.personalProfile)
      count += Object.keys(validationErrors.personalProfile).length;
    if (validationErrors.assets)
      count += Object.keys(validationErrors.assets).length;
    if (validationErrors.incomeStreams)
      count += Object.keys(validationErrors.incomeStreams).length;
    if (validationErrors.milestones)
      count += Object.keys(validationErrors.milestones).length;
    return count;
  };

  const errorCount = getValidationErrorCount();
  const totalItems =
    assets.length + incomeStreams.length + milestones.length + 1; // +1 for profile
  const hasAnyData =
    scenarioName.trim().length > 0 ||
    personalProfile.age ||
    personalProfile.location ||
    assets.length ||
    incomeStreams.length ||
    milestones.length;

  return (
    <div className="bg-card border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Scenario Status</h3>
        <div className="flex items-center gap-3 text-sm">
          {/* Auto-save Status */}
          <div className="flex items-center gap-1">
            {isDirty ? (
              <>
                <div className="h-2 w-2 bg-orange-500 rounded-full animate-pulse"></div>
                <span className="text-orange-600">Saving...</span>
              </>
            ) : (
              <>
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span className="text-green-600">
                  Saved {formatLastSaved(lastSaved)}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {/* Validation Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Validation</span>
          <div className="flex items-center gap-2">
            {isFormValid ? (
              <>
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600">All valid</span>
              </>
            ) : (
              <>
                <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                <span className="text-sm text-red-600">
                  {errorCount} error{errorCount === 1 ? '' : 's'}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Data Completeness */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Data Completeness</span>
          <div className="flex items-center gap-2">
            <div className="text-sm text-muted-foreground">
              {hasAnyData ? `${totalItems} items` : 'No data yet'}
            </div>
          </div>
        </div>

        {/* Section Breakdown */}
        <div className="pt-2 border-t space-y-2">
          <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Name:</span>
              <span
                className={
                  scenarioName.trim().length > 0
                    ? 'text-green-600'
                    : 'text-orange-600'
                }
              >
                {scenarioName.trim().length > 0 ? 'Set' : 'Missing'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Profile:</span>
              <span
                className={
                  personalProfile.age && personalProfile.location
                    ? 'text-green-600'
                    : 'text-orange-600'
                }
              >
                {personalProfile.age && personalProfile.location
                  ? 'Complete'
                  : 'Incomplete'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Assets:</span>
              <span>
                {assets.length} item{assets.length === 1 ? '' : 's'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Income:</span>
              <span>
                {incomeStreams.length} stream
                {incomeStreams.length === 1 ? '' : 's'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Milestones:</span>
              <span>
                {milestones.length} event{milestones.length === 1 ? '' : 's'}
              </span>
            </div>
          </div>
        </div>

        {/* Validation Errors Details */}
        {errorCount > 0 && (
          <div className="pt-2 border-t">
            <div className="text-xs text-red-600 space-y-1">
              <div className="font-medium">Issues to fix:</div>
              {validationErrors.scenarioName && (
                <div>• Scenario Name: {validationErrors.scenarioName}</div>
              )}
              {validationErrors.personalProfile && (
                <div>
                  • Profile:{' '}
                  {Object.keys(validationErrors.personalProfile).length} error
                  {Object.keys(validationErrors.personalProfile).length === 1
                    ? ''
                    : 's'}
                  {/* Show detailed profile error messages */}
                  {Object.entries(validationErrors.personalProfile).map(
                    ([field, message]) => (
                      <div
                        key={field}
                        className="ml-4 mt-1 text-xs text-red-500"
                      >
                        ▸ {message}
                      </div>
                    )
                  )}
                </div>
              )}
              {validationErrors.assets &&
                Object.keys(validationErrors.assets).length > 0 && (
                  <div>
                    • Assets: {Object.keys(validationErrors.assets).length}{' '}
                    error
                    {Object.keys(validationErrors.assets).length === 1
                      ? ''
                      : 's'}
                  </div>
                )}
              {validationErrors.incomeStreams &&
                Object.keys(validationErrors.incomeStreams).length > 0 && (
                  <div>
                    • Income:{' '}
                    {Object.keys(validationErrors.incomeStreams).length} error
                    {Object.keys(validationErrors.incomeStreams).length === 1
                      ? ''
                      : 's'}
                  </div>
                )}
              {validationErrors.milestones &&
                Object.keys(validationErrors.milestones).length > 0 && (
                  <div>
                    • Milestones:{' '}
                    {Object.keys(validationErrors.milestones).length} error
                    {Object.keys(validationErrors.milestones).length === 1
                      ? ''
                      : 's'}
                    {/* Show detailed milestone error messages */}
                    {Object.entries(validationErrors.milestones).map(
                      ([milestoneId, milestoneErrors]) => (
                        <div key={milestoneId} className="ml-4 mt-1 text-xs">
                          {Object.entries(milestoneErrors).map(
                            ([field, message]) => (
                              <div key={field} className="text-red-500">
                                ▸ {message}
                              </div>
                            )
                          )}
                        </div>
                      )
                    )}
                  </div>
                )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
