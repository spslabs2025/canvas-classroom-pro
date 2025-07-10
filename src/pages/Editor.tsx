import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Save, Settings, Eye, EyeOff, PenTool, Wifi, WifiOff } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useDrawingService } from '@/hooks/useDrawingService';
import InfiniteWhiteboard from '@/components/InfiniteWhiteboard';
import DraggableWebcamPreview from '@/components/DraggableWebcamPreview';
import FloatingRecordingSidebar from '@/components/FloatingRecordingSidebar';
import FloatingSlidesSidebar from '@/components/FloatingSlidesSidebar';
import WhiteboardToolsDropdown from '@/components/WhiteboardToolsDropdown';
import ErrorBoundary from '@/components/ErrorBoundary';
import Footer from '@/components/Footer';
import { Lesson, Slide } from '@/types';

const Editor = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [canvasData, setCanvasData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlide, setCurrentSlide] = useState<Slide | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [showCamera, setShowCamera] = useState(true);
  
  // Whiteboard state
  const [selectedTool, setSelectedTool] = useState('pen');
  const [brushSize, setBrushSize] = useState(5);
  const [brushColor, setBrushColor] = useState('#000000');
  
  // Drawing service for pen tool backend support
  const drawingService = useDrawingService(currentSlide?.id || null, user?.id || null);

  console.log('Editor state:', { selectedTool, brushSize, brushColor, syncStatus: drawingService.isSyncing });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    if (lessonId) {
      initializeEditor();
    }
  }, [lessonId, user]);

  // Cleanup drawing service on unmount
  useEffect(() => {
    return () => {
      drawingService.cleanup();
    };
  }, [drawingService.cleanup]);

  const initializeEditor = async () => {
    try {
      setIsLoading(true);
      
      // Fetch lesson data
      const { data: lessonData, error: lessonError } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonId)
        .eq('user_id', user?.id)
        .maybeSingle();

      if (lessonError) throw lessonError;
      if (!lessonData) {
        throw new Error('Lesson not found or access denied');
      }
      
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
    
    // Handle pen tool strokes specifically
    if (selectedTool === 'pen' && newCanvasData?.objects) {
      const latestObject = newCanvasData.objects[newCanvasData.objects.length - 1];
      if (latestObject && latestObject.type === 'path') {
        // Queue the stroke for backend saving
        drawingService.queueStroke(
          latestObject,
          'pen',
          brushColor,
          brushSize
        );
      }
    }
    
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

  const handleSlideSelect = async (index: number) => {
    // Force save any pending strokes before switching slides
    drawingService.forceSave();
    
    setCurrentSlideIndex(index);
    if (slides[index]) {
      setCurrentSlide(slides[index]);
      setCanvasData(slides[index].canvas_data || {});
      
      // Load strokes for the new slide
      try {
        const strokes = await drawingService.loadStrokes(slides[index].id);
        console.log(`Loaded ${strokes.length} strokes for slide ${index}`);
      } catch (error) {
        console.error('Error loading strokes for slide:', error);
      }
    }
  };

  const handleAudioToggle = () => {
    setIsAudioEnabled(!isAudioEnabled);
  };

  const handleVideoToggle = () => {
    setIsVideoEnabled(!isVideoEnabled);
  };

  const deleteSlide = async (slideId: string) => {
    try {
      const { error } = await supabase
        .from('slides')
        .delete()
        .eq('id', slideId);

      if (error) {
        console.error('Error deleting slide:', error);
      } else {
        setSlides(slides.filter(slide => slide.id !== slideId));
        if (currentSlideIndex >= slides.length - 1) {
          setCurrentSlideIndex(Math.max(0, slides.length - 2));
        }
      }
    } catch (error) {
      console.error('Error during slide deletion:', error);
    }
  };

  const duplicateSlide = async (slideId: string) => {
    try {
      const slideToClone = slides.find(slide => slide.id === slideId);
      if (!slideToClone) return;

      const { data: newSlide, error } = await supabase
        .from('slides')
        .insert({
          lesson_id: lessonId,
          order_index: slides.length,
          canvas_data: slideToClone.canvas_data
        })
        .select()
        .single();

      if (error) {
        console.error('Error duplicating slide:', error);
      } else if (newSlide) {
        setSlides([...slides, newSlide]);
      }
    } catch (error) {
      console.error('Error during slide duplication:', error);
    }
  };

  // Whiteboard tool handlers
  const whiteboardRef = useRef<any>(null);
  
  const handleToolSelect = (tool: string, options?: any) => {
    if (tool === 'text') {
      // Call addText function on whiteboard
      whiteboardRef.current?.addText();
    } else if (tool === 'rectangle') {
      whiteboardRef.current?.addShape('rectangle');
    } else if (tool === 'circle') {
      whiteboardRef.current?.addShape('circle');
    } else if (tool === 'triangle') {
      whiteboardRef.current?.addShape('triangle');
    } else if (tool === 'line') {
      whiteboardRef.current?.addShape('line');
    } else if (tool === 'upload-image' || tool === 'upload-pdf') {
      whiteboardRef.current?.triggerFileUpload();
    } else if (tool === 'download') {
      whiteboardRef.current?.exportCanvas('png');
    } else if (tool === 'zoom-in') {
      whiteboardRef.current?.setZoom(Math.min(5, whiteboardRef.current?.zoom + 0.2));
    } else if (tool === 'zoom-out') {
      whiteboardRef.current?.setZoom(Math.max(0.1, whiteboardRef.current?.zoom - 0.2));
    } else if (tool === 'grid') {
      // Toggle grid functionality
      toast({
        title: "Grid Toggle",
        description: "Grid functionality coming soon",
      });
    } else {
      setSelectedTool(tool);
      
      // Enhanced feedback for pen tool
      if (tool === 'pen') {
        toast({
          title: "Pen Tool Active",
          description: `Draw with ${brushColor} color, ${brushSize}px thickness. Drawings auto-save to backend.`,
        });
      }
    }
    
    if (options?.color) {
      setBrushColor(options.color);
    }
    
    if (tool !== 'pen') {
      toast({
        title: "Tool Selected",
        description: `${tool.charAt(0).toUpperCase() + tool.slice(1)} tool is now active`,
      });
    }
  };

  const handleBrushSizeChange = (size: number) => {
    setBrushSize(size);
  };

  const handleColorChange = (color: string) => {
    setBrushColor(color);
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
    <ErrorBoundary>
      <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Header */}
        <header className="bg-white/90 backdrop-blur-sm border-b border-blue-100 px-4 py-3 flex items-center justify-between shrink-0 z-40">
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
            <WhiteboardToolsDropdown 
              onToolSelect={handleToolSelect}
              onBrushSizeChange={handleBrushSizeChange}
              onColorChange={handleColorChange}
              currentTool={selectedTool}
              currentBrushSize={brushSize}
              currentColor={brushColor}
            />
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCamera(!showCamera)}
            >
              {showCamera ? <Eye className="h-4 w-4 mr-2" /> : <EyeOff className="h-4 w-4 mr-2" />}
              Camera
            </Button>
            
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
            
            {/* Sync Status Indicator */}
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              {drawingService.isSyncing ? (
                <>
                  <WifiOff className="h-3 w-3 animate-pulse" />
                  <span>Syncing...</span>
                </>
              ) : drawingService.pendingCount > 0 ? (
                <>
                  <Wifi className="h-3 w-3 text-orange-500" />
                  <span>{drawingService.pendingCount} pending</span>
                </>
              ) : (
                <>
                  <Wifi className="h-3 w-3 text-green-500" />
                  <span>Synced</span>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Main Content - Full Screen Whiteboard */}
        <div className="flex-1 relative">
          <ErrorBoundary fallback={
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <p className="text-lg text-gray-700 mb-4">Whiteboard failed to load</p>
                <Button onClick={() => window.location.reload()}>Reload</Button>
              </div>
            </div>
          }>
            <InfiniteWhiteboard
              ref={whiteboardRef}
              canvasData={currentSlide?.canvas_data}
              onCanvasChange={handleCanvasChange}
              className="h-full w-full"
              selectedTool={selectedTool}
              brushSize={brushSize}
              brushColor={brushColor}
            />
          </ErrorBoundary>
          
          {/* Floating Elements */}
          <ErrorBoundary>
            <FloatingRecordingSidebar
              isAudioEnabled={isAudioEnabled}
              isVideoEnabled={isVideoEnabled}
              onAudioToggle={handleAudioToggle}
              onVideoToggle={handleVideoToggle}
            />
          </ErrorBoundary>
          
          <ErrorBoundary>
            <FloatingSlidesSidebar
              slides={slides}
              currentSlideIndex={currentSlideIndex}
              onSlideSelect={handleSlideSelect}
              onAddSlide={addNewSlide}
              onDeleteSlide={deleteSlide}
              onDuplicateSlide={duplicateSlide}
            />
          </ErrorBoundary>
        </div>
        
        {/* Draggable Camera Preview */}
        {showCamera && (
          <ErrorBoundary>
            <DraggableWebcamPreview
              isEnabled={isVideoEnabled}
              isRecording={isRecording}
              onClose={() => setShowCamera(false)}
            />
          </ErrorBoundary>
        )}

        <Footer />
      </div>
    </ErrorBoundary>
  );
};

export default Editor;
