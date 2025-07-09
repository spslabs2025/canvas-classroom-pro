import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Crown, Calendar, User, Palette, Shield, Key, Trash2, Eye, EyeOff } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import Footer from '@/components/Footer';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  is_pro: boolean;
  trial_start: string;
  trial_end: string;
  subscription_status: string;
  created_at: string;
  updated_at: string;
}

interface Branding {
  id?: string;
  user_id: string;
  logo_url: string;
  watermark_text: string;
  watermark_position: string;
  watermark_opacity: number;
  brand_color: string;
}

const Settings = () => {
  const { user, profile, logout, refreshProfile } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [branding, setBranding] = useState<Branding | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchUserData();
    fetchBrandingData();
  }, [user, navigate]);

  const fetchUserData = async () => {
    try {
      if (!user) return;

      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      
      const profileData: UserProfile = {
        id: userData.id,
        email: userData.email,
        name: userData.name || '',
        is_pro: userData.is_pro || false,
        trial_start: userData.trial_start || '',
        trial_end: userData.trial_start ? new Date(new Date(userData.trial_start).getTime() + 14 * 24 * 60 * 60 * 1000).toISOString() : '',
        subscription_status: userData.is_pro ? 'active' : 'trial',
        created_at: userData.created_at || '',
        updated_at: userData.created_at || ''
      };
      
      setUserProfile(profileData);
    } catch (error) {
      console.error('Error fetching user:', error);
      toast({
        title: "Error",
        description: "Failed to load user data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchBrandingData = async () => {
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from('branding')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        const brandingData: Branding = {
          user_id: data.user_id,
          logo_url: data.logo_url || '',
          watermark_text: data.name || profile?.name || user.email || 'TutorBox',
          watermark_position: data.position || 'bottom-right',
          watermark_opacity: data.opacity || 0.8,
          brand_color: data.color || '#3B82F6'
        };
        setBranding(brandingData);
      } else {
        setBranding({
          user_id: user.id,
          logo_url: '',
          watermark_text: profile?.name || user.email || 'TutorBox',
          watermark_position: 'bottom-right',
          watermark_opacity: 0.8,
          brand_color: '#3B82F6'
        });
      }
    } catch (error) {
      console.error('Error fetching branding:', error);
    }
  };

  const updateProfile = async () => {
    if (!userProfile || !user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: userProfile.name
        })
        .eq('id', user.id);

      if (error) throw error;

      await refreshProfile();
      
      toast({
        title: "Profile updated!",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const saveBranding = async () => {
    if (!branding || !user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('branding')
        .upsert({
          user_id: user.id,
          logo_url: branding.logo_url,
          name: branding.watermark_text,
          position: branding.watermark_position,
          opacity: branding.watermark_opacity,
          color: branding.brand_color
        });

      if (error) throw error;

      toast({
        title: "Branding saved!",
        description: "Your branding preferences have been updated.",
      });
    } catch (error) {
      console.error('Error saving branding:', error);
      toast({
        title: "Error",
        description: "Failed to save branding settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const getTrialDaysLeft = () => {
    if (!userProfile?.trial_end || userProfile.is_pro) return null;
    const trialEnd = new Date(userProfile.trial_end);
    const now = new Date();
    const daysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, daysLeft);
  };

  const updatePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive"
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: "Password updated!",
        description: "Your password has been successfully updated.",
      });
      
      setShowPasswordForm(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error updating password:', error);
      toast({
        title: "Error",
        description: "Failed to update password. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteAccount = async () => {
    if (!user) return;

    setSaving(true);
    try {
      // First delete user data
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', user.id);

      if (deleteError) throw deleteError;

      // Then delete auth user (this will cascade)
      const { error: authError } = await supabase.auth.admin.deleteUser(user.id);
      
      if (authError) throw authError;

      toast({
        title: "Account deleted",
        description: "Your account has been permanently deleted.",
      });
      
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: "Error",
        description: "Failed to delete account. Please contact support.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading settings...</p>
        </div>
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
          
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Account Settings
          </h1>
          
          <Button onClick={handleSignOut} variant="outline">
            Sign Out
          </Button>
        </div>
      </header>

      <div className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid gap-6">
          {/* Account Info */}
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2 text-blue-600" />
                Account Information
              </CardTitle>
              <CardDescription>
                Your account details and subscription status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    value={userProfile?.email || ''} 
                    disabled 
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={userProfile?.name || ''}
                    onChange={(e) => setUserProfile(prev => prev ? {...prev, name: e.target.value} : null)}
                    placeholder="Enter your full name"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Account Status</Label>
                  <div className="flex items-center space-x-2 mt-2">
                    <Crown className={`h-5 w-5 ${userProfile?.is_pro ? 'text-yellow-500' : 'text-gray-400'}`} />
                    <span className={`text-lg font-semibold ${userProfile?.is_pro ? 'text-green-600' : 'text-orange-600'}`}>
                      {userProfile?.is_pro ? 'Pro Creator' : 'Free Trial'}
                    </span>
                  </div>
                </div>
                {!userProfile?.is_pro && (
                  <div>
                    <Label>Trial Days Remaining</Label>
                    <div className="flex items-center space-x-2 mt-2">
                      <Calendar className="h-5 w-5 text-orange-500" />
                      <span className="text-lg font-semibold text-orange-600">
                        {getTrialDaysLeft()} days left
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex space-x-3 pt-4">
                <Button 
                  onClick={updateProfile}
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Profile'}
                </Button>
                
                {!userProfile?.is_pro && (
                  <Button 
                    onClick={() => navigate('/upgrade')}
                    className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                  >
                    <Crown className="h-4 w-4 mr-2" />
                    Upgrade to Pro
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Key className="h-5 w-5 mr-2 text-green-600" />
                Security & Privacy
              </CardTitle>
              <CardDescription>
                Manage your password and account security
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!showPasswordForm ? (
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Password</h3>
                    <p className="text-sm text-gray-600">Last updated: Never</p>
                  </div>
                  <Button onClick={() => setShowPasswordForm(true)} variant="outline">
                    Change Password
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-gray-900">Update Password</h3>
                    <Button 
                      onClick={() => setShowPasswordForm(false)} 
                      variant="ghost" 
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="newPassword">New Password</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showPasswords ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter new password"
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                          onClick={() => setShowPasswords(!showPasswords)}
                        >
                          {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type={showPasswords ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                      />
                    </div>
                    
                    <Button 
                      onClick={updatePassword}
                      disabled={saving || !newPassword || !confirmPassword}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {saving ? 'Updating...' : 'Update Password'}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Branding Settings */}
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className="h-5 w-5 mr-2 text-purple-600" />
                Branding & Watermark
              </CardTitle>
              <CardDescription>
                Customize your video watermarks and branding
                {!userProfile?.is_pro && (
                  <span className="text-orange-600 font-medium"> (Pro feature)</span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="watermark-text">Watermark Text</Label>
                  <Input
                    id="watermark-text"
                    value={branding?.watermark_text || ''}
                    onChange={(e) => setBranding(prev => prev ? {...prev, watermark_text: e.target.value} : null)}
                    disabled={!userProfile?.is_pro}
                    placeholder="Your brand name or channel"
                  />
                </div>
                <div>
                  <Label htmlFor="watermark-position">Watermark Position</Label>
                  <select
                    id="watermark-position"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={branding?.watermark_position || 'bottom-right'}
                    onChange={(e) => setBranding(prev => prev ? {...prev, watermark_position: e.target.value} : null)}
                    disabled={!userProfile?.is_pro}
                  >
                    <option value="top-left">Top Left</option>
                    <option value="top-right">Top Right</option>
                    <option value="bottom-left">Bottom Left</option>
                    <option value="bottom-right">Bottom Right</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="brand-color">Brand Color</Label>
                  <div className="flex items-center space-x-3 mt-2">
                    <Input
                      id="brand-color"
                      type="color"
                      value={branding?.brand_color || '#3B82F6'}
                      onChange={(e) => setBranding(prev => prev ? {...prev, brand_color: e.target.value} : null)}
                      disabled={!userProfile?.is_pro}
                      className="w-16 h-10 p-1 rounded"
                    />
                    <Input
                      value={branding?.brand_color || '#3B82F6'}
                      onChange={(e) => setBranding(prev => prev ? {...prev, brand_color: e.target.value} : null)}
                      disabled={!userProfile?.is_pro}
                      placeholder="#3B82F6"
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="watermark-opacity">
                    Opacity ({Math.round((branding?.watermark_opacity || 0.8) * 100)}%)
                  </Label>
                  <Input
                    id="watermark-opacity"
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={branding?.watermark_opacity || 0.8}
                    onChange={(e) => setBranding(prev => prev ? {...prev, watermark_opacity: parseFloat(e.target.value)} : null)}
                    disabled={!userProfile?.is_pro}
                    className="mt-2"
                  />
                </div>
              </div>

              {branding && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Preview</h4>
                  <div className="bg-gray-200 rounded-lg h-32 relative overflow-hidden">
                    <div 
                      className={`absolute text-sm font-medium px-2 py-1 rounded ${
                        branding.watermark_position.includes('top') ? 'top-2' : 'bottom-2'
                      } ${
                        branding.watermark_position.includes('left') ? 'left-2' : 'right-2'
                      }`}
                      style={{ 
                        color: branding.brand_color,
                        opacity: branding.watermark_opacity,
                        backgroundColor: 'rgba(255, 255, 255, 0.8)'
                      }}
                    >
                      {branding.watermark_text || 'TutorBox'}
                    </div>
                  </div>
                </div>
              )}

              <Button 
                onClick={saveBranding} 
                disabled={!userProfile?.is_pro || saving}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Branding Settings'}
              </Button>

              {!userProfile?.is_pro && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Shield className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-orange-900">Upgrade to unlock branding</h4>
                      <p className="text-sm text-orange-700 mt-1">
                        Add your custom watermark, choose brand colors, and remove TutorBox branding from your videos.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center text-red-600">
                <Trash2 className="h-5 w-5 mr-2" />
                Danger Zone
              </CardTitle>
              <CardDescription>
                Irreversible actions that will permanently affect your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!showDeleteConfirm ? (
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Delete Account</h3>
                    <p className="text-sm text-gray-600">Permanently delete your account and all data</p>
                  </div>
                  <Button 
                    onClick={() => setShowDeleteConfirm(true)} 
                    variant="destructive"
                  >
                    Delete Account
                  </Button>
                </div>
              ) : (
                <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                  <h3 className="font-medium text-red-900 mb-2">Are you absolutely sure?</h3>
                  <p className="text-sm text-red-700 mb-4">
                    This action cannot be undone. This will permanently delete your account, 
                    all your lessons, recordings, and remove all data from our servers.
                  </p>
                  <div className="flex space-x-3">
                    <Button 
                      onClick={deleteAccount}
                      disabled={saving}
                      variant="destructive"
                    >
                      {saving ? 'Deleting...' : 'Yes, delete my account'}
                    </Button>
                    <Button 
                      onClick={() => setShowDeleteConfirm(false)} 
                      variant="outline"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Data & Privacy */}
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2 text-green-600" />
                Data & Privacy
              </CardTitle>
              <CardDescription>
                Manage your privacy preferences and data rights
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <p className="font-medium text-gray-900">Account Created</p>
                  <p>{userProfile?.trial_start ? new Date(userProfile.trial_start).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Last Updated</p>
                  <p>{userProfile?.trial_start ? new Date(userProfile.trial_start).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>

              {/* Consent Options */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Consent Preferences</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Analytics and Performance</p>
                      <p className="text-sm text-gray-600">Help us improve the platform with anonymous usage data</p>
                    </div>
                    <Button variant="outline" size="sm">Manage</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Marketing Communications</p>
                      <p className="text-sm text-gray-600">Receive updates about new features and offers</p>
                    </div>
                    <Button variant="outline" size="sm">Manage</Button>
                  </div>
                </div>
              </div>

              {/* Data Rights */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Your Data Rights</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
                    <span className="font-medium">Export My Data</span>
                    <span className="text-sm text-gray-600 mt-1">Download all your account data</span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
                    <span className="font-medium">Data Correction</span>
                    <span className="text-sm text-gray-600 mt-1">Request correction of your data</span>
                  </Button>
                </div>
              </div>

              {/* Security Disclosure */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-900">Security & Encryption</h4>
                    <p className="text-sm text-green-700 mt-1">
                      • All data transmitted using TLS 1.3 encryption<br/>
                      • Files encrypted at rest using AES-256<br/>
                      • Regular security audits and compliance monitoring<br/>
                      • Zero-knowledge architecture for sensitive content
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Settings;
