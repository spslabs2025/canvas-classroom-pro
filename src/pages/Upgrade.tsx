
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Crown, Zap, Star, Play } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import PaymentModal from '@/components/PaymentModal';
import Footer from '@/components/Footer';

const Upgrade = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const features = [
    { name: 'Recording Duration', free: '5 minutes', pro: 'Unlimited' },
    { name: 'Video Quality', free: '720p', pro: 'HD 1080p' },
    { name: 'Audio Processing', free: 'Basic', pro: 'Advanced AI Enhancement' },
    { name: 'Custom Branding', free: '❌', pro: '✅ Logo & Watermark' },
    { name: 'PDF Import', free: '❌', pro: '✅ Unlimited' },
    { name: 'Cloud Storage', free: '100MB', pro: '10GB' },
    { name: 'Export Formats', free: 'MP4 only', pro: 'MP4, WebM, MOV' },
    { name: 'Priority Support', free: '❌', pro: '✅ 24/7 Support' },
    { name: 'Analytics', free: '❌', pro: '✅ Detailed Insights' },
    { name: 'Team Collaboration', free: '❌', pro: '✅ Share & Collaborate' }
  ];

  const testimonials = [
    {
      name: "Priya Sharma",
      role: "Math Teacher",
      content: "TutorBox Pro transformed my online teaching. The HD quality and audio enhancement make my lessons so much more professional!"
    },
    {
      name: "Rahul Kumar",
      role: "Coding Instructor",
      content: "The screen recording with PDF annotation is perfect for my programming tutorials. Students love the clarity!"
    },
    {
      name: "Anita Gupta",
      role: "Language Coach",
      content: "Custom branding helps me maintain my professional image. The unlimited recording time is a game-changer!"
    }
  ];

  if (profile?.is_pro) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col">
        {/* Header */}
        <header className="bg-white/90 backdrop-blur-sm border-b border-blue-100">
          <div className="container mx-auto px-4 py-4 flex items-center">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Button>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center">
          <Card className="max-w-md mx-4 bg-white/70 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="text-center">
              <div className="mx-auto h-16 w-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-4">
                <Crown className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-green-600">
                You're Already Pro! 🎉
              </CardTitle>
              <CardDescription className="text-base">
                You have access to all premium features. Start creating amazing lessons!
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button
                onClick={() => navigate('/dashboard')}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
              >
                <Play className="h-4 w-4 mr-2" />
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Button>
          
          <div className="flex items-center space-x-2">
            <Crown className="h-6 w-6 text-yellow-500" />
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Upgrade to Pro
            </span>
          </div>
        </div>
      </header>

      <div className="flex-1 container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center space-y-6 mb-12">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Unlock Your Teaching
            <br />
            Potential
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Create professional-quality lessons with unlimited recording, HD video, and advanced features that make your content stand out.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Badge variant="secondary" className="text-sm">
              🚀 Used by 50,000+ educators
            </Badge>
            <Badge variant="secondary" className="text-sm">
              ⭐ 4.9/5 rating
            </Badge>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {/* Free Plan */}
          <Card className="bg-white/70 backdrop-blur-sm border-2 border-gray-200">
            <CardHeader>
              <CardTitle className="text-center text-2xl">Free Plan</CardTitle>
              <CardDescription className="text-center">Perfect for trying out</CardDescription>
              <div className="text-center text-4xl font-bold text-gray-600">₹0</div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />5-minute recordings</li>
                <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />720p video quality</li>
                <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />Basic features</li>
                <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />100MB storage</li>
              </ul>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-300 relative">
            <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              Most Popular
            </Badge>
            <CardHeader>
              <CardTitle className="text-center text-2xl flex items-center justify-center space-x-2">
                <Crown className="h-6 w-6 text-yellow-500" />
                <span>Pro Plan</span>
              </CardTitle>
              <CardDescription className="text-center">Everything you need</CardDescription>
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  ₹999
                </div>
                <div className="text-sm text-gray-600">per month</div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />Unlimited recording</li>
                <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />HD 1080p quality</li>
                <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />Advanced audio processing</li>
                <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />Custom branding</li>
                <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />PDF import & annotation</li>
                <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />10GB cloud storage</li>
                <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />Priority support</li>
              </ul>
              <Button
                onClick={() => setShowPaymentModal(true)}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium"
              >
                <Zap className="h-4 w-4 mr-2" />
                Upgrade Now
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Feature Comparison */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Feature Comparison</h2>
          <Card className="bg-white/70 backdrop-blur-sm">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-4 font-semibold">Feature</th>
                      <th className="text-center p-4 font-semibold">Free</th>
                      <th className="text-center p-4 font-semibold text-blue-600">Pro</th>
                    </tr>
                  </thead>
                  <tbody>
                    {features.map((feature, index) => (
                      <tr key={index} className="border-t">
                        <td className="p-4 font-medium">{feature.name}</td>
                        <td className="p-4 text-center text-gray-600">{feature.free}</td>
                        <td className="p-4 text-center text-blue-600 font-medium">{feature.pro}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Testimonials */}
        <div className="max-w-6xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">What Educators Say</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-white/70 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4">"{testimonial.content}"</p>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center space-y-6">
          <h2 className="text-3xl font-bold">Ready to Transform Your Teaching?</h2>
          <p className="text-xl text-gray-600">Join thousands of educators creating professional content with TutorBox Pro.</p>
          <Button
            onClick={() => setShowPaymentModal(true)}
            size="lg"
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium px-8 py-4 text-lg"
          >
            <Crown className="h-5 w-5 mr-2" />
            Start Your Pro Journey
          </Button>
        </div>
      </div>

      <Footer />
      
      <PaymentModal 
        open={showPaymentModal}
        onOpenChange={setShowPaymentModal}
      />
    </div>
  );
};

export default Upgrade;
