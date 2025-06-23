
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
  RotateCcw,
  Palette,
  Settings,
  Layers,
  Grid3X3,
  MousePointer
} from 'lucide-react';
import { Canvas as FabricCanvas, FabricText, FabricImage, Rect, Circle as FabricCircle, Path } from 'fabric';
import { useToast } from "@/hooks/use-toast";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

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
  
  const [selectedTool, setSelectedTool] = useState<'select' | 'pen' | 'eraser' | 'text' | 'rectangle' | 'circle' | 'line'>('pen');
  const [brushColor, setBrushColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(3);
  const [zoom, setZoom] = useState(1);
  const [history, setHistory] = useState<any[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showGrid, setShowGrid] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(false);
  
  // Collapsible states
  const [toolsOpen, setToolsOpen] = useState(true);
  const [colorsOpen, setColorsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Initialize canvas with proper settings
  useEffect(() => {
    if (canvasRef.current && !fabricCanvasRef.current) {
      try {
        const canvas = new FabricCanvas(canvasRef.current, {
          width: window.innerWidth - 400, // Account for sidebar
          height: window.innerHeight - 150, // Account for header
          backgroundColor: 'white',
          selection: selectedTool === 'select',
          enableRetinaScaling: true,
          allowTouchScrolling: true
        });

        fabricCanvasRef.current = canvas;

        // Set up drawing mode with proper brush settings
        canvas.isDrawingMode = selectedTool === 'pen' || selectedTool === 'eraser';
        if (canvas.freeDrawingBrush) {
          canvas.freeDrawingBrush.width = brushSize;
          canvas.freeDrawingBrush.color = selectedTool === 'eraser' ? canvas.backgroundColor as string : brushColor;
        }

        // Add event listeners for changes
        canvas.on('path:created', handleCanvasChange);
        canvas.on('object:modified', handleCanvasChange);
        canvas.on('object:added', handleCanvasChange);
        canvas.on('object:removed', handleCanvasChange);

        // Add zoom and pan support
        canvas.on('mouse:wheel', handleWheel);
        
        // Pan functionality
        let isDragging = false;
        let lastPosX = 0;
        let lastPosY = 0;

        canvas.on('mouse:down', function(opt) {
          const evt = opt.e;
          if (evt.altKey === true || selectedTool === 'pan') {
            isDragging = true;
            canvas.selection = false;
            lastPosX = evt.clientX;
            lastPosY = evt.clientY;
          }
        });

        canvas.on('mouse:move', function(opt) {
          if (isDragging) {
            const e = opt.e;
            const vpt = canvas.viewportTransform;
            if (vpt) {
              vpt[4] += e.clientX - lastPosX;
              vpt[5] += e.clientY - lastPosY;
              canvas.requestRenderAll();
              lastPosX = e.clientX;
              lastPosY = e.clientY;
            }
          }
        });

        canvas.on('mouse:up', function() {
          canvas.setViewportTransform(canvas.viewportTransform);
          isDragging = false;
          canvas.selection = true;
        });

        // Load existing canvas data if provided
        if (canvasData && Object.keys(canvasData).length > 0) {
          canvas.loadFromJSON(canvasData).then(() => {
            canvas.renderAll();
          }).catch((error) => {
            console.error('Error loading canvas data:', error);
          });
        }

        // Add initial state to history
        const initialState = canvas.toJSON();
        setHistory([initialState]);
        setHistoryIndex(0);

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

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (fabricCanvasRef.current) {
        const canvas = fabricCanvasRef.current;
        canvas.setDimensions({
          width: window.innerWidth - 400,
          height: window.innerHeight - 150
        });
        canvas.renderAll();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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
  }, [onChange, historyIndex]);

  const handleWheel = (opt: any) => {
    const delta = opt.e.deltaY;
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    let newZoom = canvas.getZoom();
    newZoom *= 0.999 ** delta;
    
    if (newZoom > 20) newZoom = 20;
    if (newZoom < 0.01) newZoom = 0.01;
    
    const point = { x: opt.e.offsetX, y: opt.e.offsetY };
    canvas.zoomToPoint(point, newZoom);
    setZoom(newZoom);
    
    opt.e.preventDefault();
    opt.e.stopPropagation();
  };

  const addShape = (shapeType: 'rectangle' | 'circle' | 'line') => {
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
      } else if (shapeType === 'circle') {
        shape = new FabricCircle({
          left: 100,
          top: 100,
          fill: 'transparent',
          stroke: brushColor,
          strokeWidth: 2,
          radius: 50
        });
      }
      
      if (shape) {
        fabricCanvasRef.current.add(shape);
        fabricCanvasRef.current.setActiveObject(shape);
        handleCanvasChange();
      }
    } catch (error) {
      console.error('Error adding shape:', error);
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
      } catch (error) {
        console.error('Error clearing canvas:', error);
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
    }
  };

  const resetZoom = () => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.setZoom(1);
      fabricCanvasRef.current.viewportTransform = [1, 0, 0, 1, 0, 0];
      fabricCanvasRef.current.renderAll();
      setZoom(1);
    }
  };

  const colors = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', 
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080', 
    '#008000', '#FFC0CB', '#A52A2A', '#808080', '#87CEEB'
  ];

  const brushSizes = [1, 2, 3, 5, 8, 12, 16, 20, 25, 30];

  return (
    <div className="h-full flex" ref={containerRef}>
      {/* Left Toolbar */}
      <div className="w-16 bg-gray-100 border-r flex flex-col items-center py-4 space-y-2">
        {/* Main Tools */}
        <Button
          variant={selectedTool === 'select' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTool('select')}
          className="w-12 h-12"
        >
          <MousePointer className="h-5 w-5" />
        </Button>
        
        <Button
          variant={selectedTool === 'pen' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTool('pen')}
          className="w-12 h-12"
        >
          <Pen className="h-5 w-5" />
        </Button>
        
        <Button
          variant={selectedTool === 'eraser' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTool('eraser')}
          className="w-12 h-12"
        >
          <Eraser className="h-5 w-5" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={addText}
          className="w-12 h-12"
        >
          <Type className="h-5 w-5" />
        </Button>

        <Separator className="w-8" />

        {/* Shapes */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => addShape('rectangle')}
          className="w-12 h-12"
        >
          <Square className="h-5 w-5" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => addShape('circle')}
          className="w-12 h-12"
        >
          <Circle className="h-5 w-5" />
        </Button>

        <Separator className="w-8" />

        {/* History */}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={undo}
          disabled={historyIndex <= 0}
          className="w-12 h-12"
        >
          <Undo className="h-5 w-5" />
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={redo}
          disabled={historyIndex >= history.length - 1}
          className="w-12 h-12"
        >
          <Redo className="h-5 w-5" />
        </Button>
      </div>

      {/* Right Panel - Collapsible Tools */}
      <div className="w-80 bg-white border-l flex flex-col">
        {/* Tools Panel */}
        <Collapsible open={toolsOpen} onOpenChange={setToolsOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-4">
              <span className="font-medium">Drawing Tools</span>
              <Settings className="h-4 w-4" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="p-4 space-y-4">
            {/* Brush Size */}
            <div>
              <label className="text-sm font-medium mb-2 block">Brush Size: {brushSize}px</label>
              <div className="grid grid-cols-5 gap-2">
                {brushSizes.map((size) => (
                  <Button
                    key={size}
                    variant={brushSize === size ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setBrushSize(size)}
                    className="aspect-square"
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>

            {/* Zoom Controls */}
            <div>
              <label className="text-sm font-medium mb-2 block">Zoom: {Math.round(zoom * 100)}%</label>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => setZoom(Math.max(0.1, zoom - 0.2))}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={resetZoom}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setZoom(Math.min(5, zoom + 0.2))}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Colors Panel */}
        <Collapsible open={colorsOpen} onOpenChange={setColorsOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-4">
              <span className="font-medium">Colors</span>
              <Palette className="h-4 w-4" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="p-4">
            <div className="grid grid-cols-5 gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  className={`w-12 h-12 rounded border-2 ${
                    brushColor === color ? 'border-gray-800 ring-2 ring-blue-500' : 'border-gray-300'
                  } hover:scale-110 transition-transform`}
                  style={{ backgroundColor: color }}
                  onClick={() => setBrushColor(color)}
                />
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Export Panel */}
        <Collapsible open={settingsOpen} onOpenChange={setSettingsOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-4">
              <span className="font-medium">Export & Settings</span>
              <Download className="h-4 w-4" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="p-4 space-y-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => exportCanvas('png')}
              className="w-full"
            >
              Export as PNG
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => exportCanvas('svg')}
              className="w-full"
            >
              Export as SVG
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearCanvas}
              className="w-full"
            >
              Clear Canvas
            </Button>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 bg-gray-50 overflow-hidden relative">
        <canvas 
          ref={canvasRef} 
          className="border-none" 
        />
        
        {/* Zoom indicator */}
        <div className="absolute bottom-4 right-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded text-sm">
          {Math.round(zoom * 100)}%
        </div>
      </div>
    </div>
  );
};

export default InfiniteWhiteboard;
