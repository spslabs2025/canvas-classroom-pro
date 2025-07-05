
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Copy, Trash2 } from 'lucide-react';
import { Slide, SlideManagerProps } from '@/types';

const SlideManager = ({ 
  slides, 
  currentSlideIndex, 
  onSlideSelect, 
  onAddSlide,
  onDeleteSlide,
  onDuplicateSlide 
}: SlideManagerProps) => {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="font-medium text-sm">Manage Slides</h3>
        <Button
          onClick={onAddSlide}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-3 w-3 mr-1" />
          Add
        </Button>
      </div>
      
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {slides.map((slide, index) => (
          <Card
            key={slide.id}
            className={`cursor-pointer transition-all ${
              index === currentSlideIndex 
                ? 'border-blue-500 border-2 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onSlideSelect(index)}
          >
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-white h-8 w-10 rounded border flex items-center justify-center text-xs text-gray-500">
                    {index + 1}
                  </div>
                  <span className="text-sm font-medium">Slide {index + 1}</span>
                </div>
                
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicateSlide(slide.id);
                    }}
                    className="h-6 w-6 p-0"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  
                  {slides.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSlide(slide.id);
                      }}
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SlideManager;
