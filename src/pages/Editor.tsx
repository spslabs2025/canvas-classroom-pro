
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Play, Square, Download, Settings, Mic, MicOff, Video, VideoOff } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import Whiteboard from '@/components/Whiteboard';
import SlideManager from '@/components/SlideManager';
import WebcamPreview from '@/components/WebcamPreview';

interface Lesson {
  id: string;
  title: string;
  user_id: string;
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
  
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [isWebcamEnabled, setIsWebcamEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (lessonId) {
      fetchLesson();
      fetchSlides();
    }
  }, [lessonId]);

  const fetchLesson = async () => {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonId)
        .single();

      if (error) throw error;
      setLesson(data);
    } catch (error) {
      console.error('Error fetching lesson:', error);
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
      setSlides(data || []);
    } catch (error) {
      console.error('Error fetching slides:', error);
    }
  };

  const handleCanvasChange = async (canvasData: any) => {
    if (slides[currentSlideIndex]) {
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
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: isWebcamEnabled, 
        audio: isAudioEnabled 
      });
      
      recordedChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        setRecordedBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      toast({
        title: "Recording started!",
        description: "Your lesson is now being recorded.",
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Error",
        description: "Failed to start recording. Please check your camera and microphone permissions.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      toast({
        title: "Recording stopped!",
        description: "Your recording is ready for export.",
      });
    }
  };

  const downloadRecording = () => {
    if (recordedBlob) {
      const url = URL.createObjectURL(recordedBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${lesson?.title || 'lesson'}-recording.webm`;
      a.click();
      URL.revokeObjectURL(url);
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
      
      setSlides([...slides, data]);
      setCurrentSlideIndex(slides.length);
      
      toast({
        title: "Slide added!",
        description: "New slide created successfully.",
      });
    } catch (error) {
      console.error('Error adding slide:', error);
    }
  };

  if (!lesson) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading editor...</p>
        </div>
      </div>
    );
  }

  const currentSlide = slides[currentSlideIndex];

  return (
    <div className="min-h-screen bg-gray-900">
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
              Back to Dashboard
            </Button>
            <h1 className="text-xl font-semibold text-white">{lesson.title}</h1>
          </div>
          
          <div className="flex items-center space-x-2">
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
              <Button
                onClick={stopRecording}
                className="bg-red-600 hover:bg-red-700 text-white animate-pulse"
              >
                <Square className="h-4 w-4 mr-2" />
                Stop Recording
              </Button>
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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-64px)]">
        {/* Left Panel - Webcam */}
        <div className="w-2/5 bg-gray-800 p-4">
          <Card className="h-full bg-gray-900 border-gray-700">
            <CardContent className="p-4 h-full">
              <WebcamPreview 
                isEnabled={isWebcamEnabled} 
                isRecording={isRecording}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Whiteboard */}
        <div className="w-3/5 bg-gray-900 p-4 flex flex-col">
          {/* Whiteboard */}
          <Card className="flex-1 bg-white border-gray-700 mb-4">
            <CardContent className="p-0 h-full">
              {currentSlide && (
                <Whiteboard
                  canvasData={currentSlide.canvas_data}
                  onChange={handleCanvasChange}
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
