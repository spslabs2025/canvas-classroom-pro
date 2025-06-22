
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Volume2, 
  VolumeX,
  Settings,
  Headphones,
  Camera
} from 'lucide-react';

interface MediaControlsProps {
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  onAudioToggle: () => void;
  onVideoToggle: () => void;
  className?: string;
}

const MediaControls = ({ 
  isAudioEnabled, 
  isVideoEnabled, 
  onAudioToggle, 
  onVideoToggle,
  className = ""
}: MediaControlsProps) => {
  const [volume, setVolume] = useState([50]);
  const [isMuted, setIsMuted] = useState(false);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedAudioInput, setSelectedAudioInput] = useState<string>('');
  const [selectedAudioOutput, setSelectedAudioOutput] = useState<string>('');
  const [selectedVideoInput, setSelectedVideoInput] = useState<string>('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Get available media devices
  useEffect(() => {
    const getDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        
        setAudioDevices(devices.filter(device => 
          device.kind === 'audioinput' || device.kind === 'audiooutput'
        ));
        
        setVideoDevices(devices.filter(device => 
          device.kind === 'videoinput'
        ));
        
        // Set default devices
        const defaultAudioInput = devices.find(device => 
          device.kind === 'audioinput' && device.deviceId === 'default'
        );
        const defaultVideoInput = devices.find(device => 
          device.kind === 'videoinput' && device.deviceId === 'default'
        );
        
        if (defaultAudioInput) setSelectedAudioInput(defaultAudioInput.deviceId);
        if (defaultVideoInput) setSelectedVideoInput(defaultVideoInput.deviceId);
        
      } catch (error) {
        console.error('Error getting media devices:', error);
      }
    };

    getDevices();
    
    // Listen for device changes
    navigator.mediaDevices.addEventListener('devicechange', getDevices);
    
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', getDevices);
    };
  }, []);

  const handleVolumeChange = (newVolume: number[]) => {
    setVolume(newVolume);
    if (newVolume[0] === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const audioInputDevices = audioDevices.filter(device => device.kind === 'audioinput');
  const audioOutputDevices = audioDevices.filter(device => device.kind === 'audiooutput');

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Controls */}
      <div className="flex items-center space-x-2">
        <Button
          variant={isAudioEnabled ? "default" : "destructive"}
          size="sm"
          onClick={onAudioToggle}
          className="min-w-[40px]"
        >
          {isAudioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
        </Button>
        
        <Button
          variant={isVideoEnabled ? "default" : "destructive"}
          size="sm"
          onClick={onVideoToggle}
          className="min-w-[40px]"
        >
          {isVideoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
        </Button>
        
        <div className="flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMute}
            className="p-1 h-6 w-6"
          >
            {isMuted || volume[0] === 0 ? 
              <VolumeX className="h-3 w-3" /> : 
              <Volume2 className="h-3 w-3" />
            }
          </Button>
          
          <Slider
            value={isMuted ? [0] : volume}
            onValueChange={handleVolumeChange}
            max={100}
            step={1}
            className="w-20"
          />
          
          <span className="text-xs text-gray-600 w-8">
            {isMuted ? 0 : volume[0]}%
          </span>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="min-w-[40px]"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      {/* Advanced Controls */}
      {showAdvanced && (
        <Card className="w-full">
          <CardContent className="p-4 space-y-4">
            <h3 className="text-sm font-medium text-gray-900">Device Settings</h3>
            
            {/* Audio Input */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-700 flex items-center">
                <Mic className="h-3 w-3 mr-1" />
                Microphone
              </label>
              <Select value={selectedAudioInput} onValueChange={setSelectedAudioInput}>
                <SelectTrigger className="w-full text-xs">
                  <SelectValue placeholder="Select microphone" />
                </SelectTrigger>
                <SelectContent>
                  {audioInputDevices.map((device) => (
                    <SelectItem key={device.deviceId} value={device.deviceId} className="text-xs">
                      {device.label || `Microphone ${device.deviceId.slice(0, 8)}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Audio Output */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-700 flex items-center">
                <Headphones className="h-3 w-3 mr-1" />
                Speaker
              </label>
              <Select value={selectedAudioOutput} onValueChange={setSelectedAudioOutput}>
                <SelectTrigger className="w-full text-xs">
                  <SelectValue placeholder="Select speaker" />
                </SelectTrigger>
                <SelectContent>
                  {audioOutputDevices.map((device) => (
                    <SelectItem key={device.deviceId} value={device.deviceId} className="text-xs">
                      {device.label || `Speaker ${device.deviceId.slice(0, 8)}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Video Input */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-700 flex items-center">
                <Camera className="h-3 w-3 mr-1" />
                Camera
              </label>
              <Select value={selectedVideoInput} onValueChange={setSelectedVideoInput}>
                <SelectTrigger className="w-full text-xs">
                  <SelectValue placeholder="Select camera" />
                </SelectTrigger>
                <SelectContent>
                  {videoDevices.map((device) => (
                    <SelectItem key={device.deviceId} value={device.deviceId} className="text-xs">
                      {device.label || `Camera ${device.deviceId.slice(0, 8)}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Audio Level Indicator */}
            {isAudioEnabled && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700">Audio Level</label>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-150" 
                    style={{ width: `${Math.random() * 60 + 20}%` }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MediaControls;
