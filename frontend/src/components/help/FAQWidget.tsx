import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Badge
} from '@/components/ui';
import {
  ChevronDown,
  ChevronUp,
  Search,
  HelpCircle,
  ExternalLink,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  helpful: number;
  notHelpful: number;
  relatedLinks?: Array<{
    title: string;
    url: string;
  }>;
}

interface FAQWidgetProps {
  category?: string;
  compact?: boolean;
  showSearch?: boolean;
  maxItems?: number;
}

export const FAQWidget: React.FC<FAQWidgetProps> = ({
  category = 'all',
  compact = false,
  showSearch = true,
  maxItems = 10
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  // Mock FAQ data - in real implementation, this would come from API
  const faqItems: FAQItem[] = [
    {
      id: 'api-key-create',
      question: 'How do I create an API key?',
      answer: `To create an API key:
      
      1. Go to Settings → API Keys
      2. Click "Create New API Key"
      3. Enter a descriptive name
      4. Select the required permissions
      5. Set an expiration date (optional)
      6. Copy the generated key immediately (it won't be shown again)
      
      Store your API key securely and never share it publicly.`,
      category: 'api',
      tags: ['api', 'authentication', 'security'],
      helpful: 25,
      notHelpful: 2,
      relatedLinks: [
        { title: 'API Key Security Best Practices', url: '/docs/api-security' },
        { title: 'API Documentation', url: '/docs/api' }
      ]
    },
    {
      id: 'model-deploy',
      question: 'How do I deploy a model?',
      answer: `To deploy a model for inference:
      
      1. Ensure your model is in "Production" stage
      2. Go to Deployments → New Deployment
      3. Select your model version
      4. Configure resources (CPU, memory, replicas)
      5. Set environment variables if needed
      6. Deploy to staging first for testing
      7. Promote to production when ready
      
      Your model will be available at /api/v1/inference/[deployment-name]`,
      category: 'deployments',
      tags: ['deployment', 'models', 'production'],
      helpful: 31,
      notHelpful: 1,
      relatedLinks: [
        { title: 'Deployment Guide', url: '/docs/deployments' },
        { title: 'Model Serving API', url: '/docs/inference-api' }
      ]
    },
    {
      id: 'experiment-tracking',
      question: 'How do I track experiments?',
      answer: `Track experiments using our SDK:
      
      \`\`\`python
      import mlops_platform as mlops
      
      # Initialize experiment
      mlops.init_experiment("my-experiment")
      
      # Log parameters
      mlops.log_params({
          "learning_rate": 0.01,
          "batch_size": 32
      })
      
      # Log metrics
      mlops.log_metrics({
          "accuracy": 0.95,
          "loss": 0.05
      })
      
      # Log model
      mlops.log_model(model, "sklearn")
      \`\`\``,
      category: 'experiments',
      tags: ['experiments', 'tracking', 'sdk'],
      helpful: 18,
      notHelpful: 0,
      relatedLinks: [
        { title: 'SDK Documentation', url: '/docs/sdk' },
        { title: 'Experiment Examples', url: '/docs/examples' }
      ]
    },
    {
      id: 'monitoring-setup',
      question: 'How do I set up model monitoring?',
      answer: `Set up monitoring for your deployed models:
      
      1. Go to your deployment settings
      2. Enable monitoring features:
         - Data drift detection
         - Performance monitoring
         - Error rate tracking
      3. Configure alert thresholds
      4. Set notification channels (email, Slack, etc.)
      5. Define monitoring schedules
      
      Monitoring helps detect issues before they impact users.`,
      category: 'monitoring',
      tags: ['monitoring', 'alerts', 'data-drift'],
      helpful: 22,
      notHelpful: 3,
      relatedLinks: [
        { title: 'Monitoring Guide', url: '/docs/monitoring' },
        { title: 'Alert Configuration', url: '/docs/alerts' }
      ]
    },
    {
      id: 'troubleshooting-errors',
      question: 'My model deployment is failing. What should I check?',
      answer: `Common deployment issues and solutions:
      
      **Model Loading Errors:**
      - Check model file format and framework compatibility
      - Verify model dependencies are installed
      - Check file size limits
      
      **Resource Issues:**
      - Increase memory allocation if OOM errors
      - Check CPU requirements for your model
      - Verify GPU availability if needed
      
      **Schema Validation:**
      - Ensure input schema matches your model
      - Check data types and formats
      - Validate example inputs
      
      Check the deployment logs for specific error messages.`,
      category: 'troubleshooting',
      tags: ['troubleshooting', 'deployment', 'errors'],
      helpful: 15,
      notHelpful: 2,
      relatedLinks: [
        { title: 'Troubleshooting Guide', url: '/docs/troubleshooting' },
        { title: 'Deployment Logs', url: '/deployments' }
      ]
    }
  ];

  // Filter FAQ items
  const filteredItems = faqItems
    .filter(item => category === 'all' || item.category === category)
    .filter(item => {
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      return (
        item.question.toLowerCase().includes(query) ||
        item.answer.toLowerCase().includes(query) ||
        item.tags.some(tag => tag.toLowerCase().includes(query))
      );
    })
    .slice(0, maxItems);

  const toggleItem = (itemId: string) => {
    setOpenItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleFeedback = async (itemId: string, helpful: boolean) => {
    // In real implementation, this would call an API
    console.log(`FAQ feedback: ${itemId} - ${helpful ? 'helpful' : 'not helpful'}`);
  };

  return (
    <Card className={`${className} ${compact ? 'max-h-96 overflow-y-auto' : ''}`}>
      <CardHeader className={compact ? 'pb-3' : 'pb-4'}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            <h3 className={`font-semibold ${compact ? 'text-sm' : 'text-base'}`}>
              Frequently Asked Questions
            </h3>
          </div>
          <Badge variant="secondary" className="text-xs">
            {filteredItems.length} articles
          </Badge>
        </div>
        
        {showSearch && (
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder="Search FAQ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        )}
      </CardHeader>

      <CardContent className={compact ? 'pt-0' : 'pt-2'}>
        <div className="space-y-2">
          {filteredItems.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <HelpCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No FAQ items found</p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <Collapsible
                key={item.id}
                open={openItems.has(item.id)}
                onOpenChange={() => toggleItem(item.id)}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between text-left p-3 h-auto hover:bg-gray-50"
                  >
                    <span className={`${compact ? 'text-xs' : 'text-sm'} font-medium`}>
                      {item.question}
                    </span>
                    {openItems.has(item.id) ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                
                <CollapsibleContent className="px-3 pb-3">
                  <div className="space-y-3">
                    <div className={`${compact ? 'text-xs' : 'text-sm'} text-muted-foreground whitespace-pre-line leading-relaxed`}>
                      {item.answer}
                    </div>
                    
                    {item.relatedLinks && item.relatedLinks.length > 0 && (
                      <div>
                        <h5 className="text-xs font-medium mb-2 text-gray-600">
                          Related Links:
                        </h5>
                        <div className="space-y-1">
                          {item.relatedLinks.map((link, index) => (
                            <a
                              key={index}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-xs text-primary hover:underline"
                            >
                              {link.title}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {!compact && (
                      <div className="flex items-center justify-between pt-2 border-t">
                        <span className="text-xs text-muted-foreground">
                          Was this helpful?
                        </span>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleFeedback(item.id, true)}
                            className="text-xs h-6 px-2"
                          >
                            <ThumbsUp className="h-3 w-3 mr-1" />
                            {item.helpful}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleFeedback(item.id, false)}
                            className="text-xs h-6 px-2"
                          >
                            <ThumbsDown className="h-3 w-3 mr-1" />
                            {item.notHelpful}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FAQWidget;