
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Copy, Trash2 } from 'lucide-react';

interface Slide {
  id: string;
  lesson_id: string;
  order_index: number;
  canvas_data: any;
}

interface SlideManagerProps {
  slides: Slide[];
  currentSlideIndex: number;
  onSlideSelect: (index: number) => void;
  onAddSlide: () => void;
}

const SlideManager = ({ slides, currentSlideIndex, onSlideSelect, onAddSlide }: SlideManagerProps) => {
  return (
    <div className="bg-gray-800 p-3 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-medium">Slides</h3>
        <Button
          onClick={onAddSlide}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Slide
        </Button>
      </div>
      
      <div className="flex space-x-2 overflow-x-auto">
        {slides.map((slide, index) => (
          <Card
            key={slide.id}
            className={`min-w-24 cursor-pointer transition-all ${
              index === currentSlideIndex 
                ? 'border-blue-500 border-2' 
                : 'border-gray-600 hover:border-gray-500'
            }`}
            onClick={() => onSlideSelect(index)}
          >
            <CardContent className="p-2">
              <div className="bg-white h-16 w-20 rounded border flex items-center justify-center text-xs text-gray-500">
                Slide {index + 1}
              </div>
              <div className="mt-1 text-xs text-gray-400 text-center">
                {index + 1}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SlideManager;
