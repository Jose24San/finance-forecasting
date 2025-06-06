'use client';

import { useScenarioStore } from '../store/scenario';
import { FormField, FormInput, FormSelect } from './form-field';
import { useAutoSave } from '../hooks/useAutoSave';

export function PersonalProfileForm() {
  const {
    personalProfile,
    updatePersonalProfile,
    validationErrors,
    isDirty,
    lastSaved,
  } = useScenarioStore();

  // Enable auto-save
  useAutoSave();

  const profileErrors = validationErrors.personalProfile || {};

  const formatLastSaved = (date: Date | null) => {
    if (!date) return 'Never saved';
    return `Saved ${date.toLocaleTimeString()}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold mb-2">Personal Profile</h3>
          <p className="text-sm text-muted-foreground">
            Tell us about yourself to personalize your financial forecast.
          </p>
        </div>
        <div className="text-xs text-muted-foreground">
          {isDirty ? (
            <span className="text-orange-600">●︎ Saving...</span>
          ) : (
            <span className="text-green-600">
              ●︎ {formatLastSaved(lastSaved)}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {/* Age */}
        <FormField label="Age" error={profileErrors.age} required>
          <FormInput
            type="number"
            value={personalProfile.age || ''}
            onChange={(e) =>
              updatePersonalProfile({
                age: e.target.value ? parseInt(e.target.value) : null,
              })
            }
            placeholder="e.g., 30"
            min={16}
            max={100}
            error={profileErrors.age}
          />
        </FormField>

        {/* Location */}
        <FormField label="Location" error={profileErrors.location} required>
          <FormInput
            type="text"
            value={personalProfile.location}
            onChange={(e) =>
              updatePersonalProfile({ location: e.target.value })
            }
            placeholder="e.g., San Francisco, CA"
            error={profileErrors.location}
          />
        </FormField>

        {/* Dependents */}
        <FormField
          label="Number of Dependents"
          error={profileErrors.dependents}
        >
          <FormSelect
            value={personalProfile.dependents}
            onChange={(e) =>
              updatePersonalProfile({
                dependents: parseInt(e.target.value),
              })
            }
            error={profileErrors.dependents}
          >
            {Array.from({ length: 21 }, (_, i) => (
              <option key={i} value={i}>
                {i === 0
                  ? 'No dependents'
                  : `${i} dependent${i === 1 ? '' : 's'}`}
              </option>
            ))}
          </FormSelect>
        </FormField>

        {/* Profile Summary */}
        {personalProfile.age && personalProfile.location && (
          <div className="p-4 bg-muted rounded-md">
            <h4 className="text-sm font-medium mb-2">Profile Summary</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>
                <strong>Age:</strong> {personalProfile.age} years old
              </p>
              <p>
                <strong>Location:</strong> {personalProfile.location}
              </p>
              <p>
                <strong>Dependents:</strong>{' '}
                {personalProfile.dependents === 0
                  ? 'None'
                  : `${personalProfile.dependents} dependent${
                      personalProfile.dependents === 1 ? '' : 's'
                    }`}
              </p>
            </div>
          </div>
        )}

        {/* Tips for first-time users */}
        {!personalProfile.age && !personalProfile.location && (
          <div className="p-4 bg-blue-50 rounded-md border border-blue-200">
            <h4 className="text-sm font-medium text-blue-900 mb-2">
              💡 Getting Started
            </h4>
            <p className="text-sm text-blue-800">
              Your age and location help us provide more accurate tax and
              inflation calculations for your financial forecast.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
