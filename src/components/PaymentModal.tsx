
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Zap, Star } from 'lucide-react';
import { usePayment } from '@/hooks/usePayment';

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PaymentModal = ({ open, onOpenChange }: PaymentModalProps) => {
  const { initiatePayment, loading } = usePayment();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const plans = {
    monthly: {
      name: 'Pro Monthly',
      price: 999,
      originalPrice: 1499,
      description: 'Perfect for getting started',
      period: 'month',
      savings: 33
    },
    yearly: {
      name: 'Pro Yearly',
      price: 9999,
      originalPrice: 17988,
      description: 'Best value for serious creators',
      period: 'year',
      savings: 44
    }
  };

  const features = [
    'Unlimited lesson recordings',
    'HD video quality up to 1080p',
    'Advanced audio processing',
    'Custom branding & watermarks',
    'PDF import & annotation',
    'Screen + webcam recording',
    'Cloud storage & backup',
    'Priority support',
    'Export in multiple formats',
    'Analytics & insights'
  ];

  const handlePayment = async () => {
    const plan = plans[selectedPlan];
    await initiatePayment(plan.price, plan.name);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Upgrade to TutorBox Pro
          </DialogTitle>
          <DialogDescription className="text-center text-lg">
            Unlock all premium features and create professional lessons without limits
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Plan Selection */}
          <div className="flex justify-center space-x-4">
            {Object.entries(plans).map(([key, plan]) => (
              <Card 
                key={key}
                className={`cursor-pointer transition-all ${
                  selectedPlan === key 
                    ? 'ring-2 ring-blue-500 shadow-lg scale-105' 
                    : 'hover:shadow-md'
                }`}
                onClick={() => setSelectedPlan(key as 'monthly' | 'yearly')}
              >
                <CardHeader className="text-center pb-2">
                  <div className="flex items-center justify-center space-x-2">
                    {key === 'yearly' && <Crown className="h-5 w-5 text-yellow-500" />}
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    {key === 'yearly' && <Badge variant="secondary">Popular</Badge>}
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="space-y-2">
                    <div className="text-3xl font-bold text-green-600">
                      ₹{plan.price.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500 line-through">
                      ₹{plan.originalPrice.toLocaleString()}
                    </div>
                    <div className="text-sm font-medium text-orange-600">
                      Save {plan.savings}%
                    </div>
                    <div className="text-xs text-gray-600">
                      per {plan.period}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <span>What's Included</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Payment Button */}
          <div className="flex justify-center space-x-4">
            <Button
              onClick={handlePayment}
              disabled={loading}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium px-8 py-3 text-lg"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Zap className="h-5 w-5 mr-2" />
                  Upgrade Now - ₹{plans[selectedPlan].price.toLocaleString()}
                </>
              )}
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="text-center space-y-2 text-sm text-gray-600">
            <p>🔒 Secure payment powered by Razorpay</p>
            <p>💳 All major cards accepted</p>
            <p>✨ Instant activation after payment</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
