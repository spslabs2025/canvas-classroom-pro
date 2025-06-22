
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Play, 
  Clock, 
  Calendar, 
  Settings, 
  Crown, 
  Video, 
  Trash2, 
  Edit2,
  Search,
  Filter,
  BookOpen,
  TrendingUp,
  Users,
  Award
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface Lesson {
  id: string;
  title: string;
  description: string;
  user_id: string;
  status: string;
  duration: number;
  thumbnail_url: string;
  video_url: string;
  created_at: string;
  updated_at: string;
}

const Dashboard = () => {
  const { user, profile, logout } = useAuth();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [recentLessons, setRecentLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showNewLessonDialog, setShowNewLessonDialog] = useState(false);
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchLessons();
  }, [user, navigate]);

  const fetchLessons = async () => {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Map database fields to our Lesson interface with defaults for missing columns
      const mappedLessons: Lesson[] = data.map(lesson => ({
        id: lesson.id,
        title: lesson.title,
        description: '', // Default since description doesn't exist in DB
        user_id: lesson.user_id || '',
        status: lesson.export_status || 'draft', // Map export_status to status
        duration: 0, // Default since duration doesn't exist in DB
        thumbnail_url: '', // Default since thumbnail_url doesn't exist in DB
        video_url: '', // Default since video_url doesn't exist in DB
        created_at: lesson.created_at || '',
        updated_at: lesson.updated_at || lesson.created_at || ''
      }));
      
      setLessons(mappedLessons);
      setRecentLessons(mappedLessons.slice(0, 3));
    } catch (error) {
      console.error('Error fetching lessons:', error);
      toast({
        title: "Error",
        description: "Failed to load lessons. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createLesson = async () => {
    if (!newLessonTitle.trim() || !user) return;
    
    setCreating(true);
    try {
      const { data, error } = await supabase
        .from('lessons')
        .insert({
          title: newLessonTitle.trim(),
          user_id: user.id,
          export_status: 'draft'
        })
        .select()
        .single();

      if (error) throw error;
      
      toast({
        title: "Lesson created!",
        description: "Your new lesson has been created successfully.",
      });
      
      setNewLessonTitle('');
      setShowNewLessonDialog(false);
      await fetchLessons();
      
      // Navigate to editor
      navigate(`/editor/${data.id}`);
    } catch (error) {
      console.error('Error creating lesson:', error);
      toast({
        title: "Error",
        description: "Failed to create lesson. Please try again.",
        variant: "destructive"
      });
    } finally {
      setCreating(false);
    }
  };

  const deleteLesson = async (lessonId: string) => {
    if (!confirm('Are you sure you want to delete this lesson? This action cannot be undone.')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', lessonId)
        .eq('user_id', user?.id);

      if (error) throw error;
      
      toast({
        title: "Lesson deleted",
        description: "The lesson has been deleted successfully.",
      });
      
      await fetchLessons();
    } catch (error) {
      console.error('Error deleting lesson:', error);
      toast({
        title: "Error",
        description: "Failed to delete lesson. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getTrialDaysLeft = () => {
    if (!profile?.trial_end || profile.is_pro) return null;
    const trialEnd = new Date(profile.trial_end);
    const now = new Date();
    const daysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, daysLeft);
  };

  const filteredLessons = lessons.filter(lesson => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || lesson.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'recording': return 'text-blue-600 bg-blue-100';
      case 'processing': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDuration = (seconds: number) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
          <p className="text-lg text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                TutorBox
              </h1>
            </div>
            
            {profile && !profile.is_pro && (
              <div className="hidden md:flex items-center space-x-2 bg-orange-100 px-3 py-1 rounded-full">
                <Clock className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-800">
                  {getTrialDaysLeft()} days left in trial
                </span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            {!profile?.is_pro && (
              <Button 
                onClick={() => navigate('/upgrade')}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
              >
                <Crown className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Upgrade to Pro</span>
              </Button>
            )}
            
            <Button
              variant="ghost"
              onClick={() => navigate('/settings')}
              className="text-gray-600 hover:text-gray-900"
            >
              <Settings className="h-5 w-5" />
            </Button>
            
            <Button onClick={handleSignOut} variant="outline">
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {profile?.name || 'Creator'}!
          </h2>
          <p className="text-lg text-gray-600">
            Ready to create amazing educational content? Let's get started.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Lessons</p>
                  <p className="text-3xl font-bold text-gray-900">{lessons.length}</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Video className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {lessons.filter(l => l.status === 'completed').length}
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Award className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Duration</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatDuration(lessons.reduce((acc, lesson) => acc + lesson.duration, 0))}
                  </p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Account Status</p>
                  <p className="text-lg font-bold text-gray-900">
                    {profile?.is_pro ? 'Pro' : 'Trial'}
                  </p>
                </div>
                <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Crown className={`h-6 w-6 ${profile?.is_pro ? 'text-yellow-600' : 'text-gray-400'}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Get started with your next lesson or manage existing ones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                onClick={() => setShowNewLessonDialog(true)}
                className="h-24 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
              >
                <div className="text-center">
                  <Plus className="h-8 w-8 mx-auto mb-2" />
                  <span>Create New Lesson</span>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => navigate('/settings')}
                className="h-24 border-2 border-dashed border-gray-300 hover:border-gray-400"
              >
                <div className="text-center text-gray-600">
                  <Settings className="h-8 w-8 mx-auto mb-2" />
                  <span>Account Settings</span>
                </div>
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => window.open('https://docs.tutorbox.com', '_blank')}
                className="h-24 border-2 border-dashed border-gray-300 hover:border-gray-400"
              >
                <div className="text-center text-gray-600">
                  <BookOpen className="h-8 w-8 mx-auto mb-2" />
                  <span>View Documentation</span>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lessons Section */}
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="flex items-center">
                  <Video className="h-5 w-5 mr-2 text-purple-600" />
                  Your Lessons
                </CardTitle>
                <CardDescription>
                  Manage and organize your educational content
                </CardDescription>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search lessons..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full sm:w-64"
                  />
                </div>
                
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="recording">Recording</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {filteredLessons.length === 0 ? (
              <div className="text-center py-12">
                <Video className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  {lessons.length === 0 ? 'No lessons yet' : 'No lessons match your search'}
                </h3>
                <p className="text-gray-500 mb-6">
                  {lessons.length === 0 
                    ? 'Create your first lesson to get started with TutorBox'
                    : 'Try adjusting your search criteria'
                  }
                </p>
                {lessons.length === 0 && (
                  <Button 
                    onClick={() => setShowNewLessonDialog(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Lesson
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredLessons.map((lesson) => (
                  <Card key={lesson.id} className="bg-white border border-gray-200 hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                          {lesson.title}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/editor/${lesson.id}`)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteLesson(lesson.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Status</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lesson.status)}`}>
                            {lesson.status}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Duration</span>
                          <span className="text-gray-900">{formatDuration(lesson.duration)}</span>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Created</span>
                          <span className="text-gray-900">{formatDate(lesson.created_at)}</span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => navigate(`/editor/${lesson.id}`)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* New Lesson Dialog */}
      {showNewLessonDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md bg-white">
            <CardHeader>
              <CardTitle>Create New Lesson</CardTitle>
              <CardDescription>
                Enter a title for your new lesson to get started
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="lesson-title">Lesson Title</Label>
                <Input
                  id="lesson-title"
                  value={newLessonTitle}
                  onChange={(e) => setNewLessonTitle(e.target.value)}
                  placeholder="e.g., Introduction to React Hooks"
                  className="mt-1"
                  onKeyPress={(e) => e.key === 'Enter' && createLesson()}
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowNewLessonDialog(false);
                    setNewLessonTitle('');
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={createLesson}
                  disabled={!newLessonTitle.trim() || creating}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {creating ? 'Creating...' : 'Create Lesson'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
