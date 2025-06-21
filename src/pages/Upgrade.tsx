
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Crown, Check, Zap } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const Upgrade = () => {
  const [promoCode, setPromoCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const features = [
    "Unlimited recordings",
    "AI-powered subtitle generation",
    "Custom branding & watermarks",
    "HD video export (1080p)",
    "Multi-slide whiteboard",
    "PDF & image import",
    "Cloud storage",
    "Priority support"
  ];

  const handleUpgrade = async () => {
    setIsLoading(true);
    
    // Simulate payment processing
    setTimeout(() => {
      toast({
        title: "Payment processing",
        description: "Razorpay integration coming soon! This is a demo.",
      });
      setIsLoading(false);
    }, 2000);
  };

  const applyPromoCode = async () => {
    if (!promoCode.trim()) return;

    // Simulate promo code validation
    const validCodes = ['WELCOME10', 'FLAT500', 'EXTRA7'];
    if (validCodes.includes(promoCode.toUpperCase())) {
      toast({
        title: "Promo code applied!",
        description: `Code "${promoCode}" has been applied to your order.`,
      });
    } else {
      toast({
        title: "Invalid promo code",
        description: "Please check your promo code and try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100">
        <div className="container mx-auto px-4 py-4">
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

      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Upgrade to Pro
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Unlock the full power of TutorBox with professional features designed for serious educators
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid lg:grid-cols-2 gap-8">
          {/* Features */}
          <Card className="bg-white/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center">
                <Zap className="h-6 w-6 mr-2 text-yellow-500" />
                Pro Features
              </CardTitle>
              <CardDescription>
                Everything you need to create professional educational content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card className="bg-gradient-to-br from-purple-500 to-blue-500 text-white">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4">
                <Crown className="h-12 w-12 text-yellow-300" />
              </div>
              <CardTitle className="text-3xl">Pro Creator Plan</CardTitle>
              <div className="text-5xl font-bold mt-4">₹3,000</div>
              <CardDescription className="text-purple-100 text-lg">
                per month
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Promo Code */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <Label htmlFor="promo-code" className="text-white">
                  Have a promo code?
                </Label>
                <div className="flex mt-2 space-x-2">
                  <Input
                    id="promo-code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter code"
                    className="bg-white/20 border-white/30 text-white placeholder-white/70"
                  />
                  <Button
                    onClick={applyPromoCode}
                    variant="secondary"
                    size="sm"
                  >
                    Apply
                  </Button>
                </div>
              </div>

              {/* Payment Button */}
              <Button
                onClick={handleUpgrade}
                disabled={isLoading}
                size="lg"
                className="w-full bg-white text-purple-600 hover:bg-gray-100 text-lg py-6"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600 mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  <>
                    <Crown className="h-5 w-5 mr-2" />
                    Upgrade Now
                  </>
                )}
              </Button>

              <div className="text-center text-purple-100 text-sm">
                <p>✓ 30-day money-back guarantee</p>
                <p>✓ Cancel anytime</p>
                <p>✓ Instant access to all features</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Benefits */}
        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Why Upgrade to Pro?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="pt-6 text-center">
                <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Crown className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Professional Quality</h3>
                <p className="text-gray-600">
                  Create broadcast-quality educational videos with HD export and custom branding
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="pt-6 text-center">
                <div className="h-12 w-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Save Time</h3>
                <p className="text-gray-600">
                  AI-powered subtitles and smart export features cut your editing time in half
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="pt-6 text-center">
                <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Check className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Unlimited Access</h3>
                <p className="text-gray-600">
                  No limits on recordings, exports, or cloud storage for your educational content
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upgrade;
