
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/contexts/AuthContext';
import { 
  ArrowLeft, 
  Play, 
  Square, 
  Download, 
  Settings, 
  Save,
  Pause,
  Monitor,
  Smartphone,
  Tablet,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import InfiniteWhiteboard from '@/components/InfiniteWhiteboard';
import SlideManager from '@/components/SlideManager';
import MediaControls from '@/components/MediaControls';
import ResizableWebcamPreview from '@/components/ResizableWebcamPreview';

interface Lesson {
  id: string;
  title: string;
  user_id: string;
  export_status: string;
  created_at: string;
  updated_at: string;
}

interface Slide {
  id: string;
  lesson_id: string;
  order_index: number;
  canvas_data: any;
}

const Editor = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [isWebcamEnabled, setIsWebcamEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [recordingTime, setRecordingTime] = useState(0);
  const [deviceView, setDeviceView] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [autoSave, setAutoSave] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    if (lessonId) {
      fetchLesson();
      fetchSlides();
    }
  }, [lessonId, user, navigate]);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, []);

  const fetchLesson = async () => {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonId)
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      
      const lessonData: Lesson = {
        id: data.id,
        title: data.title,
        user_id: data.user_id,
        export_status: data.export_status || 'draft',
        created_at: data.created_at || '',
        updated_at: data.updated_at || ''
      };
      
      setLesson(lessonData);
    } catch (error) {
      console.error('Error fetching lesson:', error);
      toast({
        title: "Error",
        description: "Failed to load lesson. Please try again.",
        variant: "destructive"
      });
      navigate('/dashboard');
    }
  };

  const fetchSlides = async () => {
    try {
      const { data, error } = await supabase
        .from('slides')
        .select('*')
        .eq('lesson_id', lessonId)
        .order('order_index');

      if (error) throw error;
      
      if (!data || data.length === 0) {
        await addNewSlide();
      } else {
        const mappedSlides: Slide[] = data.map(slide => ({
          id: slide.id,
          lesson_id: slide.lesson_id || '',
          order_index: slide.order_index,
          canvas_data: slide.canvas_data
        }));
        setSlides(mappedSlides);
      }
    } catch (error) {
      console.error('Error fetching slides:', error);
      toast({
        title: "Error",
        description: "Failed to load slides",
        variant: "destructive"
      });
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

  const handleCanvasChange = async (canvasData: any) => {
    if (slides[currentSlideIndex] && autoSave) {
      const updatedSlides = [...slides];
      updatedSlides[currentSlideIndex] = {
        ...updatedSlides[currentSlideIndex],
        canvas_data: canvasData
      };
      setSlides(updatedSlides);

      try {
        await supabase
          .from('slides')
          .update({ canvas_data: canvasData })
          .eq('id', slides[currentSlideIndex].id);
      } catch (error) {
        console.error('Error saving slide:', error);
      }
    }
  };

  const startRecording = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ 
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 }
        },
        audio: true 
      });
      
      let cameraStream = null;
      if (isWebcamEnabled) {
        cameraStream = await navigator.mediaDevices.getUserMedia({ 
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            frameRate: { ideal: 30 }
          },
          audio: isAudioEnabled 
        });
      }
      
      const combinedStream = new MediaStream();
      
      screenStream.getVideoTracks().forEach(track => {
        combinedStream.addTrack(track);
      });
      
      if (cameraStream) {
        cameraStream.getVideoTracks().forEach(track => {
          combinedStream.addTrack(track);
        });
        
        if (isAudioEnabled) {
          cameraStream.getAudioTracks().forEach(track => {
            combinedStream.addTrack(track);
          });
        }
      }
      
      streamRef.current = combinedStream;
      recordedChunksRef.current = [];
      
      const mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType: 'video/webm;codecs=vp9,opus'
      });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        setRecordedBlob(blob);
        
        combinedStream.getTracks().forEach(track => track.stop());
        
        await supabase
          .from('lessons')
          .update({ 
            export_status: 'completed'
          })
          .eq('id', lesson?.id);
      };

      mediaRecorder.start(1000);
      setIsRecording(true);
      setRecordingTime(0);
      
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      await supabase
        .from('lessons')
        .update({ export_status: 'recording' })
        .eq('id', lesson?.id);
      
      toast({
        title: "Recording started!",
        description: "Your lesson is now being recorded in high quality.",
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Recording Error",
        description: "Failed to start recording. Please check your permissions and try again.",
        variant: "destructive"
      });
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        recordingIntervalRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
        setIsPaused(false);
        toast({
          title: "Recording resumed",
          description: "Your lesson recording has been resumed.",
        });
      } else {
        mediaRecorderRef.current.pause();
        if (recordingIntervalRef.current) {
          clearInterval(recordingIntervalRef.current);
        }
        setIsPaused(true);
        toast({
          title: "Recording paused",
          description: "Your lesson recording has been paused.",
        });
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      
      toast({
        title: "Recording completed!",
        description: "Your lesson has been recorded successfully and is ready for export.",
      });
    }
  };

  const downloadRecording = () => {
    if (recordedBlob) {
      const url = URL.createObjectURL(recordedBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${lesson?.title || 'lesson'}-${new Date().toISOString().split('T')[0]}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Download started!",
        description: "Your lesson video is being downloaded.",
      });
    }
  };

  const addNewSlide = async () => {
    try {
      const newSlide = {
        lesson_id: lessonId,
        order_index: slides.length,
        canvas_data: {}
      };

      const { data, error } = await supabase
        .from('slides')
        .insert(newSlide)
        .select()
        .single();

      if (error) throw error;
      
      const mappedSlide: Slide = {
        id: data.id,
        lesson_id: data.lesson_id || '',
        order_index: data.order_index,
        canvas_data: data.canvas_data
      };
      
      setSlides([...slides, mappedSlide]);
      setCurrentSlideIndex(slides.length);
      
      toast({
        title: "Slide added!",
        description: "New slide created successfully.",
      });
    } catch (error) {
      console.error('Error adding slide:', error);
      toast({
        title: "Error",
        description: "Failed to add slide. Please try again.",
        variant: "destructive"
      });
    }
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getDeviceClasses = () => {
    switch (deviceView) {
      case 'mobile':
        return 'max-w-sm mx-auto';
      case 'tablet':
        return 'max-w-4xl mx-auto';
      default:
        return 'w-full';
    }
  };

  if (!lesson) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg text-white">Loading studio...</p>
        </div>
      </div>
    );
  }

  const currentSlide = slides[currentSlideIndex];

  return (
    <div className={`min-h-screen bg-gray-900 ${getDeviceClasses()}`}>
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="text-white hover:bg-gray-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-white">{lesson.title}</h1>
              {isRecording && (
                <div className="flex items-center space-x-2 text-red-400">
                  <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-mono">{formatTime(recordingTime)}</span>
                  {isPaused && <span className="text-xs">(PAUSED)</span>}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Device View Toggle */}
            <div className="hidden lg:flex items-center space-x-1 bg-gray-700 rounded-lg p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeviceView('desktop')}
                className={`${deviceView === 'desktop' ? 'bg-gray-600' : ''} text-white hover:bg-gray-600`}
              >
                <Monitor className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeviceView('tablet')}
                className={`${deviceView === 'tablet' ? 'bg-gray-600' : ''} text-white hover:bg-gray-600`}
              >
                <Tablet className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeviceView('mobile')}
                className={`${deviceView === 'mobile' ? 'bg-gray-600' : ''} text-white hover:bg-gray-600`}
              >
                <Smartphone className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Recording Controls */}
            {!isRecording ? (
              <Button
                onClick={startRecording}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Play className="h-4 w-4 mr-2" />
                Start Recording
              </Button>
            ) : (
              <div className="flex items-center space-x-2">
                <Button
                  onClick={pauseRecording}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white"
                >
                  {isPaused ? <Play className="h-4 w-4 mr-2" /> : <Pause className="h-4 w-4 mr-2" />}
                  {isPaused ? 'Resume' : 'Pause'}
                </Button>
                <Button
                  onClick={stopRecording}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <Square className="h-4 w-4 mr-2" />
                  Stop
                </Button>
              </div>
            )}
            
            {recordedBlob && (
              <Button
                onClick={downloadRecording}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            )}
            
            <Button
              onClick={saveLesson}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-gray-700"
            >
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-64px)]">
        {/* Collapsible Sidebar */}
        <div className={`${sidebarCollapsed ? 'w-12' : 'w-80'} bg-gray-800 border-r border-gray-700 transition-all duration-300 flex flex-col`}>
          <div className="p-4 border-b border-gray-700 flex items-center justify-between">
            {!sidebarCollapsed && <h3 className="text-white font-medium">Controls</h3>}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="text-white hover:bg-gray-700"
            >
              {sidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </Button>
          </div>
          
          {!sidebarCollapsed && (
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
              <div>
                <h4 className="text-white text-sm font-medium mb-2">Media Controls</h4>
                <MediaControls
                  isAudioEnabled={isAudioEnabled}
                  isVideoEnabled={isWebcamEnabled}
                  onAudioToggle={() => setIsAudioEnabled(!isAudioEnabled)}
                  onVideoToggle={() => setIsWebcamEnabled(!isWebcamEnabled)}
                />
              </div>
              
              <div className="border-t border-gray-700 pt-4">
                <h4 className="text-white text-sm font-medium mb-2">Settings</h4>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-white text-sm">
                    <input
                      type="checkbox"
                      checked={autoSave}
                      onChange={(e) => setAutoSave(e.target.checked)}
                      className="rounded"
                    />
                    <span>Auto-save</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Whiteboard Area */}
        <div className="flex-1 flex flex-col">
          {/* Whiteboard */}
          <div className="flex-1">
            {currentSlide && (
              <InfiniteWhiteboard
                canvasData={currentSlide.canvas_data}
                onChange={handleCanvasChange}
                isCollaborative={false}
              />
            )}
          </div>

          {/* Slide Manager */}
          <div className="h-32 bg-gray-100 border-t">
            <SlideManager
              slides={slides}
              currentSlideIndex={currentSlideIndex}
              onSlideSelect={setCurrentSlideIndex}
              onAddSlide={addNewSlide}
            />
          </div>
        </div>
      </div>

      {/* Resizable Webcam Preview */}
      <ResizableWebcamPreview 
        isEnabled={isWebcamEnabled} 
        isRecording={isRecording}
      />
    </div>
  );
};

export default Editor;
