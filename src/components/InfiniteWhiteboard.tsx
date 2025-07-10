import React, { useRef, useEffect, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Canvas as FabricCanvas, Circle, Rect, Triangle, Line, Textbox, FabricImage, Point } from 'fabric';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MousePointer, 
  Pen, 
  Eraser, 
  Square, 
  Circle as CircleIcon, 
  Triangle as TriangleIcon, 
  Minus, 
  Type, 
  Image, 
  FileText, 
  ZoomIn, 
  ZoomOut, 
  Grid3X3, 
  Download, 
  Undo,
  Redo,
  Trash2
} from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';

interface InfiniteWhiteboardProps {
  onCanvasChange?: (data: any) => void;
  canvasData?: any;
  selectedTool?: string;
  brushSize?: number;
  brushColor?: string;
  onToolChange?: (tool: string) => void;
  onBrushSizeChange?: (size: number) => void;
  onBrushColorChange?: (color: string) => void;
  className?: string;
}

const InfiniteWhiteboard = forwardRef<any, InfiniteWhiteboardProps>(({
  onCanvasChange,
  canvasData,
  selectedTool: externalSelectedTool,
  brushSize: externalBrushSize,
  brushColor: externalBrushColor,
  onToolChange,
  onBrushSizeChange,
  onBrushColorChange,
  className
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fabricCanvasRef = useRef<FabricCanvas | null>(null);
  
  // Internal state
  const [selectedTool, setSelectedTool] = useState<'select' | 'pen' | 'eraser' | 'rectangle' | 'circle' | 'triangle' | 'line' | 'text'>('pen');
  const [brushSize, setBrushSize] = useState(5);
  const [brushColor, setBrushColor] = useState('#000000');
  const [canvasHistory, setCanvasHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showGrid, setShowGrid] = useState(false);
  const [zoom, setZoom] = useState(1);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    getCanvas: () => fabricCanvasRef.current,
    exportCanvas,
    clearCanvas
  }));

  // Initialize canvas with proper settings for drawing
  useEffect(() => {
    if (canvasRef.current && !fabricCanvasRef.current && containerRef.current) {
      try {
        const containerRect = containerRef.current.getBoundingClientRect();
        
        const canvas = new FabricCanvas(canvasRef.current, {
          width: containerRect.width,
          height: containerRect.height,
          backgroundColor: 'white',
          selection: false, // Start with drawing mode
          enableRetinaScaling: true,
          renderOnAddRemove: true,
          preserveObjectStacking: true
        });

        fabricCanvasRef.current = canvas;

        // Set initial drawing mode
        canvas.isDrawingMode = selectedTool === 'pen';
        
        // Initialize brush properly for Fabric.js v6
        if (canvas.freeDrawingBrush) {
          canvas.freeDrawingBrush.width = brushSize;
          canvas.freeDrawingBrush.color = brushColor;
        }

        // Add event listeners for changes
        canvas.on('path:created', handleCanvasChange);
        canvas.on('object:modified', handleCanvasChange);
        canvas.on('object:added', handleCanvasChange);
        canvas.on('object:removed', handleCanvasChange);

        // Add zoom and pan support
        canvas.on('mouse:wheel', handleWheel);

        // Load existing canvas data if provided
        if (canvasData && Object.keys(canvasData).length > 0) {
          try {
            canvas.loadFromJSON(canvasData, () => {
              canvas.renderAll();
            });
          } catch (error) {
            console.error('Error loading canvas data:', error);
          }
        }

        console.log('Canvas initialized successfully with tool:', selectedTool);
        saveToHistory();

      } catch (error) {
        console.error('Error initializing canvas:', error);
      }
    }

    return () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
      }
    };
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && fabricCanvasRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const canvas = fabricCanvasRef.current;
        canvas.setDimensions({
          width: containerRect.width,
          height: containerRect.height
        });
        canvas.renderAll();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle tool changes
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    console.log('Tool changed to:', selectedTool);

    switch(selectedTool) {
      case 'select':
        canvas.isDrawingMode = false;
        canvas.selection = true;
        canvas.defaultCursor = 'default';
        canvas.hoverCursor = 'move';
        break;
      case 'pen':
        canvas.isDrawingMode = true;
        canvas.selection = false;
        if (canvas.freeDrawingBrush) {
          canvas.freeDrawingBrush.width = brushSize;
          canvas.freeDrawingBrush.color = brushColor;
        }
        canvas.defaultCursor = 'crosshair';
        console.log('Pen mode enabled, brush width:', brushSize, 'color:', brushColor);
        break;
      case 'eraser':
        canvas.isDrawingMode = true;
        canvas.selection = false;
        if (canvas.freeDrawingBrush) {
          canvas.freeDrawingBrush.width = brushSize * 2;
          canvas.freeDrawingBrush.color = 'white'; // Eraser color
        }
        canvas.defaultCursor = 'crosshair';
        break;
      default:
        canvas.isDrawingMode = false;
        canvas.selection = true;
        canvas.defaultCursor = 'crosshair';
        break;
    }

    canvas.renderAll();
  }, [selectedTool, brushSize, brushColor]);

  const handleCanvasChange = useCallback(() => {
    if (fabricCanvasRef.current && onCanvasChange) {
      const json = fabricCanvasRef.current.toJSON();
      onCanvasChange(json);
      saveToHistory();
    }
  }, [onCanvasChange]);

  const saveToHistory = () => {
    if (fabricCanvasRef.current) {
      const json = JSON.stringify(fabricCanvasRef.current.toJSON());
      setCanvasHistory(prev => {
        const newHistory = prev.slice(0, historyIndex + 1);
        newHistory.push(json);
        return newHistory.slice(-20); // Keep last 20 states
      });
      setHistoryIndex(prev => Math.min(prev + 1, 19));
    }
  };

  const handleWheel = (opt: any) => {
    const delta = opt.e.deltaY;
    let zoom = fabricCanvasRef.current?.getZoom() || 1;
    zoom *= 0.999 ** delta;
    if (zoom > 20) zoom = 20;
    if (zoom < 0.01) zoom = 0.01;
    
    if (fabricCanvasRef.current) {
      const point = new Point(opt.e.offsetX, opt.e.offsetY);
      fabricCanvasRef.current.zoomToPoint(point, zoom);
      setZoom(zoom);
    }
    opt.e.preventDefault();
    opt.e.stopPropagation();
  };

  // Sync with external props - prioritize external props and log changes
  useEffect(() => {
    if (externalSelectedTool && externalSelectedTool !== selectedTool) {
      console.log('External tool change:', externalSelectedTool);
      setSelectedTool(externalSelectedTool as any);
    }
  }, [externalSelectedTool, selectedTool]);

  useEffect(() => {
    if (externalBrushSize !== undefined && externalBrushSize !== brushSize) {
      console.log('External brush size change:', externalBrushSize);
      setBrushSize(externalBrushSize);
    }
  }, [externalBrushSize, brushSize]);

  useEffect(() => {
    if (externalBrushColor && externalBrushColor !== brushColor) {
      console.log('External brush color change:', externalBrushColor);
      setBrushColor(externalBrushColor);
    }
  }, [externalBrushColor, brushColor]);

  // Update brush settings when they change
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    if (canvas.isDrawingMode && canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.width = brushSize;
      canvas.freeDrawingBrush.color = selectedTool === 'eraser' ? 'white' : brushColor;
      console.log('Brush updated - width:', brushSize, 'color:', brushColor, 'tool:', selectedTool);
    }
  }, [brushSize, brushColor, selectedTool]);

  // Shape creation functions
  const createShape = (shapeType: string) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const centerX = canvas.width! / 2;
    const centerY = canvas.height! / 2;

    let shape;
    switch (shapeType) {
      case 'rectangle':
        shape = new Rect({
          left: centerX - 50,
          top: centerY - 25,
          width: 100,
          height: 50,
          fill: brushColor,
          stroke: brushColor,
          strokeWidth: 2,
        });
        break;
      case 'circle':
        shape = new Circle({
          left: centerX - 50,
          top: centerY - 50,
          radius: 50,
          fill: 'transparent',
          stroke: brushColor,
          strokeWidth: 2,
        });
        break;
      case 'triangle':
        shape = new Triangle({
          left: centerX - 50,
          top: centerY - 50,
          width: 100,
          height: 100,
          fill: 'transparent',
          stroke: brushColor,
          strokeWidth: 2,
        });
        break;
      case 'line':
        shape = new Line([centerX - 50, centerY, centerX + 50, centerY], {
          stroke: brushColor,
          strokeWidth: brushSize,
        });
        break;
    }

    if (shape) {
      canvas.add(shape);
      canvas.setActiveObject(shape);
      canvas.renderAll();
      handleCanvasChange();
    }
  };

  const addText = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const text = new Textbox('Double click to edit', {
      left: canvas.width! / 2 - 75,
      top: canvas.height! / 2 - 10,
      width: 150,
      fontSize: 20,
      fill: brushColor,
      fontFamily: 'Arial',
    });

    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
    handleCanvasChange();
  };

  const uploadImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const canvas = fabricCanvasRef.current;
          if (!canvas) return;

          FabricImage.fromURL(event.target?.result as string).then((fabricImage) => {
            fabricImage.set({
              left: 100,
              top: 100,
              scaleX: 0.5,
              scaleY: 0.5,
            });
            canvas.add(fabricImage);
            canvas.renderAll();
            handleCanvasChange();
          });
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const uploadPDF = () => {
    toast("PDF upload feature coming soon!");
  };

  const toggleGrid = () => {
    setShowGrid(!showGrid);
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    if (!showGrid) {
      // Add grid pattern
      const gridSize = 20;
      const objects = [];
      
      for (let i = 0; i < canvas.width! / gridSize; i++) {
        objects.push(new Line([i * gridSize, 0, i * gridSize, canvas.height!], {
          stroke: '#e0e0e0',
          strokeWidth: 1,
          selectable: false,
          evented: false,
        }));
      }
      
      for (let i = 0; i < canvas.height! / gridSize; i++) {
        objects.push(new Line([0, i * gridSize, canvas.width!, i * gridSize], {
          stroke: '#e0e0e0',
          strokeWidth: 1,
          selectable: false,
          evented: false,
        }));
      }
      
      objects.forEach(obj => canvas.add(obj));
      objects.forEach(obj => canvas.sendObjectToBack(obj));
    } else {
      // Remove grid
      const objects = canvas.getObjects().filter(obj => 
        obj.stroke === '#e0e0e0' && !obj.selectable
      );
      objects.forEach(obj => canvas.remove(obj));
    }
    
    canvas.renderAll();
  };

  const zoomIn = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    
    const newZoom = Math.min(zoom * 1.2, 5);
    canvas.setZoom(newZoom);
    setZoom(newZoom);
    canvas.renderAll();
  };

  const zoomOut = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    
    const newZoom = Math.max(zoom / 1.2, 0.1);
    canvas.setZoom(newZoom);
    setZoom(newZoom);
    canvas.renderAll();
  };

  const exportCanvas = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const dataURL = canvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 2,
    });

    const link = document.createElement('a');
    link.download = 'whiteboard.png';
    link.href = dataURL;
    link.click();
    
    toast("Canvas exported successfully!");
  };

  const clearCanvas = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    
    canvas.clear();
    canvas.backgroundColor = 'white';
    canvas.renderAll();
    handleCanvasChange();
    toast("Canvas cleared!");
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
      const canvas = fabricCanvasRef.current;
      if (canvas && canvasHistory[historyIndex - 1]) {
        canvas.loadFromJSON(canvasHistory[historyIndex - 1], () => {
          canvas.renderAll();
        });
      }
    }
  };

  const redo = () => {
    if (historyIndex < canvasHistory.length - 1) {
      setHistoryIndex(prev => prev + 1);
      const canvas = fabricCanvasRef.current;
      if (canvas && canvasHistory[historyIndex + 1]) {
        canvas.loadFromJSON(canvasHistory[historyIndex + 1], () => {
          canvas.renderAll();
        });
      }
    }
  };

  const handleToolSelect = (tool: typeof selectedTool) => {
    setSelectedTool(tool);
    onToolChange?.(tool);
  };

  const handleBrushSizeChange = (size: number) => {
    setBrushSize(size);
    onBrushSizeChange?.(size);
  };

  const handleBrushColorChange = (color: string) => {
    setBrushColor(color);
    onBrushColorChange?.(color);
  };

  return (
    <div className={`relative w-full h-full bg-gray-50 ${className || ''}`}>

      {/* Secondary Toolbar */}
      <Card className="absolute top-4 right-4 z-10 bg-white/95 backdrop-blur-sm shadow-lg">
        <CardContent className="p-3">
          <div className="flex gap-1">
            <Button variant="outline" size="sm" onClick={undo} title="Undo">
              <Undo className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={redo} title="Redo">
              <Redo className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={zoomIn} title="Zoom In">
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={zoomOut} title="Zoom Out">
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button 
              variant={showGrid ? 'default' : 'outline'} 
              size="sm" 
              onClick={toggleGrid} 
              title="Toggle Grid"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={exportCanvas} title="Export">
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={clearCanvas} title="Clear">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Canvas Container */}
      <div 
        ref={containerRef} 
        className="w-full h-full overflow-hidden cursor-crosshair"
        style={{ touchAction: 'none' }} // Important for pen/touch support
      >
        <canvas 
          ref={canvasRef}
          className="border-none outline-none"
          style={{ touchAction: 'none' }} // Prevent default touch behaviors
        />
      </div>

      {/* Zoom indicator */}
      <div className="absolute bottom-4 right-4 bg-black/20 text-white px-2 py-1 rounded text-sm">
        {Math.round(zoom * 100)}%
      </div>
    </div>
  );
});

InfiniteWhiteboard.displayName = 'InfiniteWhiteboard';

export default InfiniteWhiteboard;