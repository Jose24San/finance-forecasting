import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
    if (targetDate < today) {
      errors.date = 'Target date must be in the future';
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

      // Actions
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

          return {
            milestones: updatedMilestones,
            validationErrors: {
              ...state.validationErrors,
              milestones: { ...state.validationErrors.milestones, ...errors },
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
          profileErrors ||
          Object.keys(assetErrors).length ||
          Object.keys(streamErrors).length ||
          Object.keys(milestoneErrors).length
        );

        set({
          validationErrors: {
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
        });
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
      }),
    }
  )
);
