import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ChevronDown, ChevronRight, Layers, Copy, Trash2 } from 'lucide-react';
import SlideManager from './SlideManager';

interface Slide {
  id: string;
  lesson_id: string;
  order_index: number;
  canvas_data: any;
}

interface FloatingSlidesSidebarProps {
  slides: Slide[];
  currentSlideIndex: number;
  onSlideSelect: (index: number) => void;
  onAddSlide: () => void;
  onDeleteSlide: (slideId: string) => void;
  onDuplicateSlide: (slideId: string) => void;
}

const FloatingSlidesSidebar = ({ 
  slides, 
  currentSlideIndex, 
  onSlideSelect, 
  onAddSlide,
  onDeleteSlide,
  onDuplicateSlide 
}: FloatingSlidesSidebarProps) => {
  const [isSlidesOpen, setIsSlidesOpen] = useState(true);
  const [isToolsOpen, setIsToolsOpen] = useState(false);

  return (
    <>
      {/* Trigger Button */}
      <Sheet>
        <SheetTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="fixed top-1/2 right-4 z-50 transform -translate-y-1/2 shadow-lg bg-white"
          >
            <Layers className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        
        <SheetContent side="right" className="w-80">
          <div className="space-y-4 mt-6">
            <div className="pb-4 border-b">
              <h2 className="text-lg font-semibold">Slides & Tools</h2>
            </div>
            
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
        </SheetContent>
      </Sheet>
    </>
  );
};

export default FloatingSlidesSidebar;