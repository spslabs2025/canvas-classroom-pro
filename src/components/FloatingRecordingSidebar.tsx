import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ChevronDown, ChevronRight, Video, VideoOff, Mic, MicOff, Settings } from 'lucide-react';
import EnhancedRecordingControls from './EnhancedRecordingControls';
import { RecordingSidebarProps } from '@/types';

const FloatingRecordingSidebar = ({ 
  isAudioEnabled, 
  isVideoEnabled, 
  onAudioToggle, 
  onVideoToggle 
}: RecordingSidebarProps) => {
  const [isRecordingOpen, setIsRecordingOpen] = useState(true);
  const [isMediaOpen, setIsMediaOpen] = useState(true);

  return (
    <>
      {/* Trigger Button */}
      <Sheet>
        <SheetTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="fixed top-1/2 left-4 z-50 transform -translate-y-1/2 shadow-lg bg-white"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        
        <SheetContent side="left" className="w-80">
          <div className="space-y-4 mt-6">
            <div className="pb-4 border-b">
              <h2 className="text-lg font-semibold">Recording Studio</h2>
            </div>
            
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
        </SheetContent>
      </Sheet>
    </>
  );
};

export default FloatingRecordingSidebar;