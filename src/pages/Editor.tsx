
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/contexts/AuthContext';
import { 
  ArrowLeft, 
  Play, 
  Square, 
  Download, 
  Settings, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff,
  Save,
  Pause,
  RotateCcw,
  Maximize,
  Monitor,
  Smartphone,
  Tablet
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import Whiteboard from '@/components/Whiteboard';
import SlideManager from '@/components/SlideManager';
import WebcamPreview from '@/components/WebcamPreview';

interface Lesson {
  id: string;
  title: string;
  description: string;
  user_id: string;
  status: string;
  duration: number;
}

interface Slide {
  id: string;
  lesson_id: string;
  order_index: number;
  canvas_data: any;
  background_template: string;
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
      
      // Map database fields to our Lesson interface
      const lessonData: Lesson = {
        id: data.id,
        title: data.title,
        description: data.description || '',
        user_id: data.user_id,
        status: data.status || 'draft',
        duration: data.duration || 0
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
        // Create initial slide if none exist
        await addNewSlide();
      } else {
        // Map database fields to our Slide interface
        const mappedSlides: Slide[] = data.map(slide => ({
          id: slide.id,
          lesson_id: slide.lesson_id || '',
          order_index: slide.order_index,
          canvas_data: slide.canvas_data,
          background_template: slide.background_template || 'white'
        }));
        setSlides(mappedSlides);
      }
    } catch (error) {
      console.error('Error fetching slides:', error);
    }
  };

  const saveLesson = async () => {
    if (!lesson) return;
    
    try {
      const { error } = await supabase
        .from('lessons')
        .update({ 
          title: lesson.title,
          description: lesson.description,
          duration: recordingTime,
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

      // Auto-save to database (debounced)
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
      // Get screen and camera permissions
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
      
      // Combine streams
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
        
        // Stop all tracks
        combinedStream.getTracks().forEach(track => track.stop());
        
        // Update lesson status
        await supabase
          .from('lessons')
          .update({ 
            status: 'completed',
            duration: recordingTime 
          })
          .eq('id', lesson?.id);
      };

      mediaRecorder.start(1000); // Record in 1-second chunks
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start recording timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      // Update lesson status to recording
      await supabase
        .from('lessons')
        .update({ status: 'recording' })
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
        canvas_data: {},
        background_template: 'white'
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
        canvas_data: data.canvas_data,
        background_template: data.background_template || 'white'
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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsAudioEnabled(!isAudioEnabled)}
              className={`${isAudioEnabled ? 'text-white' : 'text-red-400'} hover:bg-gray-700`}
            >
              {isAudioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsWebcamEnabled(!isWebcamEnabled)}
              className={`${isWebcamEnabled ? 'text-white' : 'text-red-400'} hover:bg-gray-700`}
            >
              {isWebcamEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
            </Button>
            
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
      <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)]">
        {/* Webcam Panel */}
        <div className="w-full lg:w-2/5 bg-gray-800 p-4 order-2 lg:order-1">
          <Card className="h-full bg-gray-900 border-gray-700">
            <CardContent className="p-4 h-full">
              <WebcamPreview 
                isEnabled={isWebcamEnabled} 
                isRecording={isRecording}
              />
            </CardContent>
          </Card>
        </div>

        {/* Whiteboard Panel */}
        <div className="w-full lg:w-3/5 bg-gray-900 p-4 flex flex-col order-1 lg:order-2">
          {/* Whiteboard */}
          <Card className="flex-1 bg-white border-gray-700 mb-4">
            <CardContent className="p-0 h-full">
              {currentSlide && (
                <Whiteboard
                  canvasData={currentSlide.canvas_data}
                  onChange={handleCanvasChange}
                  background={currentSlide.background_template}
                />
              )}
            </CardContent>
          </Card>

          {/* Slide Manager */}
          <div className="h-32">
            <SlideManager
              slides={slides}
              currentSlideIndex={currentSlideIndex}
              onSlideSelect={setCurrentSlideIndex}
              onAddSlide={addNewSlide}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Editor;
