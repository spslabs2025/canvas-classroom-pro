import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Save, Settings } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import InfiniteWhiteboard from '@/components/InfiniteWhiteboard';
import RecordingControls from '@/components/RecordingControls';
import EnhancedRecordingControls from '@/components/EnhancedRecordingControls';
import SlideManager from '@/components/SlideManager';
import MediaControls from '@/components/MediaControls';
import ResizableWebcamPreview from '@/components/ResizableWebcamPreview';
import Footer from '@/components/Footer';

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
  const [currentSlide, setCurrentSlide] = useState<any>(null);
  const [slides, setSlides] = useState<any[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

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

  const handleCanvasDataChange = async (newCanvasData: any) => {
    try {
      const { error } = await supabase
        .from('slides')
        .upsert({
          lesson_id: lessonId,
          order_index: 0,
          canvas_data: newCanvasData
        });

      if (error) {
        console.error('Error updating canvas data:', error);
      }
    } catch (error) {
      console.error('Error during canvas data update:', error);
    }
  };

  const handleBackgroundChange = async (newBackgroundTemplate: string) => {
    try {
      const { error } = await supabase
        .from('slides')
        .update({
          background_template: newBackgroundTemplate
        })
        .eq('lesson_id', lessonId)
        .eq('order_index', 0);

      if (error) {
        console.error('Error updating background template:', error);
      }
    } catch (error) {
      console.error('Error during background template update:', error);
    }
  };

  const addNewSlide = async () => {
    try {
      const { error } = await supabase
        .from('slides')
        .insert({
          lesson_id: lessonId,
          order_index: slides.length,
          canvas_data: {}
        });

      if (error) {
        console.error('Error adding new slide:', error);
      }
    } catch (error) {
      console.error('Error during slide addition:', error);
    }
  };

  const deleteSlide = async (slideId: string) => {
    try {
      const { error } = await supabase
        .from('slides')
        .delete()
        .eq('id', slideId);

      if (error) {
        console.error('Error deleting slide:', error);
      }
    } catch (error) {
      console.error('Error during slide deletion:', error);
    }
  };

  const duplicateSlide = async (slideId: string) => {
    try {
      const { error } = await supabase
        .from('slides')
        .insert({
          lesson_id: lessonId,
          order_index: slides.length,
          canvas_data: {}
        });

      if (error) {
        console.error('Error duplicating slide:', error);
      }
    } catch (error) {
      console.error('Error during slide duplication:', error);
    }
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
    <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-blue-100 px-4 py-3 flex items-center justify-between shrink-0">
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
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Tools and Controls */}
        <div className="w-80 bg-white/70 backdrop-blur-sm border-r border-blue-100 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Recording Controls */}
            <EnhancedRecordingControls />
            
            {/* Slide Manager */}
            <SlideManager
              slides={slides}
              currentSlideIndex={currentSlideIndex}
              onSlideSelect={setCurrentSlideIndex}
              onAddSlide={addNewSlide}
              onDeleteSlide={deleteSlide}
              onDuplicateSlide={duplicateSlide}
            />

            {/* Media Controls */}
            <MediaControls />

            {/* Webcam Preview */}
            <ResizableWebcamPreview />
          </div>
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col">
          <InfiniteWhiteboard
            canvasData={currentSlide?.canvas_data}
            onCanvasDataChange={handleCanvasDataChange}
            backgroundTemplate={currentSlide?.background_template || 'white'}
            onBackgroundChange={handleBackgroundChange}
            className="flex-1"
          />
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Editor;
