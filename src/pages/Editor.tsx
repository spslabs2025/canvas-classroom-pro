
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
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isRecording, setIsRecording] = useState(false);

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

      // Fetch slides for this lesson
      const { data: slidesData, error: slidesError } = await supabase
        .from('slides')
        .select('*')
        .eq('lesson_id', lessonId)
        .order('order_index');

      if (slidesError) {
        console.error('Error fetching slides:', slidesError);
      } else if (slidesData && slidesData.length > 0) {
        setSlides(slidesData);
        setCurrentSlide(slidesData[0]);
        setCanvasData(slidesData[0].canvas_data || {});
      } else {
        // Create initial slide if none exists
        const { data: newSlide, error: insertError } = await supabase
          .from('slides')
          .insert({
            lesson_id: lessonId,
            order_index: 0,
            canvas_data: {}
          })
          .select()
          .single();

        if (insertError) {
          console.error('Error creating initial slide:', insertError);
        } else if (newSlide) {
          setSlides([newSlide]);
          setCurrentSlide(newSlide);
          setCanvasData(newSlide.canvas_data || {});
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
    
    if (autoSave && currentSlide) {
      try {
        const { error } = await supabase
          .from('slides')
          .update({
            canvas_data: newCanvasData
          })
          .eq('id', currentSlide.id);

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
    setIsRecording(true);
    toast({
      title: "Recording started",
      description: "Your lesson recording has begun.",
    });
  };

  const handleRecordingStop = (blob: Blob) => {
    setIsRecording(false);
    toast({
      title: "Recording completed",
      description: "Your lesson has been recorded successfully.",
    });
  };

  const addNewSlide = async () => {
    try {
      const { data: newSlide, error } = await supabase
        .from('slides')
        .insert({
          lesson_id: lessonId,
          order_index: slides.length,
          canvas_data: {}
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding new slide:', error);
      } else if (newSlide) {
        setSlides([...slides, newSlide]);
      }
    } catch (error) {
      console.error('Error during slide addition:', error);
    }
  };

  const handleSlideSelect = (index: number) => {
    setCurrentSlideIndex(index);
    if (slides[index]) {
      setCurrentSlide(slides[index]);
      setCanvasData(slides[index].canvas_data || {});
    }
  };

  const handleAudioToggle = () => {
    setIsAudioEnabled(!isAudioEnabled);
  };

  const handleVideoToggle = () => {
    setIsVideoEnabled(!isVideoEnabled);
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
              onSlideSelect={handleSlideSelect}
              onAddSlide={addNewSlide}
            />

            {/* Media Controls */}
            <MediaControls
              isAudioEnabled={isAudioEnabled}
              isVideoEnabled={isVideoEnabled}
              onAudioToggle={handleAudioToggle}
              onVideoToggle={handleVideoToggle}
            />

            {/* Webcam Preview */}
            <ResizableWebcamPreview
              isEnabled={isVideoEnabled}
              isRecording={isRecording}
            />
          </div>
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col">
          <InfiniteWhiteboard
            canvasData={currentSlide?.canvas_data}
            onChange={handleCanvasChange}
            className="flex-1"
          />
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Editor;
