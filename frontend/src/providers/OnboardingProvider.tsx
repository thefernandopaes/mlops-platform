import React, { createContext, useContext, useState, useEffect } from 'react';
import { OnboardingTour, defaultOnboardingSteps } from '@/components/onboarding/OnboardingTour';
import { useUser } from '@/hooks/useUser';

interface OnboardingContextType {
  isOnboardingActive: boolean;
  startOnboarding: () => void;
  completeOnboarding: () => void;
  skipOnboarding: () => void;
  shouldShowOnboarding: boolean;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

interface OnboardingProviderProps {
  children: React.ReactNode;
}

export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({ children }) => {
  const { user, isLoading: userLoading } = useUser();
  const [isOnboardingActive, setIsOnboardingActive] = useState(false);
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(false);

  // Check if user needs onboarding
  useEffect(() => {
    if (userLoading || !user) return;

    const checkOnboardingNeeded = () => {
      // Check if onboarding was completed or skipped
      const onboardingState = localStorage.getItem('mlops_onboarding_state');
      let completed = false;
      let skipped = false;

      if (onboardingState) {
        try {
          const state = JSON.parse(onboardingState);
          completed = state.isCompleted;
          skipped = state.skipped;
        } catch (e) {
          console.warn('Failed to parse onboarding state');
        }
      }

      // Show onboarding for new users who haven't completed or skipped it
      const isNewUser = new Date(user.created_at).getTime() > Date.now() - (7 * 24 * 60 * 60 * 1000);
      const needsOnboarding = isNewUser && !completed && !skipped;

      setShouldShowOnboarding(needsOnboarding);

      // Auto-start onboarding for very new users (first visit)
      const firstVisit = !localStorage.getItem('mlops_platform_visited');
      if (needsOnboarding && firstVisit) {
        localStorage.setItem('mlops_platform_visited', 'true');
        // Delay to let the UI load
        setTimeout(() => {
          setIsOnboardingActive(true);
        }, 1000);
      }
    };

    checkOnboardingNeeded();
  }, [user, userLoading]);

  const startOnboarding = () => {
    setIsOnboardingActive(true);
  };

  const completeOnboarding = () => {
    setIsOnboardingActive(false);
    setShouldShowOnboarding(false);
    
    // Save completion state
    const state = {
      isCompleted: true,
      currentStep: null,
      completedSteps: defaultOnboardingSteps.map(step => step.id),
      skipped: false,
      completedAt: new Date().toISOString()
    };
    
    localStorage.setItem('mlops_onboarding_state', JSON.stringify(state));
  };

  const skipOnboarding = () => {
    setIsOnboardingActive(false);
    setShouldShowOnboarding(false);
    
    // Save skip state
    const state = {
      isCompleted: false,
      currentStep: null,
      completedSteps: [],
      skipped: true,
      skippedAt: new Date().toISOString()
    };
    
    localStorage.setItem('mlops_onboarding_state', JSON.stringify(state));
  };

  const contextValue: OnboardingContextType = {
    isOnboardingActive,
    startOnboarding,
    completeOnboarding,
    skipOnboarding,
    shouldShowOnboarding
  };

  return (
    <OnboardingContext.Provider value={contextValue}>
      {children}
      
      {/* Onboarding Tour Component */}
      <OnboardingTour
        steps={defaultOnboardingSteps}
        isOpen={isOnboardingActive}
        onClose={skipOnboarding}
        onComplete={completeOnboarding}
      />
    </OnboardingContext.Provider>
  );
};

export const useOnboardingContext = (): OnboardingContextType => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboardingContext must be used within an OnboardingProvider');
  }
  return context;
};

// Component to trigger onboarding manually
export const OnboardingTrigger: React.FC = () => {
  const { startOnboarding, shouldShowOnboarding } = useOnboardingContext();

  if (!shouldShowOnboarding) return null;

  return (
    <div className="fixed bottom-4 right-4 z-30">
      <Card className="w-80 shadow-lg border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <HelpCircle className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-sm mb-1">
                Welcome to MLOps Platform!
              </h4>
              <p className="text-xs text-muted-foreground mb-3">
                Take a quick tour to learn how to use the platform effectively.
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={startOnboarding}
                  size="sm"
                  className="text-xs"
                >
                  Start Tour
                </Button>
                <Button
                  onClick={() => {
                    // This would mark as not interested
                    localStorage.setItem('onboarding_dismissed', 'true');
                  }}
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                >
                  Maybe Later
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingProvider;