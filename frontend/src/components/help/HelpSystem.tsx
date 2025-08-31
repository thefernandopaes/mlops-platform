import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Button,
  Input,
  Card,
  CardContent,
  CardHeader,
  Badge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui';
import {
  Search,
  BookOpen,
  MessageCircle,
  Video,
  FileText,
  ExternalLink,
  Star,
  ChevronRight,
  Lightbulb,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface HelpArticle {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  lastUpdated: string;
  helpful: number;
  notHelpful: number;
}

interface HelpSystemProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
  initialCategory?: string;
}

export const HelpSystem: React.FC<HelpSystemProps> = ({
  isOpen,
  onClose,
  initialQuery = '',
  initialCategory = 'all'
}) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null);
  const [searchResults, setSearchResults] = useState<HelpArticle[]>([]);

  // Mock help articles - in real implementation, these would come from a CMS or API
  const helpArticles: HelpArticle[] = [
    {
      id: 'getting-started',
      title: 'Getting Started with MLOps Platform',
      description: 'Learn the basics of creating projects, managing models, and running experiments',
      content: `
        # Getting Started Guide

        Welcome to MLOps Platform! This guide will help you get up and running quickly.

        ## 1. Create Your First Project
        Projects are containers for your ML work. They include:
        - Models and their versions
        - Experiments and runs
        - Deployments and monitoring
        - Team collaboration

        **To create a project:**
        1. Navigate to Projects → New Project
        2. Fill in project details (name, description, tags)
        3. Choose your team members and permissions
        4. Click "Create Project"

        ## 2. Register Your First Model
        The Model Registry helps you version and manage your ML models.

        **To register a model:**
        1. Go to Models → Register New Model
        2. Upload your model file (pkl, joblib, h5, etc.)
        3. Define input/output schema
        4. Add metadata and documentation
        5. Set the model stage (Development, Staging, Production)

        ## 3. Track Experiments
        Use experiments to systematically improve your models.

        **To start an experiment:**
        1. Navigate to Experiments → New Experiment
        2. Configure experiment parameters
        3. Run your training code with our tracking SDK
        4. Compare results and select the best model

        ## Next Steps
        - Explore the API documentation
        - Set up monitoring and alerts
        - Deploy your first model
      `,
      category: 'getting-started',
      tags: ['beginner', 'tutorial', 'projects', 'models'],
      difficulty: 'beginner',
      estimatedTime: '10 minutes',
      lastUpdated: '2025-08-30',
      helpful: 42,
      notHelpful: 3
    },
    {
      id: 'api-keys',
      title: 'Managing API Keys',
      description: 'Create and manage API keys for programmatic access to the platform',
      content: `
        # API Key Management

        API keys provide secure programmatic access to MLOps Platform services.

        ## Creating API Keys

        1. Go to Settings → API Keys
        2. Click "Create New API Key"
        3. Set a descriptive name
        4. Configure permissions:
           - **Inference**: Make predictions
           - **Models**: Read model information
           - **Experiments**: Read experiment data
           - **Monitoring**: Access metrics and logs
        5. Set expiration date (optional)
        6. Copy the generated key (shown only once!)

        ## Security Best Practices

        ⚠️ **Important Security Tips:**
        - Store API keys securely (environment variables, secrets manager)
        - Use principle of least privilege (minimal permissions needed)
        - Rotate keys regularly
        - Monitor key usage and set up alerts
        - Never commit keys to version control

        ## Using API Keys

        Include the API key in the Authorization header:
        \`\`\`bash
        curl -H "Authorization: Bearer mk_your_api_key_here" \\
             https://api.mlops-platform.com/v1/inference/my-model
        \`\`\`

        ## Monitoring Usage

        Track your API key usage in the dashboard:
        - Request counts and rate limits
        - Success/error rates
        - Usage by endpoint
        - Historical trends
      `,
      category: 'api',
      tags: ['security', 'authentication', 'api', 'intermediate'],
      difficulty: 'intermediate',
      estimatedTime: '5 minutes',
      lastUpdated: '2025-08-30',
      helpful: 28,
      notHelpful: 1
    },
    {
      id: 'model-deployment',
      title: 'Deploying Models to Production',
      description: 'Learn how to deploy models for real-time and batch inference',
      content: `
        # Model Deployment Guide

        Deploy your trained models for production inference.

        ## Deployment Types

        ### Real-time Inference
        - Low-latency predictions (< 100ms)
        - REST API endpoints
        - Auto-scaling based on traffic
        - Best for user-facing applications

        ### Batch Inference
        - High-throughput processing
        - Process large datasets
        - Scheduled or triggered jobs
        - Best for data pipelines

        ## Deployment Process

        1. **Select Model Version**
           - Choose a model in "Production" stage
           - Verify model performance metrics
           - Check compatibility requirements

        2. **Configure Deployment**
           - Set resource requirements (CPU, memory, GPU)
           - Configure auto-scaling parameters
           - Set environment variables
           - Define health check endpoints

        3. **Deploy and Monitor**
           - Deploy to staging first
           - Run validation tests
           - Monitor performance and errors
           - Promote to production when ready

        ## Best Practices

        - Use blue-green deployments for zero downtime
        - Implement proper health checks
        - Set up monitoring and alerting
        - Test with production-like data
        - Plan rollback strategies
      `,
      category: 'deployments',
      tags: ['deployment', 'production', 'monitoring', 'advanced'],
      difficulty: 'advanced',
      estimatedTime: '15 minutes',
      lastUpdated: '2025-08-30',
      helpful: 35,
      notHelpful: 2
    }
  ];

  const categories = [
    { id: 'all', name: 'All Topics', icon: BookOpen },
    { id: 'getting-started', name: 'Getting Started', icon: Star },
    { id: 'api', name: 'API & Integration', icon: FileText },
    { id: 'deployments', name: 'Deployments', icon: CheckCircle },
    { id: 'monitoring', name: 'Monitoring', icon: AlertCircle },
    { id: 'troubleshooting', name: 'Troubleshooting', icon: Lightbulb }
  ];

  // Search and filter articles
  useEffect(() => {
    let filtered = helpArticles;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(article => 
        article.category === selectedCategory ||
        article.tags.includes(selectedCategory)
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(query) ||
        article.description.toLowerCase().includes(query) ||
        article.tags.some(tag => tag.toLowerCase().includes(query)) ||
        article.content.toLowerCase().includes(query)
      );
    }

    setSearchResults(filtered);
  }, [searchQuery, selectedCategory]);

  const handleArticleSelect = (article: HelpArticle) => {
    setSelectedArticle(article);
  };

  const handleBackToSearch = () => {
    setSelectedArticle(null);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            {selectedArticle ? selectedArticle.title : 'Help & Documentation'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {selectedArticle ? (
            // Article view
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="ghost"
                  onClick={handleBackToSearch}
                  className="text-muted-foreground"
                >
                  ← Back to Help
                </Button>
                
                <div className="flex items-center gap-2">
                  <Badge className={getDifficultyColor(selectedArticle.difficulty)}>
                    {selectedArticle.difficulty}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {selectedArticle.estimatedTime}
                  </span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap">
                  {selectedArticle.content}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Was this helpful?
                  </span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      👍 Yes ({selectedArticle.helpful})
                    </Button>
                    <Button variant="outline" size="sm">
                      👎 No ({selectedArticle.notHelpful})
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Search view
            <div className="h-full flex flex-col">
              {/* Search Bar */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search documentation..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
                <TabsList className="grid w-full grid-cols-6 mb-6">
                  {categories.map((category) => (
                    <TabsTrigger
                      key={category.id}
                      value={category.id}
                      className="flex items-center gap-1 text-xs"
                    >
                      <category.icon className="h-3 w-3" />
                      {category.name}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent value={selectedCategory} className="flex-1 overflow-y-auto">
                  <div className="grid gap-4">
                    {searchResults.length === 0 ? (
                      <div className="text-center py-8">
                        <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-muted-foreground">
                          No articles found
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Try adjusting your search or browse different categories
                        </p>
                      </div>
                    ) : (
                      searchResults.map((article) => (
                        <Card
                          key={article.id}
                          className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => handleArticleSelect(article)}
                        >
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="font-medium text-sm mb-1">
                                  {article.title}
                                </h3>
                                <p className="text-xs text-muted-foreground mb-2">
                                  {article.description}
                                </p>
                                <div className="flex items-center gap-2">
                                  <Badge 
                                    className={getDifficultyColor(article.difficulty)}
                                    variant="secondary"
                                  >
                                    {article.difficulty}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {article.estimatedTime}
                                  </span>
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Star className="h-3 w-3" />
                                    {article.helpful}
                                  </div>
                                </div>
                              </div>
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </CardHeader>
                        </Card>
                      ))
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              {/* Quick Links */}
              <div className="mt-6 pt-4 border-t">
                <h4 className="text-sm font-medium mb-3">Quick Links</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start"
                    onClick={() => window.open('/docs/api', '_blank')}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    API Docs
                    <ExternalLink className="ml-auto h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start"
                    onClick={() => window.open('/docs/sdk', '_blank')}
                  >
                    <BookOpen className="mr-2 h-4 w-4" />
                    SDK Guide
                    <ExternalLink className="ml-auto h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start"
                    onClick={() => window.open('/support', '_blank')}
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Contact Support
                    <ExternalLink className="ml-auto h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start"
                    onClick={() => window.open('/docs/videos', '_blank')}
                  >
                    <Video className="mr-2 h-4 w-4" />
                    Video Tutorials
                    <ExternalLink className="ml-auto h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Contextual help component for specific features
interface ContextualHelpProps {
  topic: string;
  children: React.ReactNode;
}

export const ContextualHelp: React.FC<ContextualHelpProps> = ({
  topic,
  children
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="text-muted-foreground hover:text-foreground"
      >
        {children}
      </Button>
      
      <HelpSystem
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        initialQuery={topic}
      />
    </>
  );
};

// Help trigger component for global help access
export const HelpTrigger: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      // Open help with Ctrl/Cmd + ?
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, []);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2"
      >
        <BookOpen className="h-4 w-4" />
        Help
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <span className="text-xs">⌘</span>/
        </kbd>
      </Button>
      
      <HelpSystem
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
};

export default HelpSystem;