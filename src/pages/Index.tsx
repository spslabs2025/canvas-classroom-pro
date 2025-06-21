
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from 'react-router-dom';
import { Play, Video, Mic, PenTool, Share2, Crown, Check } from 'lucide-react';

const Index = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        navigate('/dashboard');
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
        navigate('/dashboard');
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      if (error) throw error;
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  const features = [
    {
      icon: <Video className="h-8 w-8 text-blue-500" />,
      title: "Record Everything",
      description: "Capture webcam, audio, and whiteboard simultaneously with professional quality"
    },
    {
      icon: <PenTool className="h-8 w-8 text-purple-500" />,
      title: "Interactive Whiteboard",
      description: "Draw, annotate, and import PDFs with multi-slide support and professional templates"
    },
    {
      icon: <Mic className="h-8 w-8 text-green-500" />,
      title: "AI Subtitles",
      description: "Generate accurate subtitles automatically using advanced AI transcription"
    },
    {
      icon: <Share2 className="h-8 w-8 text-orange-500" />,
      title: "Export & Share",
      description: "Export videos with burned-in subtitles, watermarks, and custom branding"
    }
  ];

  const pricingFeatures = [
    "Unlimited recordings",
    "AI-powered subtitles",
    "Custom branding & watermarks",
    "Multi-slide whiteboard",
    "HD video export",
    "Cloud storage",
    "Priority support"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Play className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              TutorBox
            </span>
          </div>
          <Button onClick={handleGoogleSignIn} size="lg" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
            Start Free Trial
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent leading-tight">
            AI-Powered Teaching Studio
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
            Create professional educational videos with webcam recording, interactive whiteboards, 
            and AI-generated subtitles. Everything you need in one powerful platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button 
              onClick={handleGoogleSignIn}
              size="lg" 
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-lg px-8 py-6 h-auto"
            >
              <Play className="mr-2 h-5 w-5" />
              Start Free 14-Day Trial
            </Button>
            <p className="text-sm text-gray-500">No credit card required</p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-gray-900">Everything You Need to Teach</h2>
          <p className="text-xl text-gray-600">Professional tools designed specifically for educators and online tutors</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-lg bg-white/60 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-3 bg-gray-50 rounded-full w-fit">
                  {feature.icon}
                </div>
                <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-gray-600">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-gray-900">Simple, Transparent Pricing</h2>
          <p className="text-xl text-gray-600">Start with a free trial, upgrade when you're ready</p>
        </div>
        
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          {/* Free Trial */}
          <Card className="border-2 border-gray-200 bg-white">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold">Free Trial</CardTitle>
              <div className="text-4xl font-bold text-gray-900 mt-4">₹0</div>
              <CardDescription className="text-lg">14 days free</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {pricingFeatures.slice(0, 4).map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              <Button onClick={handleGoogleSignIn} className="w-full mt-6">
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
              <div className="text-4xl font-bold text-gray-900 mt-4">₹3,000</div>
              <CardDescription className="text-lg">per month</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {pricingFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              <Button onClick={handleGoogleSignIn} className="w-full mt-6 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
                Upgrade to Pro
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 border-0 text-white">
          <CardContent className="text-center py-16">
            <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Teaching?</h2>
            <p className="text-xl mb-8 text-blue-100">
              Join thousands of educators creating professional content with TutorBox
            </p>
            <Button 
              onClick={handleGoogleSignIn}
              size="lg" 
              variant="secondary"
              className="bg-white text-purple-600 hover:bg-gray-100 text-lg px-8 py-6 h-auto"
            >
              <Play className="mr-2 h-5 w-5" />
              Start Your Free Trial Now
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Play className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-bold">TutorBox</span>
          </div>
          <p className="text-gray-400">© 2024 TutorBox. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
