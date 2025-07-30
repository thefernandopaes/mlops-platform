
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/auth-context';
import { 
  Loader2, 
  Play, 
  CheckCircle, 
  ArrowRight, 
  Bot, 
  Rocket, 
  BarChart3, 
  Users, 
  Code, 
  Brain, 
  Shield, 
  Building,
  Github,
  Linkedin,
  Twitter,
  ChevronDown
} from 'lucide-react';

export default function LandingPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [isAnnual, setIsAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return null; // Will redirect to dashboard
  }

  const pricingPlans = [
    {
      name: "Starter",
      price: "Free",
      period: "",
      description: "Perfect for individual developers and small experiments",
      features: [
        "Up to 3 models",
        "Basic experiment tracking",
        "Community support",
        "5GB storage",
        "Basic monitoring"
      ],
      cta: "Start Free",
      popular: false
    },
    {
      name: "Professional",
      price: isAnnual ? "$159" : "$199",
      period: "/user/month",
      originalPrice: isAnnual ? "$199" : null,
      description: "For growing teams and production workloads",
      features: [
        "Unlimited models",
        "Advanced experiment tracking",
        "Priority support",
        "100GB storage",
        "Real-time monitoring",
        "Team collaboration",
        "Custom deployments"
      ],
      cta: "Start Trial",
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "For large organizations with advanced needs",
      features: [
        "Everything in Professional",
        "Unlimited storage",
        "On-premise deployment",
        "24/7 dedicated support",
        "Custom integrations",
        "Advanced security",
        "SLA guarantees"
      ],
      cta: "Contact Sales",
      popular: false
    }
  ];

  const faqs = [
    {
      question: "How does the free trial work?",
      answer: "Start with our Professional plan free for 14 days. No credit card required. You can downgrade to the free Starter plan anytime."
    },
    {
      question: "Can I cancel my subscription anytime?",
      answer: "Yes, you can cancel your subscription at any time. Your account will remain active until the end of your billing period."
    },
    {
      question: "Do you offer on-premise deployment?",
      answer: "Yes, our Enterprise plan includes on-premise deployment options with full support and customization."
    },
    {
      question: "What kind of models do you support?",
      answer: "We support all major ML frameworks including TensorFlow, PyTorch, Scikit-learn, XGBoost, and more. Custom model formats are also supported."
    },
    {
      question: "How secure is my data?",
      answer: "We use enterprise-grade security with encryption at rest and in transit, SOC 2 compliance, and regular security audits."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b bg-white/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg"></div>
              <span className="text-xl font-bold text-gray-900">MLOps Platform</span>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
              <Link href="/auth/login" className="text-gray-600 hover:text-gray-900 transition-colors">Login</Link>
            </nav>
            
            <Link href="/auth/register">
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                Start building free
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Deploy AI models in 
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> minutes</span>,
              not months
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Complete MLOps platform for teams. From experiment to production with enterprise-grade monitoring and governance.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/auth/register">
                <Button size="lg" className="px-8 py-4 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  Start free trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="px-8 py-4 text-lg">
                <Play className="mr-2 h-5 w-5" />
                Watch demo
              </Button>
            </div>
            
            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-8 shadow-lg border">
              <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center mb-4">
                <div className="text-center">
                  <Play className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Platform Walkthrough (30 seconds)</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                <CheckCircle className="inline h-4 w-4 text-green-500 mr-1" />
                Trusted by 500+ ML teams
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything you need for MLOps</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From model development to production monitoring, we've got you covered
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Bot className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Model Registry</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Version control for AI models with comprehensive metadata tracking and lineage
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Rocket className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>One-click Deploy</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Production deployment in minutes with auto-scaling and monitoring
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Real-time Monitoring</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Performance and drift detection with intelligent alerting and insights
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle>Team Collaboration</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Multi-tenant workspace with role-based access and project management
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Built for every role</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Whether you're an individual contributor or managing an entire AI organization
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
              <Code className="h-8 w-8 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">ML Engineers</h3>
              <p className="text-gray-600 mb-4">"Focus on models, not infrastructure"</p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Automated CI/CD pipelines</li>
                <li>• Infrastructure abstraction</li>
                <li>• Seamless deployments</li>
              </ul>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
              <Brain className="h-8 w-8 text-green-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Data Scientists</h3>
              <p className="text-gray-600 mb-4">"From notebook to production seamlessly"</p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Experiment tracking</li>
                <li>• Model comparison</li>
                <li>• One-click deployment</li>
              </ul>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
              <Shield className="h-8 w-8 text-purple-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Engineering Managers</h3>
              <p className="text-gray-600 mb-4">"Govern AI with confidence"</p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Compliance monitoring</li>
                <li>• Risk management</li>
                <li>• Team productivity</li>
              </ul>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
              <Building className="h-8 w-8 text-orange-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">CTOs</h3>
              <p className="text-gray-600 mb-4">"Scale AI across your organization"</p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Enterprise governance</li>
                <li>• Cost optimization</li>
                <li>• Strategic insights</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple, transparent pricing</h2>
            <p className="text-xl text-gray-600 mb-8">Choose the plan that fits your team's needs</p>
            
            <div className="flex items-center justify-center space-x-4 mb-8">
              <span className={`text-sm ${!isAnnual ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>Monthly</span>
              <button
                onClick={() => setIsAnnual(!isAnnual)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isAnnual ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isAnnual ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-sm ${isAnnual ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                Annual
                <Badge variant="secondary" className="ml-1">20% off</Badge>
              </span>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={`relative ${plan.popular ? 'border-blue-500 shadow-lg scale-105' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-600">Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="flex items-baseline justify-center space-x-1">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    {plan.originalPrice && (
                      <span className="text-lg text-gray-500 line-through">{plan.originalPrice}</span>
                    )}
                    <span className="text-gray-600">{plan.period}</span>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        <span className="text-sm text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full ${plan.popular ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                    variant={plan.popular ? 'default' : 'outline'}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* FAQ */}
          <div className="mt-20 max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h3>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="border rounded-lg">
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50"
                  >
                    <span className="font-medium">{faq.question}</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${openFaq === index ? 'rotate-180' : ''}`} />
                  </button>
                  {openFaq === index && (
                    <div className="px-6 pb-4 text-gray-600">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg"></div>
                <span className="text-xl font-bold">MLOps Platform</span>
              </div>
              <p className="text-gray-400 mb-4">
                The complete platform for machine learning model lifecycle management.
              </p>
              <div className="flex space-x-4">
                <Github className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
                <Linkedin className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
                <Twitter className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">API Docs</a></li>
                <li><a href="#" className="hover:text-white">Integrations</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Documentation</a></li>
                <li><a href="#" className="hover:text-white">Support</a></li>
                <li><a href="#" className="hover:text-white">Community</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 MLOps Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
