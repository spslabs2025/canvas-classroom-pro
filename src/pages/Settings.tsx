
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Crown, Calendar } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  email: string;
  name: string;
  trial_start: string;
  is_pro: boolean;
}

interface Branding {
  user_id: string;
  name: string;
  logo_url: string;
  position: string;
  opacity: number;
  font: string;
  color: string;
}

const Settings = () => {
  const [user, setUser] = useState<User | null>(null);
  const [branding, setBranding] = useState<Branding | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchUserData();
    fetchBrandingData();
  }, []);

  const fetchUserData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate('/');
        return;
      }

      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) throw error;
      setUser(userData);
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBrandingData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data, error } = await supabase
        .from('branding')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setBranding(data || {
        user_id: session.user.id,
        name: '',
        logo_url: '',
        position: 'bottom-right',
        opacity: 0.8,
        font: 'Inter',
        color: '#ffffff'
      });
    } catch (error) {
      console.error('Error fetching branding:', error);
    }
  };

  const saveBranding = async () => {
    if (!branding || !user) return;

    try {
      const { error } = await supabase
        .from('branding')
        .upsert(branding);

      if (error) throw error;

      toast({
        title: "Settings saved!",
        description: "Your branding preferences have been updated.",
      });
    } catch (error) {
      console.error('Error saving branding:', error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getTrialDaysLeft = () => {
    if (!user?.trial_start || user.is_pro) return null;
    const trialStart = new Date(user.trial_start);
    const now = new Date();
    const daysUsed = Math.floor((now.getTime() - trialStart.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, 14 - daysUsed);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Button>
          
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Settings
          </h1>
          
          <Button onClick={handleSignOut} variant="outline">
            Sign Out
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid gap-6">
          {/* Account Info */}
          <Card className="bg-white/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Crown className={`h-5 w-5 mr-2 ${user?.is_pro ? 'text-yellow-500' : 'text-gray-400'}`} />
                Account Information
              </CardTitle>
              <CardDescription>
                Your account details and subscription status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Email</Label>
                  <Input value={user?.email || ''} disabled />
                </div>
                <div>
                  <Label>Name</Label>
                  <Input value={user?.name || ''} disabled />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Account Status</Label>
                  <div className={`text-lg font-semibold ${user?.is_pro ? 'text-green-600' : 'text-orange-600'}`}>
                    {user?.is_pro ? 'Pro Creator' : 'Free Trial'}
                  </div>
                </div>
                {!user?.is_pro && (
                  <div>
                    <Label>Trial Days Remaining</Label>
                    <div className="text-lg font-semibold text-orange-600 flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {getTrialDaysLeft()} days
                    </div>
                  </div>
                )}
              </div>

              {!user?.is_pro && (
                <Button 
                  onClick={() => navigate('/upgrade')}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Upgrade to Pro
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Branding Settings */}
          <Card className="bg-white/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Branding & Watermark</CardTitle>
              <CardDescription>
                Customize your video watermarks and branding
                {!user?.is_pro && (
                  <span className="text-orange-600 font-medium"> (Pro feature)</span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="brand-name">Brand Name</Label>
                  <Input
                    id="brand-name"
                    value={branding?.name || ''}
                    onChange={(e) => setBranding(prev => prev ? {...prev, name: e.target.value} : null)}
                    disabled={!user?.is_pro}
                    placeholder="Your brand name"
                  />
                </div>
                <div>
                  <Label htmlFor="watermark-position">Watermark Position</Label>
                  <select
                    id="watermark-position"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={branding?.position || 'bottom-right'}
                    onChange={(e) => setBranding(prev => prev ? {...prev, position: e.target.value} : null)}
                    disabled={!user?.is_pro}
                  >
                    <option value="top-left">Top Left</option>
                    <option value="top-right">Top Right</option>
                    <option value="bottom-left">Bottom Left</option>
                    <option value="bottom-right">Bottom Right</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="watermark-color">Watermark Color</Label>
                  <Input
                    id="watermark-color"
                    type="color"
                    value={branding?.color || '#ffffff'}
                    onChange={(e) => setBranding(prev => prev ? {...prev, color: e.target.value} : null)}
                    disabled={!user?.is_pro}
                  />
                </div>
                <div>
                  <Label htmlFor="watermark-opacity">Opacity ({Math.round((branding?.opacity || 0.8) * 100)}%)</Label>
                  <Input
                    id="watermark-opacity"
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={branding?.opacity || 0.8}
                    onChange={(e) => setBranding(prev => prev ? {...prev, opacity: parseFloat(e.target.value)} : null)}
                    disabled={!user?.is_pro}
                  />
                </div>
              </div>

              <Button 
                onClick={saveBranding} 
                disabled={!user?.is_pro}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Branding Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
