
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = await req.json()
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { auth: { persistSession: false } }
    )

    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabaseClient.auth.getUser(token)

    if (!user) {
      throw new Error('User not authenticated')
    }

    // Verify signature
    const razorpayKeySecret = 'BABspg5VkKFoezYi6YxCN1kT'
    const expectedSignature = await crypto.subtle.sign(
      "HMAC", 
      await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(razorpayKeySecret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      ),
      new TextEncoder().encode(`${razorpay_order_id}|${razorpay_payment_id}`)
    )

    const expectedSignatureHex = Array.from(new Uint8Array(expectedSignature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    if (expectedSignatureHex !== razorpay_signature) {
      throw new Error('Invalid payment signature')
    }

    // Update payment status
    await supabaseClient
      .from('payments')
      .update({
        razorpay_payment_id: razorpay_payment_id,
        status: 'completed'
      })
      .eq('razorpay_order_id', razorpay_order_id)
      .eq('user_id', user.id)

    // Update user subscription
    const subscriptionEndDate = new Date()
    subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + 1)

    await supabaseClient
      .from('users')
      .update({
        is_pro: true,
        subscription_status: 'active',
        subscription_end_date: subscriptionEndDate.toISOString()
      })
      .eq('id', user.id)

    return new Response(
      JSON.stringify({ success: true, message: 'Payment verified successfully' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Payment verification error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
