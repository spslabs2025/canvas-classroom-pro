
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useNavigate } from 'react-router-dom';
import { Plus, Play, Settings, Crown, LogOut, Video, Clock, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/hooks/use-toast";

interface Lesson {
  id: string;
  title: string;
  created_at: string;
  duration?: string;
  thumbnail?: string;
}

const Dashboard = () => {
  const [lessons, setLessons] = useState<Lesson[]>([
    {
      id: '1',
      title: 'Introduction to Mathematics',
      created_at: '2024-06-20T10:30:00Z',
      duration: '15:30'
    },
    {
      id: '2', 
      title: 'Physics Fundamentals',
      created_at: '2024-06-19T14:20:00Z',
      duration: '22:45'
    },
    {
      id: '3',
      title: 'Chemistry Basics',
      created_at: '2024-06-18T09:15:00Z',
      duration: '18:20'
    }
  ]);
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Auto-login test user if no user is logged in
    if (!user) {
      const testUser = {
        id: 'test-user-pro-123',
        email: 'testpro@tutorbox.com',
        name: 'Test Pro User',
        is_pro: true
      };
      
      // Set the test user in localStorage for persistence
      localStorage.setItem('tutorbox_user', JSON.stringify(testUser));
      window.location.reload(); // Reload to trigger auth context
    }
  }, [user]);

  const handleCreateLesson = () => {
    if (!newLessonTitle.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a lesson title",
        variant: "destructive"
      });
      return;
    }

    const newLesson: Lesson = {
      id: Date.now().toString(),
      title: newLessonTitle,
      created_at: new Date().toISOString(),
      duration: '00:00'
    };

    setLessons([newLesson, ...lessons]);
    setNewLessonTitle('');
    setShowCreateForm(false);
    
    toast({
      title: "Lesson Created",
      description: `"${newLessonTitle}" has been created successfully`,
    });

    // Navigate to editor
    navigate(`/editor/${newLesson.id}`);
  };

  const handleDeleteLesson = (lessonId: string) => {
    setLessons(lessons.filter(lesson => lesson.id !== lessonId));
    toast({
      title: "Lesson Deleted",
      description: "Lesson has been deleted successfully",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-6 w-6 sm:h-8 sm:w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Play className="h-3 w-3 sm:h-5 sm:w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    TutorBox
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-600">Welcome back, {user.name}</p>
                </div>
              </div>
              
              {user.is_pro && (
                <div className="sm:hidden">
                  <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                    <Crown className="h-3 w-3 mr-1" />
                    Pro
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
              {user.is_pro && (
                <div className="hidden sm:block">
                  <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                    <Crown className="h-4 w-4 mr-1" />
                    Pro Member
                  </div>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/settings')}
                  className="flex-1 sm:flex-initial"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
                
                {!user.is_pro && (
                  <Button
                    onClick={() => navigate('/upgrade')}
                    size="sm"
                    className="flex-1 sm:flex-initial bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                  >
                    <Crown className="h-4 w-4 mr-2" />
                    Upgrade
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="flex-1 sm:flex-initial"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  <span className="sm:inline">Logout</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 sm:py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <Card className="bg-white/60 backdrop-blur-sm">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center">
                <Video className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
                <div className="ml-3 sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Total Lessons</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{lessons.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center">
                <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
                <div className="ml-3 sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Total Duration</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">56:35</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center">
                <Play className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500" />
                <div className="ml-3 sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">This Month</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">3</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center">
                <Crown className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500" />
                <div className="ml-3 sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Plan</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">{user.is_pro ? 'Pro' : 'Free'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lessons Section */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Your Lessons</h2>
            <Button
              onClick={() => setShowCreateForm(true)}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Lesson
            </Button>
          </div>

          {/* Create Lesson Form */}
          {showCreateForm && (
            <Card className="bg-white/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Create New Lesson</CardTitle>
                <CardDescription>Enter a title for your new lesson</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Enter lesson title..."
                  value={newLessonTitle}
                  onChange={(e) => setNewLessonTitle(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateLesson()}
                  className="text-base"
                />
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    onClick={handleCreateLesson}
                    className="flex-1 sm:flex-initial bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  >
                    Create Lesson
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCreateForm(false);
                      setNewLessonTitle('');
                    }}
                    className="flex-1 sm:flex-initial"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lessons Grid */}
          {lessons.length === 0 ? (
            <Card className="bg-white/60 backdrop-blur-sm">
              <CardContent className="text-center py-12">
                <Video className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No lessons yet</h3>
                <p className="text-gray-600 mb-6">Create your first lesson to get started</p>
                <Button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Lesson
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {lessons.map((lesson) => (
                <Card key={lesson.id} className="bg-white/60 backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base sm:text-lg font-semibold truncate">{lesson.title}</CardTitle>
                        <CardDescription className="text-xs sm:text-sm">
                          Created {formatDate(lesson.created_at)}
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteLesson(lesson.id)}
                        className="ml-2 h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600 mb-4">
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        {lesson.duration}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        onClick={() => navigate(`/editor/${lesson.id}`)}
                        size="sm"
                        className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                      >
                        <Play className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                        <span className="text-xs sm:text-sm">Edit</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
