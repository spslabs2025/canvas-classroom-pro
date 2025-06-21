
import { useRef, useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Pen, Eraser, Type, Undo, Redo, Upload, Palette, Minus, Plus } from 'lucide-react';
import { fabric } from 'fabric';

interface WhiteboardProps {
  canvasData?: any;
  onChange?: (canvasData: any) => void;
}

const Whiteboard = ({ canvasData, onChange }: WhiteboardProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const [selectedTool, setSelectedTool] = useState<'pen' | 'eraser' | 'text'>('pen');
  const [brushColor, setBrushColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);

  useEffect(() => {
    if (canvasRef.current && !fabricCanvasRef.current) {
      const canvas = new fabric.Canvas(canvasRef.current, {
        width: 800,
        height: 600,
        backgroundColor: 'white'
      });

      fabricCanvasRef.current = canvas;

      // Set up drawing mode
      canvas.isDrawingMode = true;
      canvas.freeDrawingBrush.width = brushSize;
      canvas.freeDrawingBrush.color = brushColor;

      // Listen for canvas changes
      canvas.on('path:created', () => {
        handleCanvasChange();
      });

      canvas.on('object:modified', () => {
        handleCanvasChange();
      });

      // Load existing canvas data
      if (canvasData && Object.keys(canvasData).length > 0) {
        canvas.loadFromJSON(canvasData, () => {
          canvas.renderAll();
        });
      }
    }

    return () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (fabricCanvasRef.current) {
      const canvas = fabricCanvasRef.current;
      
      if (selectedTool === 'pen') {
        canvas.isDrawingMode = true;
        canvas.freeDrawingBrush.width = brushSize;
        canvas.freeDrawingBrush.color = brushColor;
      } else if (selectedTool === 'eraser') {
        canvas.isDrawingMode = true;
        canvas.freeDrawingBrush.width = brushSize * 2;
        canvas.freeDrawingBrush.color = 'white';
      } else {
        canvas.isDrawingMode = false;
      }
    }
  }, [selectedTool, brushColor, brushSize]);

  const handleCanvasChange = () => {
    if (fabricCanvasRef.current && onChange) {
      const canvasJson = fabricCanvasRef.current.toJSON();
      onChange(canvasJson);
    }
  };

  const addText = () => {
    if (fabricCanvasRef.current) {
      const text = new fabric.IText('Click to edit', {
        left: 100,
        top: 100,
        fontFamily: 'Arial',
        fontSize: 20,
        fill: brushColor
      });
      fabricCanvasRef.current.add(text);
      fabricCanvasRef.current.setActiveObject(text);
      handleCanvasChange();
    }
  };

  const undo = () => {
    if (fabricCanvasRef.current) {
      const objects = fabricCanvasRef.current.getObjects();
      if (objects.length > 0) {
        fabricCanvasRef.current.remove(objects[objects.length - 1]);
        handleCanvasChange();
      }
    }
  };

  const clearCanvas = () => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.clear();
      fabricCanvasRef.current.backgroundColor = 'white';
      fabricCanvasRef.current.renderAll();
      handleCanvasChange();
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && fabricCanvasRef.current) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imgUrl = e.target?.result as string;
        fabric.Image.fromURL(imgUrl, (img) => {
          if (fabricCanvasRef.current) {
            img.scaleToWidth(400);
            fabricCanvasRef.current.add(img);
            handleCanvasChange();
          }
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const colors = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500'];

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b p-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {/* Drawing Tools */}
          <Button
            variant={selectedTool === 'pen' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedTool('pen')}
          >
            <Pen className="h-4 w-4" />
          </Button>
          
          <Button
            variant={selectedTool === 'eraser' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedTool('eraser')}
          >
            <Eraser className="h-4 w-4" />
          </Button>
          
          <Button
            variant={selectedTool === 'text' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setSelectedTool('text');
              addText();
            }}
          >
            <Type className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="h-6" />

          {/* Brush Size */}
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBrushSize(Math.max(1, brushSize - 1))}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="text-sm w-8 text-center">{brushSize}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBrushSize(Math.min(20, brushSize + 1))}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Colors */}
          <div className="flex items-center space-x-1">
            {colors.map((color) => (
              <button
                key={color}
                className={`w-6 h-6 rounded border-2 ${
                  brushColor === color ? 'border-gray-800' : 'border-gray-300'
                }`}
                style={{ backgroundColor: color }}
                onClick={() => setBrushColor(color)}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Actions */}
          <Button variant="outline" size="sm" onClick={undo}>
            <Undo className="h-4 w-4" />
          </Button>
          
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="image-upload"
          />
          <Button variant="outline" size="sm" asChild>
            <label htmlFor="image-upload" className="cursor-pointer flex items-center">
              <Upload className="h-4 w-4" />
            </label>
          </Button>
          
          <Button variant="outline" size="sm" onClick={clearCanvas}>
            Clear
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 bg-white p-4 overflow-hidden">
        <div className="flex justify-center">
          <canvas ref={canvasRef} className="border border-gray-300 shadow-sm" />
        </div>
      </div>
    </div>
  );
};

export default Whiteboard;
