
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from 'react-router-dom';
import { Plus, Video, Calendar, Clock, Settings, LogOut, Crown } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid';

interface Lesson {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  export_status: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  trial_start: string;
  is_pro: boolean;
}

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
    fetchLessons();
  }, []);

  const checkUser = async () => {
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
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchLessons = async () => {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setLessons(data || []);
    } catch (error) {
      console.error('Error fetching lessons:', error);
    }
  };

  const createNewLesson = async () => {
    try {
      const lessonId = uuidv4();
      const { error } = await supabase
        .from('lessons')
        .insert({
          id: lessonId,
          title: `Lesson ${lessons.length + 1}`,
          user_id: user?.id
        });

      if (error) throw error;

      // Create initial slide
      await supabase
        .from('slides')
        .insert({
          lesson_id: lessonId,
          order_index: 0,
          canvas_data: {}
        });

      toast({
        title: "Lesson created!",
        description: "Your new lesson is ready to edit.",
      });

      navigate(`/editor/${lessonId}`);
    } catch (error) {
      console.error('Error creating lesson:', error);
      toast({
        title: "Error",
        description: "Failed to create lesson. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const getTrialDaysLeft = () => {
    if (!user?.trial_start || user.is_pro) return null;
    const trialStart = new Date(user.trial_start);
    const now = new Date();
    const daysUsed = Math.floor((now.getTime() - trialStart.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, 14 - daysUsed);
  };

  const isTrialExpired = () => {
    const daysLeft = getTrialDaysLeft();
    return daysLeft !== null && daysLeft <= 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Video className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              TutorBox
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            {!user?.is_pro && (
              <div className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-sm">
                <Crown className="h-4 w-4" />
                <span>
                  {isTrialExpired() 
                    ? "Trial Expired" 
                    : `${getTrialDaysLeft()} days left`
                  }
                </span>
              </div>
            )}
            
            <Button
              variant="outline"
              onClick={() => navigate('/settings')}
              className="flex items-center space-x-2"
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name?.split(' ')[0] || 'Creator'}!
          </h1>
          <p className="text-xl text-gray-600">
            Ready to create amazing educational content?
          </p>
        </div>

        {/* Trial Warning */}
        {!user?.is_pro && isTrialExpired() && (
          <Card className="border-2 border-red-500 bg-red-50 mb-6">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-red-800">Trial Expired</h3>
                  <p className="text-red-600">Upgrade to Pro to continue using all features</p>
                </div>
                <Button 
                  onClick={() => navigate('/upgrade')}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Upgrade Now
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-purple-600 text-white cursor-pointer hover:shadow-lg transition-shadow" onClick={createNewLesson}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Create New Lesson</CardTitle>
                  <CardDescription className="text-blue-100">
                    Start recording a new educational video
                  </CardDescription>
                </div>
                <Plus className="h-8 w-8" />
              </div>
            </CardHeader>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl text-gray-900">Total Lessons</CardTitle>
                  <CardDescription className="text-2xl font-bold text-purple-600">
                    {lessons.length}
                  </CardDescription>
                </div>
                <Video className="h-8 w-8 text-purple-500" />
              </div>
            </CardHeader>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl text-gray-900">Account Status</CardTitle>
                  <CardDescription className="text-2xl font-bold text-green-600">
                    {user?.is_pro ? 'Pro' : 'Trial'}
                  </CardDescription>
                </div>
                <Crown className={`h-8 w-8 ${user?.is_pro ? 'text-yellow-500' : 'text-gray-400'}`} />
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Recent Lessons */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Recent Lessons</h2>
            <Button onClick={createNewLesson} className="bg-gradient-to-r from-blue-500 to-purple-600">
              <Plus className="h-4 w-4 mr-2" />
              New Lesson
            </Button>
          </div>

          {lessons.length === 0 ? (
            <Card className="bg-white/60 backdrop-blur-sm">
              <CardContent className="py-12 text-center">
                <Video className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No lessons yet</h3>
                <p className="text-gray-600 mb-6">Create your first lesson to get started!</p>
                <Button onClick={createNewLesson} className="bg-gradient-to-r from-blue-500 to-purple-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Lesson
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lessons.map((lesson) => (
                <Card key={lesson.id} className="bg-white/60 backdrop-blur-sm hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/editor/${lesson.id}`)}>
                  <CardHeader>
                    <CardTitle className="text-lg">{lesson.title}</CardTitle>
                    <CardDescription className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(lesson.created_at).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`h-2 w-2 rounded-full ${
                          lesson.export_status === 'completed' ? 'bg-green-500' : 
                          lesson.export_status === 'processing' ? 'bg-yellow-500' : 'bg-gray-300'
                        }`}></div>
                        <span className="text-sm text-gray-600 capitalize">{lesson.export_status}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        {new Date(lesson.updated_at).toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
