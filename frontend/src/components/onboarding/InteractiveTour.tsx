import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Card,
  CardContent,
  Button
} from '@/components/ui';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Target,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';

export interface TourStep {
  id: string;
  title: string;
  content: string;
  targetSelector: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: {
    label: string;
    onClick: () => void;
  };
  beforeShow?: () => Promise<void>;
  afterShow?: () => void;
}

interface InteractiveTourProps {
  steps: TourStep[];
  isActive: boolean;
  onComplete: () => void;
  onSkip: () => void;
  className?: string;
}

export const InteractiveTour: React.FC<InteractiveTourProps> = ({
  steps,
  isActive,
  onComplete,
  onSkip,
  className = ''
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const currentStep = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;
  const isFirstStep = currentStepIndex === 0;

  // Calculate tooltip position based on target element
  useEffect(() => {
    if (!isActive || !currentStep) return;

    const updateTooltipPosition = async () => {
      // Run beforeShow callback if provided
      if (currentStep.beforeShow) {
        try {
          await currentStep.beforeShow();
        } catch (error) {
          console.warn('Tour beforeShow callback failed:', error);
        }
      }

      // Wait a bit for any DOM updates
      setTimeout(() => {
        const targetElement = document.querySelector(currentStep.targetSelector);
        
        if (!targetElement) {
          console.warn(`Tour target not found: ${currentStep.targetSelector}`);
          return;
        }

        const rect = targetElement.getBoundingClientRect();
        const tooltipElement = tooltipRef.current;
        
        if (!tooltipElement) return;

        const tooltipRect = tooltipElement.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let x = 0;
        let y = 0;
        const offset = 12;

        // Calculate position based on preferred position
        switch (currentStep.position || 'bottom') {
          case 'top':
            x = rect.left + rect.width / 2 - tooltipRect.width / 2;
            y = rect.top - tooltipRect.height - offset;
            break;
          case 'bottom':
            x = rect.left + rect.width / 2 - tooltipRect.width / 2;
            y = rect.bottom + offset;
            break;
          case 'left':
            x = rect.left - tooltipRect.width - offset;
            y = rect.top + rect.height / 2 - tooltipRect.height / 2;
            break;
          case 'right':
            x = rect.right + offset;
            y = rect.top + rect.height / 2 - tooltipRect.height / 2;
            break;
          case 'center':
            x = viewportWidth / 2 - tooltipRect.width / 2;
            y = viewportHeight / 2 - tooltipRect.height / 2;
            break;
        }

        // Ensure tooltip stays within viewport
        x = Math.max(offset, Math.min(x, viewportWidth - tooltipRect.width - offset));
        y = Math.max(offset, Math.min(y, viewportHeight - tooltipRect.height - offset));

        setTooltipPosition({ x, y });
        setTooltipVisible(true);

        // Scroll target into view
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center'
        });

        // Run afterShow callback
        if (currentStep.afterShow) {
          currentStep.afterShow();
        }
      }, 100);
    };

    updateTooltipPosition();
  }, [currentStep, currentStepIndex, isActive]);

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setTooltipVisible(false);
      setTimeout(() => {
        setCurrentStepIndex(prev => prev + 1);
      }, 150);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setTooltipVisible(false);
      setTimeout(() => {
        setCurrentStepIndex(prev => prev - 1);
      }, 150);
    }
  };

  const handleSkip = () => {
    setTooltipVisible(false);
    onSkip();
  };

  const getArrowIcon = () => {
    switch (currentStep?.position || 'bottom') {
      case 'top': return <ArrowDown className="h-4 w-4" />;
      case 'bottom': return <ArrowUp className="h-4 w-4" />;
      case 'left': return <ArrowRight className="h-4 w-4" />;
      case 'right': return <ArrowLeft className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  if (!isActive || !currentStep) return null;

  const tooltip = (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-40" />
      
      {/* Highlight */}
      <TourHighlight targetSelector={currentStep.targetSelector} />
      
      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className={`fixed z-50 transition-all duration-300 ${
          tooltipVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
        style={{
          left: tooltipPosition.x,
          top: tooltipPosition.y,
        }}
      >
        <Card className="w-80 shadow-lg border">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2 text-primary">
                {getArrowIcon()}
                <span className="text-xs font-medium">
                  Step {currentStepIndex + 1} of {steps.length}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                className="text-muted-foreground hover:text-foreground h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <h3 className="font-semibold text-sm mb-2">{currentStep.title}</h3>
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
              {currentStep.content}
            </p>

            {currentStep.action && (
              <div className="mb-4">
                <Button
                  onClick={currentStep.action.onClick}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <Target className="mr-2 h-3 w-3" />
                  {currentStep.action.label}
                </Button>
              </div>
            )}

            <div className="flex justify-between items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrevious}
                disabled={isFirstStep}
                className="text-xs"
              >
                <ChevronLeft className="mr-1 h-3 w-3" />
                Previous
              </Button>

              <div className="flex gap-1">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${
                      index === currentStepIndex
                        ? 'bg-primary'
                        : index < currentStepIndex
                          ? 'bg-primary/60'
                          : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>

              <Button
                onClick={handleNext}
                size="sm"
                className="text-xs"
              >
                {isLastStep ? 'Finish' : 'Next'}
                {!isLastStep && <ChevronRight className="ml-1 h-3 w-3" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );

  return createPortal(tooltip, document.body);
};

interface TourHighlightProps {
  targetSelector: string;
}

const TourHighlight: React.FC<TourHighlightProps> = ({ targetSelector }) => {
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const updateHighlight = () => {
      const element = document.querySelector(targetSelector);
      if (element) {
        setTargetRect(element.getBoundingClientRect());
      }
    };

    updateHighlight();
    window.addEventListener('resize', updateHighlight);
    window.addEventListener('scroll', updateHighlight);

    return () => {
      window.removeEventListener('resize', updateHighlight);
      window.removeEventListener('scroll', updateHighlight);
    };
  }, [targetSelector]);

  if (!targetRect) return null;

  return (
    <div
      className="fixed z-45 pointer-events-none"
      style={{
        left: targetRect.left - 4,
        top: targetRect.top - 4,
        width: targetRect.width + 8,
        height: targetRect.height + 8,
      }}
    >
      {/* Highlight border */}
      <div className="absolute inset-0 border-2 border-primary rounded-lg animate-pulse" />
      
      {/* Glow effect */}
      <div className="absolute inset-0 border-2 border-primary/50 rounded-lg blur-sm" />
    </div>
  );
};

// Hook for managing tours
export const useTour = (tourId: string) => {
  const [isActive, setIsActive] = useState(false);

  const startTour = () => {
    setIsActive(true);
  };

  const endTour = () => {
    setIsActive(false);
    
    // Mark tour as completed
    const completedTours = JSON.parse(
      localStorage.getItem('completed_tours') || '[]'
    );
    
    if (!completedTours.includes(tourId)) {
      completedTours.push(tourId);
      localStorage.setItem('completed_tours', JSON.stringify(completedTours));
    }
  };

  const isCompleted = () => {
    const completedTours = JSON.parse(
      localStorage.getItem('completed_tours') || '[]'
    );
    return completedTours.includes(tourId);
  };

  return {
    isActive,
    startTour,
    endTour,
    isCompleted: isCompleted()
  };
};

export default InteractiveTour;