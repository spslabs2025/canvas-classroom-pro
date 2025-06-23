
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';
import { Play, Video, Mic, PenTool, Share2, Crown, Check, Zap, Users, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Add a small delay to ensure smooth loading
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Only redirect if we're sure the user is authenticated and page is loaded
    if (!loading && user && isLoaded) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate, isLoaded]);

  const handleStartTrial = () => {
    navigate('/auth');
  };

  const features = [
    {
      icon: <Video className="h-8 w-8 text-blue-500" />,
      title: "HD Recording",
      description: "Crystal clear webcam and screen recording with professional quality output"
    },
    {
      icon: <PenTool className="h-8 w-8 text-purple-500" />,
      title: "Smart Whiteboard",
      description: "Infinite canvas with advanced drawing tools, shapes, and PDF import capabilities"
    },
    {
      icon: <Mic className="h-8 w-8 text-green-500" />,
      title: "AI Transcription",
      description: "Automatic subtitle generation with 99% accuracy using advanced AI models"
    },
    {
      icon: <Share2 className="h-8 w-8 text-orange-500" />,
      title: "One-Click Export",
      description: "Export with custom branding, watermarks, and multiple format support"
    }
  ];

  const stats = [
    { icon: <Users className="h-6 w-6 text-blue-500" />, label: "Educators", value: "10,000+" },
    { icon: <Play className="h-6 w-6 text-green-500" />, label: "Videos Created", value: "50,000+" },
    { icon: <Zap className="h-6 w-6 text-yellow-500" />, label: "Hours Saved", value: "100,000+" }
  ];

  // Show loading state briefly
  if (loading || !isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Play className="h-6 w-6 text-white" />
          </div>
          <p className="text-gray-600">Loading TutorBox...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Play className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              TutorBox
            </span>
          </div>
          <Button 
            onClick={handleStartTrial}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            Start Free Trial
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 bg-clip-text text-transparent leading-tight">
            Create Professional
            <br />
            <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              Educational Videos
            </span>
          </h1>
          <p className="text-xl text-slate-600 mb-8 leading-relaxed max-w-2xl mx-auto">
            The complete teaching studio with webcam recording, infinite whiteboard, 
            and AI-powered features. Everything you need in one platform.
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mb-12 max-w-2xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-2">
                  {stat.icon}
                </div>
                <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                <div className="text-sm text-slate-600">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Button 
              onClick={handleStartTrial}
              size="lg" 
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-lg px-8 py-6 h-auto"
            >
              <Play className="mr-2 h-5 w-5" />
              Start Free 14-Day Trial
            </Button>
            <p className="text-sm text-slate-500">No credit card required • 2 minutes setup</p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-slate-900">Everything You Need to Teach</h2>
          <p className="text-xl text-slate-600">Professional tools designed for modern educators</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-lg bg-white/60 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-3 bg-slate-50 rounded-full w-fit">
                  {feature.icon}
                </div>
                <CardTitle className="text-lg font-semibold">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-slate-600">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-slate-900">Simple, Transparent Pricing</h2>
          <p className="text-xl text-slate-600">Start free, upgrade when you're ready</p>
        </div>
        
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Free Trial */}
          <Card className="border-2 border-slate-200 bg-white">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold">Free Trial</CardTitle>
              <div className="text-4xl font-bold text-slate-900 mt-4">₹0</div>
              <CardDescription className="text-lg">14 days free</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {['HD Recording', 'Smart Whiteboard', 'AI Subtitles', 'Basic Export'].map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              <Button onClick={handleStartTrial} className="w-full mt-6">
                Start Free Trial
              </Button>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className="border-2 border-purple-500 bg-gradient-to-br from-purple-50 to-blue-50 relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center">
                <Crown className="h-4 w-4 mr-1" />
                Most Popular
              </div>
            </div>
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold">Pro Creator</CardTitle>
              <div className="text-4xl font-bold text-slate-900 mt-4">₹2,999</div>
              <CardDescription className="text-lg">per month</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {['Unlimited Recording', 'Advanced Whiteboard', 'AI Subtitles', 'Custom Branding', 'HD Export', 'Cloud Storage', 'Priority Support'].map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              <Button 
                onClick={() => navigate('/upgrade')} 
                className="w-full mt-6 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
              >
                Upgrade to Pro
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 border-0 text-white">
          <CardContent className="text-center py-16 px-8">
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Teaching?</h2>
            <p className="text-xl mb-8 text-blue-100">
              Join thousands of educators creating professional content with TutorBox
            </p>
            <Button 
              onClick={handleStartTrial}
              size="lg" 
              variant="secondary"
              className="bg-white text-purple-600 hover:bg-slate-100 text-lg px-8 py-6 h-auto"
            >
              <Play className="mr-2 h-5 w-5" />
              Start Your Free Trial Now
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Play className="h-4 w-4 text-white" />
            </div>
            <span className="text-2xl font-bold">TutorBox</span>
          </div>
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Shield className="h-4 w-4 text-green-400" />
            <span className="text-slate-400">Secure & Reliable</span>
          </div>
          <p className="text-slate-400">© 2024 TutorBox. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
