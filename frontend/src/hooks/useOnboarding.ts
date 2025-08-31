import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@/hooks/useUser';
import { api } from '@/lib/api';

interface OnboardingState {
  isCompleted: boolean;
  currentStep: string | null;
  completedSteps: string[];
  skipped: boolean;
}

interface OnboardingHook {
  isOnboardingNeeded: boolean;
  onboardingState: OnboardingState;
  startOnboarding: () => void;
  completeOnboarding: () => void;
  skipOnboarding: () => void;
  updateStep: (stepId: string) => void;
  resetOnboarding: () => void;
  isLoading: boolean;
}

const ONBOARDING_STORAGE_KEY = 'mlops_onboarding_state';

export const useOnboarding = (): OnboardingHook => {
  const { user } = useUser();
  const [onboardingState, setOnboardingState] = useState<OnboardingState>({
    isCompleted: false,
    currentStep: null,
    completedSteps: [],
    skipped: false
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load onboarding state from localStorage and user profile
  useEffect(() => {
    const loadOnboardingState = async () => {
      try {
        setIsLoading(true);

        // Check local storage first
        const localState = localStorage.getItem(ONBOARDING_STORAGE_KEY);
        let state: OnboardingState = {
          isCompleted: false,
          currentStep: null,
          completedSteps: [],
          skipped: false
        };

        if (localState) {
          try {
            state = JSON.parse(localState);
          } catch (e) {
            console.warn('Failed to parse onboarding state from localStorage');
          }
        }

        // If user is available, check server-side state
        if (user) {
          try {
            const response = await api.get('/users/me/onboarding');
            if (response.data) {
              state = {
                ...state,
                ...response.data,
                // Merge completed steps
                completedSteps: [
                  ...new Set([
                    ...state.completedSteps,
                    ...(response.data.completedSteps || [])
                  ])
                ]
              };
            }
          } catch (error) {
            console.warn('Failed to load onboarding state from server:', error);
          }
        }

        setOnboardingState(state);
      } finally {
        setIsLoading(false);
      }
    };

    loadOnboardingState();
  }, [user]);

  // Save state to localStorage and server
  const saveOnboardingState = useCallback(async (newState: OnboardingState) => {
    try {
      // Save to localStorage
      localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(newState));

      // Save to server if user is authenticated
      if (user) {
        try {
          await api.put('/users/me/onboarding', newState);
        } catch (error) {
          console.warn('Failed to save onboarding state to server:', error);
        }
      }

      setOnboardingState(newState);
    } catch (error) {
      console.error('Failed to save onboarding state:', error);
    }
  }, [user]);

  const startOnboarding = useCallback(() => {
    const newState: OnboardingState = {
      isCompleted: false,
      currentStep: 'welcome',
      completedSteps: [],
      skipped: false
    };
    saveOnboardingState(newState);
  }, [saveOnboardingState]);

  const completeOnboarding = useCallback(() => {
    const newState: OnboardingState = {
      ...onboardingState,
      isCompleted: true,
      currentStep: null,
      skipped: false
    };
    saveOnboardingState(newState);
  }, [onboardingState, saveOnboardingState]);

  const skipOnboarding = useCallback(() => {
    const newState: OnboardingState = {
      ...onboardingState,
      isCompleted: false,
      currentStep: null,
      skipped: true
    };
    saveOnboardingState(newState);
  }, [onboardingState, saveOnboardingState]);

  const updateStep = useCallback((stepId: string) => {
    const newState: OnboardingState = {
      ...onboardingState,
      currentStep: stepId,
      completedSteps: [...new Set([...onboardingState.completedSteps, stepId])]
    };
    saveOnboardingState(newState);
  }, [onboardingState, saveOnboardingState]);

  const resetOnboarding = useCallback(() => {
    const newState: OnboardingState = {
      isCompleted: false,
      currentStep: null,
      completedSteps: [],
      skipped: false
    };
    saveOnboardingState(newState);
  }, [saveOnboardingState]);

  // Determine if onboarding is needed
  const isOnboardingNeeded = !isLoading && 
    user && 
    !onboardingState.isCompleted && 
    !onboardingState.skipped &&
    // Only show for new users (created in last 7 days)
    new Date(user.created_at).getTime() > Date.now() - (7 * 24 * 60 * 60 * 1000);

  return {
    isOnboardingNeeded,
    onboardingState,
    startOnboarding,
    completeOnboarding,
    skipOnboarding,
    updateStep,
    resetOnboarding,
    isLoading
  };
};

// Helper hook for feature tours (smaller, focused tours)
export const useFeatureTour = (featureName: string) => {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const startTour = useCallback(() => {
    setIsActive(true);
    setCurrentStep(0);
  }, []);

  const endTour = useCallback(() => {
    setIsActive(false);
    setCurrentStep(0);
    
    // Mark feature tour as completed
    const completedTours = JSON.parse(
      localStorage.getItem('completed_feature_tours') || '[]'
    );
    
    if (!completedTours.includes(featureName)) {
      completedTours.push(featureName);
      localStorage.setItem('completed_feature_tours', JSON.stringify(completedTours));
    }
  }, [featureName]);

  const nextStep = useCallback(() => {
    setCurrentStep(prev => prev + 1);
  }, []);

  const previousStep = useCallback(() => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  }, []);

  const goToStep = useCallback((step: number) => {
    setCurrentStep(step);
  }, []);

  // Check if feature tour was already completed
  const isCompleted = useCallback(() => {
    const completedTours = JSON.parse(
      localStorage.getItem('completed_feature_tours') || '[]'
    );
    return completedTours.includes(featureName);
  }, [featureName]);

  return {
    isActive,
    currentStep,
    startTour,
    endTour,
    nextStep,
    previousStep,
    goToStep,
    isCompleted: isCompleted()
  };
};