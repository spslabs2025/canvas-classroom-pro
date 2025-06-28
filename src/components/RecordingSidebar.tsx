
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, Video, VideoOff, Mic, MicOff } from 'lucide-react';
import EnhancedRecordingControls from './EnhancedRecordingControls';
import MediaControls from './MediaControls';

interface RecordingSidebarProps {
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  onAudioToggle: () => void;
  onVideoToggle: () => void;
}

const RecordingSidebar = ({ 
  isAudioEnabled, 
  isVideoEnabled, 
  onAudioToggle, 
  onVideoToggle 
}: RecordingSidebarProps) => {
  const [isRecordingOpen, setIsRecordingOpen] = useState(true);
  const [isMediaOpen, setIsMediaOpen] = useState(true);

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Recording Studio</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Recording Controls Section */}
        <Collapsible open={isRecordingOpen} onOpenChange={setIsRecordingOpen}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between p-3 h-auto"
            >
              <span className="font-medium">Recording Controls</span>
              {isRecordingOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="space-y-3">
            <Card>
              <CardContent className="p-4">
                <EnhancedRecordingControls />
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>

        {/* Media Settings Section */}
        <Collapsible open={isMediaOpen} onOpenChange={setIsMediaOpen}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between p-3 h-auto"
            >
              <span className="font-medium">Media Settings</span>
              {isMediaOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="space-y-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Camera & Audio</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Video className="h-4 w-4" />
                    <span className="text-sm">Camera</span>
                  </div>
                  <Button
                    variant={isVideoEnabled ? "default" : "outline"}
                    size="sm"
                    onClick={onVideoToggle}
                  >
                    {isVideoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Mic className="h-4 w-4" />
                    <span className="text-sm">Microphone</span>
                  </div>
                  <Button
                    variant={isAudioEnabled ? "default" : "outline"}
                    size="sm"
                    onClick={onAudioToggle}
                  >
                    {isAudioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
};

export default RecordingSidebar;
