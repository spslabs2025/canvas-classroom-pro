
import { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Pen, 
  Eraser, 
  Type, 
  Undo, 
  Redo, 
  Upload, 
  Download,
  Square,
  Circle,
  Minus,
  Plus,
  Move,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from 'lucide-react';
import { Canvas as FabricCanvas, FabricText, FabricImage, Rect, Circle as FabricCircle } from 'fabric';
import { useToast } from "@/hooks/use-toast";

interface InfiniteWhiteboardProps {
  canvasData?: any;
  onChange?: (canvasData: any) => void;
  isCollaborative?: boolean;
}

const InfiniteWhiteboard = ({ canvasData, onChange, isCollaborative = false }: InfiniteWhiteboardProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<FabricCanvas | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const [selectedTool, setSelectedTool] = useState<'select' | 'pen' | 'eraser' | 'text' | 'rectangle' | 'circle'>('pen');
  const [brushColor, setBrushColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [history, setHistory] = useState<any[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isAutoSaving, setIsAutoSaving] = useState(false);

  // Initialize canvas
  useEffect(() => {
    if (canvasRef.current && !fabricCanvasRef.current) {
      try {
        const canvas = new FabricCanvas(canvasRef.current, {
          width: 1200,
          height: 800,
          backgroundColor: 'white',
          selection: selectedTool === 'select'
        });

        fabricCanvasRef.current = canvas;

        // Set up drawing mode
        canvas.isDrawingMode = selectedTool === 'pen' || selectedTool === 'eraser';
        if (canvas.freeDrawingBrush) {
          canvas.freeDrawingBrush.width = brushSize;
          canvas.freeDrawingBrush.color = selectedTool === 'eraser' ? 'white' : brushColor;
        }

        // Add event listeners
        canvas.on('path:created', handleCanvasChange);
        canvas.on('object:modified', handleCanvasChange);
        canvas.on('object:added', handleCanvasChange);
        canvas.on('object:removed', handleCanvasChange);

        // Load existing canvas data
        if (canvasData && Object.keys(canvasData).length > 0) {
          canvas.loadFromJSON(canvasData).then(() => {
            canvas.renderAll();
          }).catch((error) => {
            console.error('Error loading canvas data:', error);
            toast({
              title: "Error",
              description: "Failed to load canvas data",
              variant: "destructive"
            });
          });
        }

        // Add zoom and pan support
        canvas.on('mouse:wheel', handleWheel);
        
      } catch (error) {
        console.error('Error initializing canvas:', error);
        toast({
          title: "Error",
          description: "Failed to initialize whiteboard",
          variant: "destructive"
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

  // Update tool settings
  useEffect(() => {
    if (fabricCanvasRef.current) {
      const canvas = fabricCanvasRef.current;
      
      canvas.selection = selectedTool === 'select';
      canvas.isDrawingMode = selectedTool === 'pen' || selectedTool === 'eraser';
      
      if (canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush.width = brushSize;
        canvas.freeDrawingBrush.color = selectedTool === 'eraser' ? canvas.backgroundColor as string : brushColor;
      }
    }
  }, [selectedTool, brushColor, brushSize]);

  const handleCanvasChange = useCallback(() => {
    if (fabricCanvasRef.current && onChange) {
      try {
        const canvasJson = fabricCanvasRef.current.toJSON();
        onChange(canvasJson);
        
        // Auto-save functionality
        if (!isAutoSaving) {
          setIsAutoSaving(true);
          setTimeout(() => {
            setIsAutoSaving(false);
          }, 1000);
        }
        
        // Update history
        setHistory(prev => {
          const newHistory = [...prev.slice(0, historyIndex + 1), canvasJson];
          return newHistory.slice(-50); // Keep last 50 states
        });
        setHistoryIndex(prev => Math.min(prev + 1, 49));
        
      } catch (error) {
        console.error('Error handling canvas change:', error);
      }
    }
  }, [onChange, historyIndex, isAutoSaving]);

  const handleWheel = (opt: any) => {
    const delta = opt.e.deltaY;
    let newZoom = zoom;
    
    if (delta > 0) {
      newZoom = Math.max(0.1, zoom - 0.1);
    } else {
      newZoom = Math.min(5, zoom + 0.1);
    }
    
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.setZoom(newZoom);
      setZoom(newZoom);
    }
    
    opt.e.preventDefault();
    opt.e.stopPropagation();
  };

  const addShape = (shapeType: 'rectangle' | 'circle') => {
    if (!fabricCanvasRef.current) return;
    
    try {
      let shape;
      
      if (shapeType === 'rectangle') {
        shape = new Rect({
          left: 100,
          top: 100,
          fill: 'transparent',
          stroke: brushColor,
          strokeWidth: 2,
          width: 100,
          height: 60
        });
      } else {
        shape = new FabricCircle({
          left: 100,
          top: 100,
          fill: 'transparent',
          stroke: brushColor,
          strokeWidth: 2,
          radius: 50
        });
      }
      
      fabricCanvasRef.current.add(shape);
      fabricCanvasRef.current.setActiveObject(shape);
      handleCanvasChange();
    } catch (error) {
      console.error('Error adding shape:', error);
      toast({
        title: "Error",
        description: "Failed to add shape",
        variant: "destructive"
      });
    }
  };

  const addText = () => {
    if (!fabricCanvasRef.current) return;
    
    try {
      const text = new FabricText('Click to edit', {
        left: 100,
        top: 100,
        fontFamily: 'Arial',
        fontSize: 20,
        fill: brushColor
      });
      
      fabricCanvasRef.current.add(text);
      fabricCanvasRef.current.setActiveObject(text);
      handleCanvasChange();
    } catch (error) {
      console.error('Error adding text:', error);
      toast({
        title: "Error",
        description: "Failed to add text",
        variant: "destructive"
      });
    }
  };

  const undo = () => {
    if (historyIndex > 0 && fabricCanvasRef.current) {
      try {
        const previousState = history[historyIndex - 1];
        fabricCanvasRef.current.loadFromJSON(previousState).then(() => {
          fabricCanvasRef.current?.renderAll();
          setHistoryIndex(prev => prev - 1);
        });
      } catch (error) {
        console.error('Error during undo:', error);
      }
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1 && fabricCanvasRef.current) {
      try {
        const nextState = history[historyIndex + 1];
        fabricCanvasRef.current.loadFromJSON(nextState).then(() => {
          fabricCanvasRef.current?.renderAll();
          setHistoryIndex(prev => prev + 1);
        });
      } catch (error) {
        console.error('Error during redo:', error);
      }
    }
  };

  const clearCanvas = () => {
    if (fabricCanvasRef.current) {
      try {
        fabricCanvasRef.current.clear();
        fabricCanvasRef.current.backgroundColor = 'white';
        fabricCanvasRef.current.renderAll();
        handleCanvasChange();
        
        toast({
          title: "Canvas cleared",
          description: "All content has been removed from the canvas",
        });
      } catch (error) {
        console.error('Error clearing canvas:', error);
      }
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && fabricCanvasRef.current) {
      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imgUrl = e.target?.result as string;
          FabricImage.fromURL(imgUrl).then((img) => {
            if (fabricCanvasRef.current) {
              img.scaleToWidth(400);
              fabricCanvasRef.current.add(img);
              handleCanvasChange();
            }
          }).catch((error) => {
            console.error('Error loading image:', error);
            toast({
              title: "Error",
              description: "Failed to load image",
              variant: "destructive"
            });
          });
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Error handling image upload:', error);
      }
    }
  };

  const exportCanvas = (format: 'png' | 'svg' | 'pdf') => {
    if (!fabricCanvasRef.current) return;
    
    try {
      if (format === 'png') {
        const dataURL = fabricCanvasRef.current.toDataURL({
          format: 'png',
          quality: 1,
          multiplier: 1
        });
        const link = document.createElement('a');
        link.download = 'whiteboard.png';
        link.href = dataURL;
        link.click();
      } else if (format === 'svg') {
        const svg = fabricCanvasRef.current.toSVG();
        const blob = new Blob([svg], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = 'whiteboard.svg';
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      }
      
      toast({
        title: "Export successful",
        description: `Canvas exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      console.error('Error exporting canvas:', error);
      toast({
        title: "Export failed",
        description: "Failed to export canvas",
        variant: "destructive"
      });
    }
  };

  const zoomIn = () => {
    const newZoom = Math.min(5, zoom + 0.2);
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.setZoom(newZoom);
      setZoom(newZoom);
    }
  };

  const zoomOut = () => {
    const newZoom = Math.max(0.1, zoom - 0.2);
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.setZoom(newZoom);
      setZoom(newZoom);
    }
  };

  const resetZoom = () => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.setZoom(1);
      setZoom(1);
    }
  };

  const colors = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#008000'];

  return (
    <div className="h-full flex flex-col" ref={containerRef}>
      {/* Enhanced Toolbar */}
      <div className="bg-gray-50 border-b p-3 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center space-x-2">
          {/* Tool Selection */}
          <div className="flex items-center space-x-1">
            <Button
              variant={selectedTool === 'select' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTool('select')}
              title="Select Tool"
            >
              <Move className="h-4 w-4" />
            </Button>
            
            <Button
              variant={selectedTool === 'pen' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTool('pen')}
              title="Pen Tool"
            >
              <Pen className="h-4 w-4" />
            </Button>
            
            <Button
              variant={selectedTool === 'eraser' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTool('eraser')}
              title="Eraser Tool"
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
              title="Text Tool"
            >
              <Type className="h-4 w-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Shape Tools */}
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => addShape('rectangle')}
              title="Add Rectangle"
            >
              <Square className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => addShape('circle')}
              title="Add Circle"
            >
              <Circle className="h-4 w-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Brush Size Controls */}
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBrushSize(Math.max(1, brushSize - 1))}
              title="Decrease Brush Size"
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="text-sm w-8 text-center">{brushSize}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBrushSize(Math.min(50, brushSize + 1))}
              title="Increase Brush Size"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Color Palette */}
          <div className="flex items-center space-x-1">
            {colors.map((color) => (
              <button
                key={color}
                className={`w-6 h-6 rounded border-2 ${
                  brushColor === color ? 'border-gray-800' : 'border-gray-300'
                } hover:scale-110 transition-transform`}
                style={{ backgroundColor: color }}
                onClick={() => setBrushColor(color)}
                title={`Select ${color}`}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Zoom Controls */}
          <div className="flex items-center space-x-1">
            <Button variant="outline" size="sm" onClick={zoomOut} title="Zoom Out">
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm w-12 text-center">{Math.round(zoom * 100)}%</span>
            <Button variant="outline" size="sm" onClick={zoomIn} title="Zoom In">
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={resetZoom} title="Reset Zoom">
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* History Controls */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={undo}
            disabled={historyIndex <= 0}
            title="Undo"
          >
            <Undo className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            title="Redo"
          >
            <Redo className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="h-6" />

          {/* File Operations */}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="image-upload"
          />
          <Button variant="outline" size="sm" asChild title="Upload Image">
            <label htmlFor="image-upload" className="cursor-pointer flex items-center">
              <Upload className="h-4 w-4" />
            </label>
          </Button>

          <div className="relative group">
            <Button variant="outline" size="sm" title="Export Canvas">
              <Download className="h-4 w-4" />
            </Button>
            <div className="absolute right-0 top-full mt-1 bg-white border rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <button
                onClick={() => exportCanvas('png')}
                className="block px-3 py-2 text-sm hover:bg-gray-100 w-full text-left"
              >
                Export as PNG
              </button>
              <button
                onClick={() => exportCanvas('svg')}
                className="block px-3 py-2 text-sm hover:bg-gray-100 w-full text-left"
              >
                Export as SVG
              </button>
            </div>
          </div>
          
          <Button variant="outline" size="sm" onClick={clearCanvas} title="Clear Canvas">
            Clear
          </Button>

          {isAutoSaving && (
            <span className="text-xs text-green-600 animate-pulse">Auto-saving...</span>
          )}
        </div>
      </div>

      {/* Canvas Container */}
      <div className="flex-1 bg-white p-4 overflow-hidden relative">
        <div className="w-full h-full flex justify-center items-center">
          <canvas 
            ref={canvasRef} 
            className="border border-gray-300 shadow-sm max-w-full max-h-full" 
          />
        </div>
        
        {/* Zoom indicator */}
        <div className="absolute bottom-4 right-4 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
          {Math.round(zoom * 100)}%
        </div>
      </div>
    </div>
  );
};

export default InfiniteWhiteboard;
