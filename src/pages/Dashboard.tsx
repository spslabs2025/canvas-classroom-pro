
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Play, 
  Plus, 
  Settings, 
  Crown, 
  Calendar, 
  Video,
  Clock,
  Trash2,
  Edit3,
  Search,
  Filter,
  Grid,
  List,
  BarChart3,
  TrendingUp,
  Users,
  PlayCircle
} from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: number;
  status: string;
  thumbnail_url: string;
  video_url: string;
  created_at: string;
  updated_at: string;
}

interface DashboardStats {
  totalLessons: number;
  totalDuration: number;
  completedLessons: number;
  draftLessons: number;
}

const Dashboard = () => {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalLessons: 0,
    totalDuration: 0,
    completedLessons: 0,
    draftLessons: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonDescription, setNewLessonDescription] = useState('');

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

      setLessons(data || []);
      calculateStats(data || []);
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

  const calculateStats = (lessonsData: Lesson[]) => {
    const stats = {
      totalLessons: lessonsData.length,
      totalDuration: lessonsData.reduce((acc, lesson) => acc + lesson.duration, 0),
      completedLessons: lessonsData.filter(l => l.status === 'completed').length,
      draftLessons: lessonsData.filter(l => l.status === 'draft').length
    };
    setStats(stats);
  };

  const createLesson = async () => {
    if (!newLessonTitle.trim()) {
      toast({
        title: "Error",
        description: "Please enter a lesson title.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('lessons')
        .insert({
          user_id: user?.id,
          title: newLessonTitle,
          description: newLessonDescription,
          status: 'draft'
        })
        .select()
        .single();

      if (error) throw error;

      // Create initial slide for the lesson
      await supabase
        .from('slides')
        .insert({
          lesson_id: data.id,
          order_index: 0,
          canvas_data: {},
          background_template: 'white'
        });

      toast({
        title: "Lesson created!",
        description: "Your new lesson is ready for recording.",
      });

      setShowCreateModal(false);
      setNewLessonTitle('');
      setNewLessonDescription('');
      fetchLessons();
      
      // Navigate to editor
      navigate(`/editor/${data.id}`);
    } catch (error) {
      console.error('Error creating lesson:', error);
      toast({
        title: "Error",
        description: "Failed to create lesson. Please try again.",
        variant: "destructive"
      });
    }
  };

  const deleteLesson = async (lessonId: string) => {
    try {
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', lessonId);

      if (error) throw error;

      toast({
        title: "Lesson deleted",
        description: "The lesson has been permanently deleted.",
      });

      fetchLessons();
    } catch (error) {
      console.error('Error deleting lesson:', error);
      toast({
        title: "Error",
        description: "Failed to delete lesson. Please try again.",
        variant: "destructive"
      });
    }
  };

  const filteredLessons = lessons.filter(lesson => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lesson.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || lesson.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getTrialDaysLeft = () => {
    if (!profile?.trial_end || profile.is_pro) return null;
    const trialEnd = new Date(profile.trial_end);
    const now = new Date();
    const daysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, daysLeft);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading your studio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 lg:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Play className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  TutorBox Studio
                </h1>
                <p className="text-sm text-gray-600">Welcome back, {profile?.name || user?.email}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {!profile?.is_pro && (
                <div className="hidden sm:flex items-center space-x-2 bg-orange-50 text-orange-700 px-3 py-2 rounded-lg border border-orange-200">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm font-medium">{getTrialDaysLeft()} days left</span>
                </div>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/settings')}
                className="hidden sm:flex items-center space-x-2"
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Button>
              
              {!profile?.is_pro && (
                <Button
                  onClick={() => navigate('/upgrade')}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-medium"
                >
                  <Crown className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Upgrade to Pro</span>
                  <span className="sm:hidden">Upgrade</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 lg:px-6 py-6 lg:py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Lessons</p>
                  <p className="text-2xl lg:text-3xl font-bold text-gray-900">{stats.totalLessons}</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Video className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Duration</p>
                  <p className="text-2xl lg:text-3xl font-bold text-gray-900">{formatDuration(stats.totalDuration)}</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl lg:text-3xl font-bold text-gray-900">{stats.completedLessons}</p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Drafts</p>
                  <p className="text-2xl lg:text-3xl font-bold text-gray-900">{stats.draftLessons}</p>
                </div>
                <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Edit3 className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lessons Section */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="border-b border-gray-100">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <CardTitle className="text-xl font-bold text-gray-900">Your Lessons</CardTitle>
                <CardDescription>Create, edit, and manage your teaching content</CardDescription>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
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
                    className="px-3 py-2 border border-gray-200 rounded-md text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="recording">Recording</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
                
                <Button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Lesson
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            {filteredLessons.length === 0 ? (
              <div className="text-center py-12">
                <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Video className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {lessons.length === 0 ? 'No lessons yet' : 'No lessons found'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {lessons.length === 0 
                    ? 'Start creating your first lesson to begin teaching'
                    : 'Try adjusting your search or filter criteria'
                  }
                </p>
                {lessons.length === 0 && (
                  <Button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Lesson
                  </Button>
                )}
              </div>
            ) : (
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {filteredLessons.map((lesson) => (
                  <Card key={lesson.id} className="bg-white border border-gray-200 hover:shadow-lg transition-shadow duration-200">
                    <CardContent className="p-0">
                      <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                        {lesson.thumbnail_url ? (
                          <img src={lesson.thumbnail_url} alt={lesson.title} className="w-full h-full object-cover" />
                        ) : (
                          <PlayCircle className="h-16 w-16 text-blue-400" />
                        )}
                      </div>
                      
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-gray-900 truncate flex-1">{lesson.title}</h3>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ml-2 ${
                            lesson.status === 'completed' ? 'bg-green-100 text-green-700' :
                            lesson.status === 'recording' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {lesson.status}
                          </div>
                        </div>
                        
                        {lesson.description && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{lesson.description}</p>
                        )}
                        
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                          <span>{formatDuration(lesson.duration)}</span>
                          <span>{new Date(lesson.created_at).toLocaleDateString()}</span>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => navigate(`/editor/${lesson.id}`)}
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                          >
                            <Edit3 className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteLesson(lesson.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Lesson Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md bg-white">
            <CardHeader>
              <CardTitle>Create New Lesson</CardTitle>
              <CardDescription>Start creating your next teaching masterpiece</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Lesson Title</Label>
                <Input
                  id="title"
                  placeholder="Enter lesson title"
                  value={newLessonTitle}
                  onChange={(e) => setNewLessonTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  placeholder="Brief description of your lesson"
                  value={newLessonDescription}
                  onChange={(e) => setNewLessonDescription(e.target.value)}
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={createLesson}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  Create & Start Recording
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
