import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  Button,
  Card,
  CardContent,
  CardHeader,
  Progress
} from '@/components/ui';
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  CheckCircle,
  PlayCircle,
  BookOpen,
  Lightbulb,
  Target
} from 'lucide-react';
import { useOnboarding } from '@/hooks/useOnboarding';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  content: React.ReactNode;
  targetSelector?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface OnboardingTourProps {
  steps: OnboardingStep[];
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({
  steps,
  isOpen,
  onClose,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const { completeOnboarding, skipOnboarding } = useOnboarding();

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    if (currentStepData) {
      setCompletedSteps(prev => new Set([...prev, currentStepData.id]));
    }

    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    completeOnboarding();
    onComplete();
    onClose();
  };

  const handleSkip = () => {
    skipOnboarding();
    onClose();
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  if (!isOpen || !currentStepData) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <PlayCircle className="h-5 w-5 text-primary" />
                Welcome to MLOps Platform
              </DialogTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleSkip}
                className="text-muted-foreground hover:text-foreground"
              >
                Skip Tour
                <X className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Step {currentStep + 1} of {steps.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Current Step Content */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  {completedSteps.has(currentStepData.id) ? (
                    <CheckCircle className="h-4 w-4 text-primary" />
                  ) : (
                    <span className="text-sm font-medium text-primary">
                      {currentStep + 1}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{currentStepData.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {currentStepData.description}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentStepData.content}
                
                {currentStepData.action && (
                  <div className="pt-4 border-t">
                    <Button 
                      onClick={currentStepData.action.onClick}
                      variant="outline"
                      className="w-full"
                    >
                      <Target className="mr-2 h-4 w-4" />
                      {currentStepData.action.label}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={isFirstStep}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            <div className="flex gap-2">
              {steps.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStep 
                      ? 'bg-primary' 
                      : index < currentStep 
                        ? 'bg-primary/60' 
                        : 'bg-gray-200'
                  }`}
                  onClick={() => setCurrentStep(index)}
                />
              ))}
            </div>

            <Button
              onClick={handleNext}
              className="min-w-[100px]"
            >
              {isLastStep ? 'Complete' : 'Next'}
              {!isLastStep && <ChevronRight className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Overlay Highlight */}
      {currentStepData.targetSelector && (
        <OnboardingHighlight 
          targetSelector={currentStepData.targetSelector}
          position={currentStepData.position || 'bottom'}
        />
      )}
    </>
  );
};

interface OnboardingHighlightProps {
  targetSelector: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

const OnboardingHighlight: React.FC<OnboardingHighlightProps> = ({
  targetSelector,
  position
}) => {
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const element = document.querySelector(targetSelector) as HTMLElement;
    setTargetElement(element);
  }, [targetSelector]);

  if (!targetElement) return null;

  const rect = targetElement.getBoundingClientRect();

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50" />
      
      {/* Highlighted area */}
      <div
        className="absolute bg-transparent border-2 border-primary rounded-lg"
        style={{
          left: rect.left - 4,
          top: rect.top - 4,
          width: rect.width + 8,
          height: rect.height + 8,
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
        }}
      />

      {/* Pulse animation */}
      <div
        className="absolute border-2 border-primary rounded-lg animate-ping"
        style={{
          left: rect.left - 4,
          top: rect.top - 4,
          width: rect.width + 8,
          height: rect.height + 8,
        }}
      />
    </div>
  );
};

// Predefined onboarding steps
export const defaultOnboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to MLOps Platform',
    description: 'Your comprehensive machine learning operations platform',
    content: (
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-lg">
          <Lightbulb className="h-6 w-6 text-primary" />
          <div>
            <h4 className="font-medium">What is MLOps Platform?</h4>
            <p className="text-sm text-muted-foreground">
              A complete solution for managing ML models, experiments, and deployments
              with monitoring, collaboration, and governance features.
            </p>
          </div>
        </div>
        
        <div className="grid gap-3">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-green-500" />
            Model Registry & Version Control
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-green-500" />
            Experiment Tracking & Management
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-green-500" />
            Model Deployment & Serving
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-green-500" />
            Real-time Monitoring & Alerts
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'navigation',
    title: 'Platform Navigation',
    description: 'Learn how to navigate through the platform',
    targetSelector: '[data-onboarding="navigation"]',
    content: (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Use the main navigation to access different sections:
        </p>
        <ul className="space-y-2 text-sm">
          <li className="flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full" />
            <strong>Dashboard:</strong> Overview and metrics
          </li>
          <li className="flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full" />
            <strong>Projects:</strong> Organize your ML work
          </li>
          <li className="flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full" />
            <strong>Models:</strong> Manage model registry
          </li>
          <li className="flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full" />
            <strong>Experiments:</strong> Track and compare runs
          </li>
          <li className="flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full" />
            <strong>Deployments:</strong> Serve models in production
          </li>
        </ul>
      </div>
    )
  },
  {
    id: 'projects',
    title: 'Creating Your First Project',
    description: 'Projects help organize your ML work',
    targetSelector: '[data-onboarding="create-project"]',
    content: (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Projects are the foundation of your ML workflow. They contain:
        </p>
        <div className="grid gap-2 text-sm">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-blue-500" />
            Models and their versions
          </div>
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-blue-500" />
            Experiments and runs
          </div>
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-blue-500" />
            Deployments and services
          </div>
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-blue-500" />
            Team collaboration settings
          </div>
        </div>
      </div>
    ),
    action: {
      label: 'Create Your First Project',
      onClick: () => {
        // This would trigger project creation flow
        window.location.href = '/projects/new';
      }
    }
  },
  {
    id: 'models',
    title: 'Model Registry',
    description: 'Version and manage your ML models',
    content: (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          The Model Registry helps you:
        </p>
        <div className="grid gap-2 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            Version control for models
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            Track model lineage and metadata
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            Manage model lifecycle stages
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            Compare model performance
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Pro Tip:</strong> Use semantic versioning (1.0.0) for your models
            to track major changes, improvements, and patches.
          </p>
        </div>
      </div>
    )
  },
  {
    id: 'experiments',
    title: 'Experiment Tracking',
    description: 'Track and compare your ML experiments',
    content: (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Experiments help you systematically improve your models:
        </p>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-orange-500" />
            Log hyperparameters and metrics
          </div>
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-orange-500" />
            Compare experiment results
          </div>
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-orange-500" />
            Track artifacts and datasets
          </div>
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-orange-500" />
            Reproduce successful runs
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'deployments',
    title: 'Model Deployment',
    description: 'Deploy models for production use',
    content: (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Deploy your best models to production:
        </p>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <PlayCircle className="h-4 w-4 text-purple-500" />
            Real-time and batch inference
          </div>
          <div className="flex items-center gap-2">
            <PlayCircle className="h-4 w-4 text-purple-500" />
            Auto-scaling and load balancing
          </div>
          <div className="flex items-center gap-2">
            <PlayCircle className="h-4 w-4 text-purple-500" />
            A/B testing and canary deployments
          </div>
          <div className="flex items-center gap-2">
            <PlayCircle className="h-4 w-4 text-purple-500" />
            Performance monitoring
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'complete',
    title: 'You\'re Ready to Start!',
    description: 'Explore the platform and build amazing ML solutions',
    content: (
      <div className="space-y-4">
        <div className="text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
          <h4 className="text-lg font-semibold text-green-700">
            Congratulations!
          </h4>
          <p className="text-sm text-muted-foreground">
            You've completed the platform tour. Start building your first ML project!
          </p>
        </div>
        
        <div className="grid gap-3">
          <Button className="w-full" onClick={() => window.location.href = '/projects/new'}>
            Create Your First Project
          </Button>
          <Button variant="outline" className="w-full" onClick={() => window.location.href = '/docs'}>
            <BookOpen className="mr-2 h-4 w-4" />
            Read Documentation
          </Button>
        </div>
      </div>
    )
  }
];

export default OnboardingTour;