
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const usePayment = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const createPayment = async (amount: number, planType: string) => {
    try {
      setLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('User not authenticated');
      }

      const response = await fetch('/supabase/functions/v1/create-payment', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount, planType }),
      });

      const paymentData = await response.json();
      
      if (!response.ok) {
        throw new Error(paymentData.error);
      }

      return paymentData;
    } catch (error: any) {
      console.error('Payment creation error:', error);
      toast({
        title: "Payment Error",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const initiatePayment = async (amount: number, planType: string) => {
    try {
      const paymentData = await createPayment(amount, planType);
      
      const options = {
        key: paymentData.keyId,
        amount: paymentData.amount,
        currency: paymentData.currency,
        order_id: paymentData.orderId,
        name: "TutorBox",
        description: `${planType} Plan Subscription`,
        handler: async (response: any) => {
          await verifyPayment(response);
        },
        prefill: {
          email: (await supabase.auth.getUser()).data.user?.email,
        },
        theme: {
          color: "#3B82F6"
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment initiation error:', error);
    }
  };

  const verifyPayment = async (paymentResponse: any) => {
    try {
      setLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('User not authenticated');
      }

      const response = await fetch('/supabase/functions/v1/verify-payment', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentResponse),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error);
      }

      toast({
        title: "Payment Successful!",
        description: "Your subscription has been activated.",
      });

      // Refresh the page to update user status
      window.location.reload();
    } catch (error: any) {
      console.error('Payment verification error:', error);
      toast({
        title: "Payment Verification Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return { initiatePayment, loading };
};
