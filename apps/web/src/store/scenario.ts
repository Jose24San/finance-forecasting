import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  apiClient,
  CreateScenarioRequest,
  ScenarioResponse,
  ApiError,
} from '@/lib/api-client';

// Types for our form state
export interface PersonalProfile {
  age: number | null;
  location: string;
  dependents: number;
}

// Asset types matching Prisma schema
export type AssetType =
  | 'TAXABLE'
  | 'TAX_DEFERRED'
  | 'TAX_FREE'
  | 'REAL_ESTATE'
  | 'CRYPTO';

export interface Asset {
  id: string;
  name: string;
  amount: number;
  category: AssetType;
  growthRate: number;
}

// Income Stream types matching Prisma schema
export type Frequency = 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY';

export interface IncomeStream {
  id: string;
  name: string;
  amount: number;
  frequency: Frequency;
  startDate: string; // ISO date string for easier form handling
  endDate?: string; // Optional end date
  raiseRate?: number; // Annual raise percentage
}

// Milestone types matching Prisma schema
export type MilestoneType =
  | 'RETIREMENT'
  | 'COLLEGE'
  | 'MAJOR_PURCHASE'
  | 'INCOME_CHANGE'
  | 'DEATH_OF_SPOUSE'
  | 'CUSTOM';

export interface Milestone {
  id: string;
  name: string;
  type: MilestoneType;
  date: string; // ISO date string for easier form handling
  impact: number; // Financial impact (positive or negative)
}

// Validation types
export interface ValidationErrors {
  scenarioName?: string;
  personalProfile?: {
    age?: string;
    location?: string;
    dependents?: string;
  };
  assets?: Record<
    string,
    {
      name?: string;
      amount?: string;
      growthRate?: string;
    }
  >;
  incomeStreams?: Record<
    string,
    {
      name?: string;
      amount?: string;
      startDate?: string;
      endDate?: string;
      raiseRate?: string;
    }
  >;
  milestones?: Record<
    string,
    {
      name?: string;
      date?: string;
      impact?: string;
    }
  >;
}

export interface ScenarioFormState {
  // Personal Profile
  personalProfile: PersonalProfile;

  // Assets
  assets: Asset[];

  // Income Streams
  incomeStreams: IncomeStream[];

  // Milestones
  milestones: Milestone[];

  // Validation
  validationErrors: ValidationErrors;
  isFormValid: boolean;

  // Auto-save
  lastSaved: Date | null;
  isDirty: boolean;

  // Save state
  scenarioId: string | null;
  scenarioName: string;
  scenarioDescription: string;
  isSaving: boolean;
  saveError: string | null;

  // Actions
  updatePersonalProfile: (profile: Partial<PersonalProfile>) => void;
  addAsset: (asset: Omit<Asset, 'id'>) => void;
  updateAsset: (id: string, updates: Partial<Asset>) => void;
  removeAsset: (id: string) => void;
  addIncomeStream: (incomeStream: Omit<IncomeStream, 'id'>) => void;
  updateIncomeStream: (id: string, updates: Partial<IncomeStream>) => void;
  removeIncomeStream: (id: string) => void;
  addMilestone: (milestone: Omit<Milestone, 'id'>) => void;
  updateMilestone: (id: string, updates: Partial<Milestone>) => void;
  removeMilestone: (id: string) => void;
  validateForm: () => boolean;
  clearValidationErrors: () => void;
  markAsClean: () => void;
  resetForm: () => void;

  // Save actions
  updateScenarioName: (name: string) => void;
  updateScenarioInfo: (name: string, description?: string) => void;
  saveScenario: () => Promise<boolean>;
  loadScenario: (id: string) => Promise<boolean>;
  canSave: () => boolean;
}

// Helper function to get default growth rate based on asset category
export const getDefaultGrowthRate = (category: AssetType): number => {
  switch (category) {
    case 'TAXABLE':
    case 'TAX_DEFERRED':
    case 'TAX_FREE':
      return 7.0; // Default stock growth
    case 'REAL_ESTATE':
      return 3.0; // Real estate growth
    case 'CRYPTO':
      return 10.0; // Higher risk/reward
    default:
      return 7.0;
  }
};

// Helper function to convert income to annual amount
export const getAnnualIncome = (
  amount: number,
  frequency: Frequency
): number => {
  switch (frequency) {
    case 'MONTHLY':
      return amount * 12;
    case 'QUARTERLY':
      return amount * 4;
    case 'ANNUALLY':
      return amount;
    default:
      return amount;
  }
};

// Validation functions
const validateScenarioName = (name: string): string | undefined => {
  if (name.trim().length === 0) {
    return 'Scenario name is required';
  }
  if (name.trim().length > 100) {
    return 'Scenario name must be 100 characters or less';
  }
  return undefined;
};

const validatePersonalProfile = (
  profile: PersonalProfile
): ValidationErrors['personalProfile'] => {
  const errors: ValidationErrors['personalProfile'] = {};

  if (profile.age !== null && (profile.age < 16 || profile.age > 100)) {
    errors.age = 'Age must be between 16 and 100';
  }

  if (profile.location.trim().length === 0) {
    errors.location = 'Location is required';
  }

  if (profile.dependents < 0 || profile.dependents > 20) {
    errors.dependents = 'Dependents must be between 0 and 20';
  }

  return Object.keys(errors).length > 0 ? errors : undefined;
};

const validateAsset = (asset: Asset): ValidationErrors['assets'] => {
  const errors: any = {};

  if (!asset.name.trim()) {
    errors.name = 'Asset name is required';
  }

  if (asset.amount <= 0) {
    errors.amount = 'Amount must be greater than 0';
  }

  if (asset.growthRate < -100 || asset.growthRate > 100) {
    errors.growthRate = 'Growth rate must be between -100% and 100%';
  }

  return Object.keys(errors).length > 0 ? { [asset.id]: errors } : undefined;
};

const validateIncomeStream = (
  stream: IncomeStream
): ValidationErrors['incomeStreams'] => {
  const errors: any = {};

  if (!stream.name.trim()) {
    errors.name = 'Income stream name is required';
  }

  if (stream.amount <= 0) {
    errors.amount = 'Amount must be greater than 0';
  }

  if (!stream.startDate) {
    errors.startDate = 'Start date is required';
  }

  if (stream.endDate && stream.endDate <= stream.startDate) {
    errors.endDate = 'End date must be after start date';
  }

  if (
    stream.raiseRate !== undefined &&
    (stream.raiseRate < -50 || stream.raiseRate > 50)
  ) {
    errors.raiseRate = 'Raise rate must be between -50% and 50%';
  }

  return Object.keys(errors).length > 0 ? { [stream.id]: errors } : undefined;
};

const validateMilestone = (
  milestone: Milestone
): ValidationErrors['milestones'] => {
  const errors: any = {};

  if (!milestone.name.trim()) {
    errors.name = 'Milestone name is required';
  }

  if (!milestone.date) {
    errors.date = 'Target date is required';
  } else {
    const targetDate = new Date(milestone.date);
    const today = new Date();

    // Reset time to start of day for accurate comparison
    today.setHours(0, 0, 0, 0);
    targetDate.setHours(0, 0, 0, 0);

    if (targetDate < today) {
      errors.date =
        'Please select today or a future date for your financial milestone. Past dates cannot be used for financial planning.';
    }
  }

  return Object.keys(errors).length > 0
    ? { [milestone.id]: errors }
    : undefined;
};

// Helper function to generate unique IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

// Initial state
const initialPersonalProfile: PersonalProfile = {
  age: null,
  location: '',
  dependents: 0,
};

export const useScenarioStore = create<ScenarioFormState>()(
  persist(
    (set, get) => ({
      // Initial state
      personalProfile: initialPersonalProfile,
      assets: [],
      incomeStreams: [],
      milestones: [],
      validationErrors: {},
      isFormValid: true,
      lastSaved: null,
      isDirty: false,

      // Save state
      scenarioId: null,
      scenarioName: '',
      scenarioDescription: '',
      isSaving: false,
      saveError: null,

      // Actions
      updateScenarioName: (name) => {
        set((state) => {
          const error = validateScenarioName(name);
          return {
            scenarioName: name,
            validationErrors: {
              ...state.validationErrors,
              scenarioName: error,
            },
            isDirty: true,
          };
        });
      },

      updatePersonalProfile: (profile) => {
        set((state) => {
          const newProfile = { ...state.personalProfile, ...profile };
          const errors = validatePersonalProfile(newProfile);
          return {
            personalProfile: newProfile,
            validationErrors: {
              ...state.validationErrors,
              personalProfile: errors,
            },
            isDirty: true,
          };
        });
      },

      addAsset: (asset) => {
        set((state) => {
          const newAsset = { ...asset, id: generateId() };
          const errors = validateAsset(newAsset);
          return {
            assets: [...state.assets, newAsset],
            validationErrors: {
              ...state.validationErrors,
              assets: { ...state.validationErrors.assets, ...errors },
            },
            isDirty: true,
          };
        });
      },

      updateAsset: (id, updates) => {
        set((state) => {
          const updatedAssets = state.assets.map((asset) => {
            if (asset.id === id) {
              const updatedAsset = { ...asset, ...updates };
              const errors = validateAsset(updatedAsset);
              return updatedAsset;
            }
            return asset;
          });

          const updatedAsset = updatedAssets.find((a) => a.id === id);
          const errors = updatedAsset ? validateAsset(updatedAsset) : undefined;

          return {
            assets: updatedAssets,
            validationErrors: {
              ...state.validationErrors,
              assets: { ...state.validationErrors.assets, ...errors },
            },
            isDirty: true,
          };
        });
      },

      removeAsset: (id) => {
        set((state) => {
          const newAssets = { ...state.validationErrors.assets };
          delete newAssets[id];

          return {
            assets: state.assets.filter((asset) => asset.id !== id),
            validationErrors: {
              ...state.validationErrors,
              assets: newAssets,
            },
            isDirty: true,
          };
        });
      },

      addIncomeStream: (incomeStream) => {
        set((state) => {
          const newStream = { ...incomeStream, id: generateId() };
          const errors = validateIncomeStream(newStream);
          return {
            incomeStreams: [...state.incomeStreams, newStream],
            validationErrors: {
              ...state.validationErrors,
              incomeStreams: {
                ...state.validationErrors.incomeStreams,
                ...errors,
              },
            },
            isDirty: true,
          };
        });
      },

      updateIncomeStream: (id, updates) => {
        set((state) => {
          const updatedStreams = state.incomeStreams.map((stream) => {
            if (stream.id === id) {
              return { ...stream, ...updates };
            }
            return stream;
          });

          const updatedStream = updatedStreams.find((s) => s.id === id);
          const errors = updatedStream
            ? validateIncomeStream(updatedStream)
            : undefined;

          return {
            incomeStreams: updatedStreams,
            validationErrors: {
              ...state.validationErrors,
              incomeStreams: {
                ...state.validationErrors.incomeStreams,
                ...errors,
              },
            },
            isDirty: true,
          };
        });
      },

      removeIncomeStream: (id) => {
        set((state) => {
          const newStreams = { ...state.validationErrors.incomeStreams };
          delete newStreams[id];

          return {
            incomeStreams: state.incomeStreams.filter(
              (stream) => stream.id !== id
            ),
            validationErrors: {
              ...state.validationErrors,
              incomeStreams: newStreams,
            },
            isDirty: true,
          };
        });
      },

      addMilestone: (milestone) => {
        set((state) => {
          const newMilestone = { ...milestone, id: generateId() };
          const errors = validateMilestone(newMilestone);
          return {
            milestones: [...state.milestones, newMilestone],
            validationErrors: {
              ...state.validationErrors,
              milestones: { ...state.validationErrors.milestones, ...errors },
            },
            isDirty: true,
          };
        });
      },

      updateMilestone: (id, updates) => {
        set((state) => {
          const updatedMilestones = state.milestones.map((milestone) => {
            if (milestone.id === id) {
              return { ...milestone, ...updates };
            }
            return milestone;
          });

          const updatedMilestone = updatedMilestones.find((m) => m.id === id);
          const errors = updatedMilestone
            ? validateMilestone(updatedMilestone)
            : undefined;

          // Properly handle clearing errors when validation passes
          const updatedMilestoneErrors = {
            ...state.validationErrors.milestones,
          };
          if (errors) {
            // Add/update errors
            Object.assign(updatedMilestoneErrors, errors);
          } else {
            // Clear errors for this milestone
            delete updatedMilestoneErrors[id];
          }

          return {
            milestones: updatedMilestones,
            validationErrors: {
              ...state.validationErrors,
              milestones: updatedMilestoneErrors,
            },
            isDirty: true,
          };
        });
      },

      removeMilestone: (id) => {
        set((state) => {
          const newMilestones = { ...state.validationErrors.milestones };
          delete newMilestones[id];

          return {
            milestones: state.milestones.filter(
              (milestone) => milestone.id !== id
            ),
            validationErrors: {
              ...state.validationErrors,
              milestones: newMilestones,
            },
            isDirty: true,
          };
        });
      },

      validateForm: () => {
        const state = get();
        let hasErrors = false;

        // Validate all sections
        const scenarioNameError = validateScenarioName(state.scenarioName);
        const profileErrors = validatePersonalProfile(state.personalProfile);
        const assetErrors = state.assets.reduce((acc, asset) => {
          const errors = validateAsset(asset);
          return { ...acc, ...errors };
        }, {});
        const streamErrors = state.incomeStreams.reduce((acc, stream) => {
          const errors = validateIncomeStream(stream);
          return { ...acc, ...errors };
        }, {});
        const milestoneErrors = state.milestones.reduce((acc, milestone) => {
          const errors = validateMilestone(milestone);
          return { ...acc, ...errors };
        }, {});

        hasErrors = !!(
          scenarioNameError ||
          profileErrors ||
          Object.keys(assetErrors).length ||
          Object.keys(streamErrors).length ||
          Object.keys(milestoneErrors).length
        );

        set({
          validationErrors: {
            scenarioName: scenarioNameError,
            personalProfile: profileErrors,
            assets: assetErrors,
            incomeStreams: streamErrors,
            milestones: milestoneErrors,
          },
          isFormValid: !hasErrors,
        });

        return !hasErrors;
      },

      clearValidationErrors: () => {
        set({ validationErrors: {}, isFormValid: true });
      },

      markAsClean: () => {
        set({ isDirty: false, lastSaved: new Date() });
      },

      resetForm: () => {
        set({
          personalProfile: initialPersonalProfile,
          assets: [],
          incomeStreams: [],
          milestones: [],
          validationErrors: {},
          isFormValid: true,
          lastSaved: null,
          isDirty: false,
          scenarioId: null,
          scenarioName: '',
          scenarioDescription: '',
          isSaving: false,
          saveError: null,
        });
      },

      // Save actions
      updateScenarioInfo: (name, description = '') => {
        set({
          scenarioName: name,
          scenarioDescription: description,
          isDirty: true,
        });
      },

      canSave: () => {
        const state = get();

        // Check if form is valid
        if (!state.isFormValid) {
          return false;
        }

        // Check minimum requirements for a valid scenario
        const hasBasicInfo =
          state.scenarioName.trim().length > 0 &&
          state.personalProfile.location.trim().length > 0;
        const hasAssets = state.assets.length > 0;
        const hasIncomeStreams = state.incomeStreams.length > 0;

        return hasBasicInfo && hasAssets && hasIncomeStreams;
      },

      saveScenario: async () => {
        const state = get();

        // Pre-flight checks
        if (!state.canSave()) {
          set({
            saveError: 'Please fill in all required fields before saving.',
          });
          return false;
        }

        if (state.isSaving) {
          return false; // Already saving
        }

        set({ isSaving: true, saveError: null });

        try {
          // Transform store data to API format
          const scenarioData: CreateScenarioRequest = {
            name: state.scenarioName,
            description: state.scenarioDescription || undefined,
            personalProfile: {
              age: state.personalProfile.age,
              location: state.personalProfile.location,
              dependents: state.personalProfile.dependents,
            },
            assets: state.assets.map((asset) => ({
              name: asset.name,
              amount: asset.amount,
              category: asset.category,
              growthRate: asset.growthRate,
            })),
            incomeStreams: state.incomeStreams.map((stream) => ({
              name: stream.name,
              amount: stream.amount,
              frequency: stream.frequency,
              startDate: stream.startDate,
              endDate: stream.endDate || undefined,
              raiseRate: stream.raiseRate || undefined,
            })),
            milestones: state.milestones.map((milestone) => ({
              name: milestone.name,
              type: milestone.type,
              date: milestone.date,
              impact: milestone.impact,
            })),
            settings: {
              inflationRate: 2.5,
              stockGrowthRate: 7.0,
              realEstateGrowth: 3.0,
            },
          };

          let response: ScenarioResponse;

          if (state.scenarioId) {
            // Update existing scenario
            response = await apiClient.updateScenario(
              state.scenarioId,
              scenarioData
            );
          } else {
            // Create new scenario
            response = await apiClient.createScenario(scenarioData);
          }

          // Success! Update store with saved data
          set({
            scenarioId: response.id,
            isDirty: false,
            lastSaved: new Date(),
            isSaving: false,
            saveError: null,
          });

          return true;
        } catch (error) {
          console.error('Failed to save scenario:', error);

          let errorMessage = 'Failed to save scenario. Please try again.';
          if (error instanceof ApiError) {
            if (error.status === 401) {
              errorMessage = 'You must be logged in to save scenarios.';
            } else if (error.status === 400) {
              errorMessage = 'Invalid scenario data. Please check your inputs.';
            } else {
              errorMessage = error.message;
            }
          }

          set({
            isSaving: false,
            saveError: errorMessage,
          });

          return false;
        }
      },

      loadScenario: async (id: string) => {
        set({ isSaving: true, saveError: null });

        try {
          const scenario = await apiClient.getScenario(id);

          // Transform API data to store format
          set({
            scenarioId: scenario.id,
            scenarioName: scenario.name,
            scenarioDescription: scenario.description || '',
            personalProfile: {
              age: scenario.assets.find(() => true) ? 30 : null, // TODO: Get from user profile
              location: 'US', // TODO: Get from user profile
              dependents: 0, // TODO: Get from user profile
            },
            assets: scenario.assets.map((asset) => ({
              id: asset.id,
              name: asset.name,
              amount: asset.amount,
              category: asset.category as AssetType,
              growthRate: asset.growthRate,
            })),
            incomeStreams: scenario.incomeStreams.map((stream) => ({
              id: stream.id,
              name: stream.name,
              amount: stream.amount,
              frequency: stream.frequency as Frequency,
              startDate: stream.startDate,
              endDate: stream.endDate || undefined,
              raiseRate: stream.raiseRate || undefined,
            })),
            milestones: scenario.milestones.map((milestone) => ({
              id: milestone.id,
              name: milestone.name,
              type: milestone.type as MilestoneType,
              date: milestone.date,
              impact: milestone.impact,
            })),
            validationErrors: {},
            isFormValid: true,
            isDirty: false,
            lastSaved: new Date(),
            isSaving: false,
            saveError: null,
          });

          return true;
        } catch (error) {
          console.error('Failed to load scenario:', error);

          let errorMessage = 'Failed to load scenario. Please try again.';
          if (error instanceof ApiError) {
            if (error.status === 401) {
              errorMessage = 'You must be logged in to load scenarios.';
            } else if (error.status === 404) {
              errorMessage = 'Scenario not found.';
            } else {
              errorMessage = error.message;
            }
          }

          set({
            isSaving: false,
            saveError: errorMessage,
          });

          return false;
        }
      },
    }),
    {
      name: 'finpilot-scenario-draft',
      partialize: (state) => ({
        personalProfile: state.personalProfile,
        assets: state.assets,
        incomeStreams: state.incomeStreams,
        milestones: state.milestones,
        lastSaved: state.lastSaved,
        scenarioId: state.scenarioId,
        scenarioName: state.scenarioName,
        scenarioDescription: state.scenarioDescription,
      }),
    }
  )
);
