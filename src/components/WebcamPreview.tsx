
import { useRef, useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Video, VideoOff } from 'lucide-react';

interface WebcamPreviewProps {
  isEnabled: boolean;
  isRecording: boolean;
}

const WebcamPreview = ({ isEnabled, isRecording }: WebcamPreviewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');

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
        video: true, 
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

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-medium flex items-center">
          {isEnabled ? <Video className="h-4 w-4 mr-2" /> : <VideoOff className="h-4 w-4 mr-2" />}
          Webcam Preview
        </h3>
        {isRecording && (
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-red-400 text-sm">Recording</span>
          </div>
        )}
      </div>

      <Card className="flex-1 bg-gray-900 border-gray-700">
        <CardContent className="p-0 h-full">
          {!isEnabled ? (
            <div className="h-full flex items-center justify-center bg-gray-800 rounded">
              <div className="text-center text-gray-400">
                <VideoOff className="h-12 w-12 mx-auto mb-2" />
                <p>Camera disabled</p>
              </div>
            </div>
          ) : error ? (
            <div className="h-full flex items-center justify-center bg-gray-800 rounded">
              <div className="text-center text-red-400">
                <VideoOff className="h-12 w-12 mx-auto mb-2" />
                <p className="text-sm">{error}</p>
              </div>
            </div>
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover rounded"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WebcamPreview;
