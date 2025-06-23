
import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Play, 
  Square, 
  Pause,
  Mic, 
  MicOff, 
  Video, 
  VideoOff,
  Download,
  Clock
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface RecordingControlsProps {
  onRecordingStart?: (blob: Blob) => void;
  onRecordingStop?: (blob: Blob) => void;
}

const RecordingControls = ({ onRecordingStart, onRecordingStop }: RecordingControlsProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const { toast } = useToast();

  useEffect(() => {
    // Initialize camera preview
    initializePreview();
    
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, []);

  const initializePreview = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: isVideoEnabled, 
        audio: isAudioEnabled 
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing media devices:', error);
      toast({
        title: "Camera Error",
        description: "Unable to access camera or microphone",
        variant: "destructive"
      });
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: isVideoEnabled, 
        audio: isAudioEnabled 
      });
      
      streamRef.current = stream;
      recordedChunksRef.current = [];
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9,opus'
      });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        setRecordedBlob(blob);
        onRecordingStop?.(blob);
        
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(1000);
      setIsRecording(true);
      setRecordingTime(0);
      
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      onRecordingStart?.(new Blob());
      
      toast({
        title: "Recording started!",
        description: "Your session is now being recorded.",
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Recording Error",
        description: "Failed to start recording. Please check your permissions.",
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
      } else {
        mediaRecorderRef.current.pause();
        if (recordingIntervalRef.current) {
          clearInterval(recordingIntervalRef.current);
        }
        setIsPaused(true);
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
        description: "Your session has been recorded successfully.",
      });
    }
  };

  const downloadRecording = () => {
    if (recordedBlob) {
      const url = URL.createObjectURL(recordedBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `recording-${new Date().toISOString().split('T')[0]}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const toggleAudio = async () => {
    setIsAudioEnabled(!isAudioEnabled);
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !isAudioEnabled;
      });
    }
    await initializePreview();
  };

  const toggleVideo = async () => {
    setIsVideoEnabled(!isVideoEnabled);
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach(track => {
        track.enabled = !isVideoEnabled;
      });
    }
    await initializePreview();
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

  return (
    <div className="w-80 bg-white border-r p-4 space-y-4">
      <h3 className="text-lg font-semibold">Recording Studio</h3>
      
      {/* Camera Preview */}
      <Card>
        <CardContent className="p-4">
          <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden relative">
            {isVideoEnabled ? (
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white">
                <VideoOff className="h-12 w-12" />
              </div>
            )}
            
            {isRecording && (
              <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-xs flex items-center space-x-1">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span>REC</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Media Controls */}
      <div className="flex justify-center space-x-2">
        <Button
          variant={isAudioEnabled ? "default" : "destructive"}
          size="sm"
          onClick={toggleAudio}
        >
          {isAudioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
        </Button>
        
        <Button
          variant={isVideoEnabled ? "default" : "destructive"}
          size="sm"
          onClick={toggleVideo}
        >
          {isVideoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
        </Button>
      </div>

      {/* Recording Controls */}
      <div className="space-y-3">
        {isRecording && (
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 text-red-600">
              <Clock className="h-4 w-4" />
              <span className="font-mono text-lg">{formatTime(recordingTime)}</span>
              {isPaused && <span className="text-xs">(PAUSED)</span>}
            </div>
          </div>
        )}
        
        <div className="flex justify-center space-x-2">
          {!isRecording ? (
            <Button
              onClick={startRecording}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Play className="h-4 w-4 mr-2" />
              Start Recording
            </Button>
          ) : (
            <>
              <Button
                onClick={pauseRecording}
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              </Button>
              <Button
                onClick={stopRecording}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Square className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
        
        {recordedBlob && (
          <Button
            onClick={downloadRecording}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Recording
          </Button>
        )}
      </div>
    </div>
  );
};

export default RecordingControls;
