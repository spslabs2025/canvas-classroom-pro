
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, Plus, Copy, Trash2 } from 'lucide-react';
import SlideManager from './SlideManager';

interface Slide {
  id: string;
  lesson_id: string;
  order_index: number;
  canvas_data: any;
}

interface SlidesSidebarProps {
  slides: Slide[];
  currentSlideIndex: number;
  onSlideSelect: (index: number) => void;
  onAddSlide: () => void;
  onDeleteSlide: (slideId: string) => void;
  onDuplicateSlide: (slideId: string) => void;
}

const SlidesSidebar = ({ 
  slides, 
  currentSlideIndex, 
  onSlideSelect, 
  onAddSlide,
  onDeleteSlide,
  onDuplicateSlide 
}: SlidesSidebarProps) => {
  const [isSlidesOpen, setIsSlidesOpen] = useState(true);
  const [isToolsOpen, setIsToolsOpen] = useState(false);

  return (
    <div className="w-64 bg-white border-l border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Slides & Tools</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Slides Section */}
        <Collapsible open={isSlidesOpen} onOpenChange={setIsSlidesOpen}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between p-3 h-auto"
            >
              <span className="font-medium">Slides ({slides.length})</span>
              {isSlidesOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="space-y-3">
            <Card>
              <CardContent className="p-4">
                <SlideManager
                  slides={slides}
                  currentSlideIndex={currentSlideIndex}
                  onSlideSelect={onSlideSelect}
                  onAddSlide={onAddSlide}
                  onDeleteSlide={onDeleteSlide}
                  onDuplicateSlide={onDuplicateSlide}
                />
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>

        {/* Drawing Tools Section */}
        <Collapsible open={isToolsOpen} onOpenChange={setIsToolsOpen}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between p-3 h-auto"
            >
              <span className="font-medium">Drawing Tools</span>
              {isToolsOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="space-y-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Whiteboard Tools</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm text-gray-600">
                  <p>• Use mouse to draw</p>
                  <p>• Pen tablet supported</p>
                  <p>• Touch gestures enabled</p>
                </div>
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
};

export default SlidesSidebar;
