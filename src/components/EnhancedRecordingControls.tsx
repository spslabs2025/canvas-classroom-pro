
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Square, 
  Download, 
  Trash2, 
  Video, 
  Mic, 
  Monitor,
  Settings,
  Timer
} from 'lucide-react';
import { useScreenRecording } from '@/hooks/useScreenRecording';

interface EnhancedRecordingControlsProps {
  className?: string;
}

const EnhancedRecordingControls = ({ className }: EnhancedRecordingControlsProps) => {
  const {
    isRecording,
    recordedBlob,
    startRecording,
    stopRecording,
    downloadRecording,
    clearRecording
  } = useScreenRecording();

  const [recordingTime, setRecordingTime] = useState(0);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Recording Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`h-3 w-3 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-300'}`} />
              <span className="font-medium">
                {isRecording ? 'Recording Active' : 'Ready to Record'}
              </span>
              {isRecording && (
                <Badge variant="destructive" className="animate-pulse">
                  LIVE
                </Badge>
              )}
            </div>
            {isRecording && (
              <div className="flex items-center space-x-1 text-sm text-gray-600">
                <Timer className="h-4 w-4" />
                <span>{formatTime(recordingTime)}</span>
              </div>
            )}
          </div>

          {/* Recording Features */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="flex items-center space-x-1 text-green-600">
              <Monitor className="h-3 w-3" />
              <span>Screen</span>
            </div>
            <div className="flex items-center space-x-1 text-blue-600">
              <Video className="h-3 w-3" />
              <span>Webcam</span>
            </div>
            <div className="flex items-center space-x-1 text-purple-600">
              <Mic className="h-3 w-3" />
              <span>Audio</span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex space-x-2">
            {!isRecording ? (
              <Button
                onClick={startRecording}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white"
              >
                <Play className="h-4 w-4 mr-2" />
                Start Recording
              </Button>
            ) : (
              <Button
                onClick={stopRecording}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white"
              >
                <Square className="h-4 w-4 mr-2" />
                Stop Recording
              </Button>
            )}
            
            <Button variant="outline" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </div>

          {/* Recorded Video Actions */}
          {recordedBlob && (
            <div className="border-t pt-4 space-y-2">
              <div className="flex items-center space-x-2 text-sm text-green-600">
                <Video className="h-4 w-4" />
                <span>Recording Complete ({(recordedBlob.size / 1024 / 1024).toFixed(1)} MB)</span>
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={downloadRecording}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button
                  onClick={clearRecording}
                  variant="outline"
                  size="icon"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Recording Quality Info */}
          <div className="text-xs text-gray-500 space-y-1">
            <div>• HD 1080p video quality</div>
            <div>• Enhanced audio processing</div>
            <div>• Screen + webcam combined</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedRecordingControls;
