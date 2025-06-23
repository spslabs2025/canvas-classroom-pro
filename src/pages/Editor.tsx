
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Save, Settings } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import InfiniteWhiteboard from '@/components/InfiniteWhiteboard';
import RecordingControls from '@/components/RecordingControls';

interface Lesson {
  id: string;
  title: string;
  user_id: string;
  export_status: string;
  created_at: string;
  updated_at: string;
}

const Editor = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [canvasData, setCanvasData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [autoSave, setAutoSave] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    if (lessonId) {
      initializeEditor();
    }
  }, [lessonId, user, navigate]);

  const initializeEditor = async () => {
    try {
      setIsLoading(true);
      
      // Fetch lesson data
      const { data: lessonData, error: lessonError } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonId)
        .eq('user_id', user?.id)
        .single();

      if (lessonError) throw lessonError;
      
      const mappedLesson: Lesson = {
        id: lessonData.id,
        title: lessonData.title,
        user_id: lessonData.user_id,
        export_status: lessonData.export_status || 'draft',
        created_at: lessonData.created_at || '',
        updated_at: lessonData.updated_at || ''
      };
      
      setLesson(mappedLesson);

      // Fetch or create canvas data
      const { data: canvasDataResult, error: canvasError } = await supabase
        .from('slides')
        .select('canvas_data')
        .eq('lesson_id', lessonId)
        .single();

      if (canvasError && canvasError.code !== 'PGRST116') {
        console.error('Error fetching canvas data:', canvasError);
      } else if (canvasDataResult) {
        setCanvasData(canvasDataResult.canvas_data || {});
      } else {
        // Create initial slide if none exists
        const { error: insertError } = await supabase
          .from('slides')
          .insert({
            lesson_id: lessonId,
            order_index: 0,
            canvas_data: {}
          });

        if (insertError) {
          console.error('Error creating initial slide:', insertError);
        }
      }
      
    } catch (error) {
      console.error('Error initializing editor:', error);
      toast({
        title: "Error",
        description: "Failed to load editor. Please try again.",
        variant: "destructive"
      });
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCanvasChange = async (newCanvasData: any) => {
    setCanvasData(newCanvasData);
    
    if (autoSave) {
      try {
        const { error } = await supabase
          .from('slides')
          .upsert({
            lesson_id: lessonId,
            order_index: 0,
            canvas_data: newCanvasData
          });

        if (error) {
          console.error('Error auto-saving canvas:', error);
        }
      } catch (error) {
        console.error('Error during auto-save:', error);
      }
    }
  };

  const saveLesson = async () => {
    if (!lesson) return;
    
    try {
      const { error } = await supabase
        .from('lessons')
        .update({ 
          title: lesson.title,
          updated_at: new Date().toISOString()
        })
        .eq('id', lesson.id);

      if (error) throw error;
      
      toast({
        title: "Lesson saved!",
        description: "Your lesson has been saved successfully.",
      });
    } catch (error) {
      console.error('Error saving lesson:', error);
      toast({
        title: "Error",
        description: "Failed to save lesson. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleRecordingStart = (blob: Blob) => {
    toast({
      title: "Recording started",
      description: "Your lesson recording has begun.",
    });
  };

  const handleRecordingStop = (blob: Blob) => {
    toast({
      title: "Recording completed",
      description: "Your lesson has been recorded successfully.",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-700">Loading studio...</p>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-700">Lesson not found</p>
          <Button onClick={() => navigate('/dashboard')} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Dashboard
          </Button>
          <h1 className="text-xl font-semibold">{lesson.title}</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={autoSave}
              onChange={(e) => setAutoSave(e.target.checked)}
              className="rounded"
            />
            <span>Auto-save</span>
          </label>
          
          <Button
            onClick={saveLesson}
            variant="outline"
            size="sm"
          >
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Recording Controls - Left Side */}
        <RecordingControls
          onRecordingStart={handleRecordingStart}
          onRecordingStop={handleRecordingStop}
        />

        {/* Whiteboard - Right Side */}
        <div className="flex-1">
          <InfiniteWhiteboard
            canvasData={canvasData}
            onChange={handleCanvasChange}
            isCollaborative={false}
          />
        </div>
      </div>
    </div>
  );
};

export default Editor;
