
import { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, VideoOff } from 'lucide-react';
import { WebcamPreviewProps } from '@/types';

const WebcamPreview = ({ isEnabled, isRecording }: WebcamPreviewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');

  const startWebcam = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
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


  return (
    <Card className="h-full bg-gradient-to-b from-gray-900 to-black border-gray-700">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-white text-lg">
          <div className="flex items-center">
            {isEnabled ? <Video className="h-5 w-5 mr-2" /> : <VideoOff className="h-5 w-5 mr-2" />}
            Camera Preview
          </div>
          {isRecording && (
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-red-400 text-sm">REC</span>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0 flex-1">
        <div className="h-full rounded-b-lg overflow-hidden">
          {!isEnabled ? (
            <div className="h-full flex items-center justify-center bg-gray-800">
              <div className="text-center text-gray-400">
                <VideoOff className="h-16 w-16 mx-auto mb-4" />
                <p className="text-lg">Camera Disabled</p>
                <p className="text-sm">Enable camera to see preview</p>
              </div>
            </div>
          ) : error ? (
            <div className="h-full flex items-center justify-center bg-gray-800">
              <div className="text-center text-red-400">
                <VideoOff className="h-16 w-16 mx-auto mb-4" />
                <p className="text-lg">Camera Error</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover bg-black"
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WebcamPreview;
