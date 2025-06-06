'use client';

import { useScenarioStore } from '../store/scenario';
import { FormField, FormInput } from './form-field';

export function ScenarioNameForm() {
  const { scenarioName, validationErrors, updateScenarioName } =
    useScenarioStore();

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateScenarioName(e.target.value);
  };

  return (
    <div className="bg-card border rounded-lg p-4 mb-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Scenario Name</h3>
          <p className="text-sm text-muted-foreground">
            Give your financial scenario a descriptive name to help you identify
            it later.
          </p>
        </div>

        <FormField label="Name" error={validationErrors.scenarioName} required>
          <FormInput
            id="scenario-name"
            type="text"
            placeholder="e.g., Retirement Planning 2024, Home Purchase Scenario"
            value={scenarioName}
            onChange={handleNameChange}
            error={validationErrors.scenarioName}
          />
        </FormField>
      </div>
    </div>
  );
}
