
import { useRef, useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, VideoOff, Maximize2, Minimize2, Move } from 'lucide-react';

interface ResizableWebcamPreviewProps {
  isEnabled: boolean;
  isRecording: boolean;
  className?: string;
}

const ResizableWebcamPreview = ({ isEnabled, isRecording, className = "" }: ResizableWebcamPreviewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [size, setSize] = useState({ width: 300, height: 225 });

  useEffect(() => {
    if (isEnabled) {
      startWebcam();
    } else {
      stopWebcam();
    }

    return () => {
      stopWebcam();
    };
  }, [isEnabled]);

  const startWebcam = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 30 }
        }, 
        audio: false 
      });
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError('');
    } catch (err) {
      console.error('Error accessing webcam:', err);
      setError('Unable to access camera. Please check permissions.');
    }
  };

  const stopWebcam = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <div 
      ref={containerRef}
      className={`fixed z-50 ${className}`}
      style={{
        left: position.x,
        top: position.y,
        width: isMinimized ? 60 : size.width,
        height: isMinimized ? 60 : size.height,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
    >
      <Card className="h-full bg-gray-900 border-gray-700 shadow-lg">
        {/* Drag Handle */}
        <div 
          className="absolute top-0 left-0 right-0 h-8 bg-gray-800 rounded-t flex items-center justify-between px-2 cursor-move z-10"
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center space-x-2">
            {isEnabled ? <Video className="h-3 w-3 text-white" /> : <VideoOff className="h-3 w-3 text-red-400" />}
            {!isMinimized && (
              <span className="text-xs text-white">Camera</span>
            )}
            {isRecording && !isMinimized && (
              <div className="flex items-center space-x-1">
                <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-red-400 text-xs">REC</span>
              </div>
            )}
          </div>
          
          {!isMinimized && (
            <div className="flex items-center space-x-1">
              <Move className="h-3 w-3 text-gray-400" />
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMinimize}
                className="h-4 w-4 p-0 text-gray-400 hover:text-white"
              >
                <Minimize2 className="h-3 w-3" />
              </Button>
            </div>
          )}
          
          {isMinimized && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMinimize}
              className="h-4 w-4 p-0 text-gray-400 hover:text-white"
            >
              <Maximize2 className="h-3 w-3" />
            </Button>
          )}
        </div>

        <CardContent className="p-0 h-full pt-8">
          {isMinimized ? (
            <div className="h-full flex items-center justify-center bg-gray-800 rounded-b">
              <div className="text-center text-gray-400">
                {isEnabled ? <Video className="h-4 w-4 mx-auto" /> : <VideoOff className="h-4 w-4 mx-auto" />}
              </div>
            </div>
          ) : !isEnabled ? (
            <div className="h-full flex items-center justify-center bg-gray-800 rounded-b">
              <div className="text-center text-gray-400">
                <VideoOff className="h-8 w-8 mx-auto mb-2" />
                <p className="text-xs">Camera disabled</p>
              </div>
            </div>
          ) : error ? (
            <div className="h-full flex items-center justify-center bg-gray-800 rounded-b">
              <div className="text-center text-red-400">
                <VideoOff className="h-8 w-8 mx-auto mb-2" />
                <p className="text-xs px-2">{error}</p>
              </div>
            </div>
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover rounded-b"
              style={{ height: 'calc(100% - 32px)' }}
            />
          )}
        </CardContent>

        {/* Resize Handle */}
        {!isMinimized && (
          <div 
            className="absolute bottom-0 right-0 w-4 h-4 bg-gray-600 cursor-nw-resize"
            style={{ clipPath: 'polygon(100% 0, 0 100%, 100% 100%)' }}
            onMouseDown={(e) => {
              e.stopPropagation();
              // Add resize logic here if needed
            }}
          />
        )}
      </Card>
    </div>
  );
};

export default ResizableWebcamPreview;
