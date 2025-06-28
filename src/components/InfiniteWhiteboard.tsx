import { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
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
  MousePointer,
  Menu,
  Triangle
} from 'lucide-react';
import { Canvas as FabricCanvas, FabricText, FabricImage, Rect, Circle as FabricCircle, Polygon, Point } from 'fabric';
import { useToast } from "@/hooks/use-toast";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface InfiniteWhiteboardProps {
  canvasData?: any;
  onChange?: (canvasData: any) => void;
  isCollaborative?: boolean;
  className?: string;
}

const InfiniteWhiteboard = ({ canvasData, onChange, isCollaborative = false, className }: InfiniteWhiteboardProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<FabricCanvas | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const [selectedTool, setSelectedTool] = useState<'select' | 'pen' | 'eraser' | 'text' | 'rectangle' | 'circle' | 'triangle' | 'line' | 'pan'>('pen');
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

  // Initialize canvas with proper settings for drawing
  useEffect(() => {
    if (canvasRef.current && !fabricCanvasRef.current && containerRef.current) {
      try {
        const containerRect = containerRef.current.getBoundingClientRect();
        
        const canvas = new FabricCanvas(canvasRef.current, {
          width: containerRect.width - 400, // Account for toolbar space
          height: containerRect.height,
          backgroundColor: 'white',
          selection: true,
          enableRetinaScaling: true,
          allowTouchScrolling: true,
          renderOnAddRemove: true,
          preserveObjectStacking: true
        });

        fabricCanvasRef.current = canvas;

        // Optimize for drawing performance
        canvas.isDrawingMode = true;
        if (canvas.freeDrawingBrush) {
          canvas.freeDrawingBrush.width = brushSize;
          canvas.freeDrawingBrush.color = brushColor;
          canvas.freeDrawingBrush.strokeLineCap = 'round';
          canvas.freeDrawingBrush.strokeLineJoin = 'round';
        }

        // Enhanced touch and pen tablet support
        canvas.on('mouse:down', function(opt) {
          if (opt.e.type === 'touchstart' || opt.e.type === 'pointerdown') {
            // Prevent default touch behaviors that might interfere with drawing
            opt.e.preventDefault();
          }
        });

        // Add event listeners for changes
        canvas.on('path:created', handleCanvasChange);
        canvas.on('object:modified', handleCanvasChange);
        canvas.on('object:added', handleCanvasChange);
        canvas.on('object:removed', handleCanvasChange);

        // Add zoom and pan support
        canvas.on('mouse:wheel', handleWheel);
        
        // Pan functionality with Alt key or pan tool
        let isDragging = false;
        let lastPosX = 0;
        let lastPosY = 0;

        canvas.on('mouse:down', function(opt) {
          const evt = opt.e as MouseEvent | TouchEvent;
          let clientX = 0;
          let clientY = 0;
          
          if (evt instanceof MouseEvent) {
            clientX = evt.clientX;
            clientY = evt.clientY;
          } else if (evt instanceof TouchEvent && evt.touches.length > 0) {
            clientX = evt.touches[0].clientX;
            clientY = evt.touches[0].clientY;
          }
          
          const hasAltKey = evt instanceof MouseEvent && evt.altKey;
          
          if (hasAltKey || selectedTool === 'pan') {
            isDragging = true;
            canvas.selection = false;
            canvas.isDrawingMode = false;
            lastPosX = clientX;
            lastPosY = clientY;
          }
        });

        canvas.on('mouse:move', function(opt) {
          if (isDragging) {
            const evt = opt.e as MouseEvent | TouchEvent;
            let clientX = 0;
            let clientY = 0;
            
            if (evt instanceof MouseEvent) {
              clientX = evt.clientX;
              clientY = evt.clientY;
            } else if (evt instanceof TouchEvent && evt.touches.length > 0) {
              clientX = evt.touches[0].clientX;
              clientY = evt.touches[0].clientY;
            }
            
            const vpt = canvas.viewportTransform;
            if (vpt) {
              vpt[4] += clientX - lastPosX;
              vpt[5] += clientY - lastPosY;
              canvas.requestRenderAll();
              lastPosX = clientX;
              lastPosY = clientY;
            }
          }
        });

        canvas.on('mouse:up', function() {
          canvas.setViewportTransform(canvas.viewportTransform);
          isDragging = false;
          updateCanvasState();
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

  // Handle window resize to maintain proper canvas dimensions
  useEffect(() => {
    const handleResize = () => {
      if (fabricCanvasRef.current && containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const canvas = fabricCanvasRef.current;
        canvas.setDimensions({
          width: containerRect.width - 400,
          height: containerRect.height
        });
        canvas.renderAll();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update canvas state based on selected tool
  const updateCanvasState = useCallback(() => {
    if (!fabricCanvasRef.current) return;
    
    const canvas = fabricCanvasRef.current;
    
    // Reset canvas modes
    canvas.selection = selectedTool === 'select';
    canvas.isDrawingMode = selectedTool === 'pen' || selectedTool === 'eraser';
    
    // Configure drawing brush
    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.width = brushSize;
      if (selectedTool === 'eraser') {
        canvas.freeDrawingBrush.color = 'white';
      } else {
        canvas.freeDrawingBrush.color = brushColor;
      }
    }
    
    // Set cursor based on tool
    if (selectedTool === 'pen') {
      canvas.defaultCursor = 'crosshair';
      canvas.hoverCursor = 'crosshair';
    } else if (selectedTool === 'eraser') {
      canvas.defaultCursor = 'crosshair';
      canvas.hoverCursor = 'crosshair';
    } else if (selectedTool === 'pan') {
      canvas.defaultCursor = 'grab';
      canvas.hoverCursor = 'grab';
    } else {
      canvas.defaultCursor = 'default';
      canvas.hoverCursor = 'move';
    }
    
    canvas.renderAll();
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
    
    const point = new Point(opt.e.offsetX, opt.e.offsetY);
    canvas.zoomToPoint(point, newZoom);
    setZoom(newZoom);
    
    opt.e.preventDefault();
    opt.e.stopPropagation();
  };

  const addShape = (shapeType: 'rectangle' | 'circle' | 'triangle' | 'line') => {
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
      } else if (shapeType === 'triangle') {
        shape = new Polygon([
          { x: 50, y: 0 },
          { x: 0, y: 100 },
          { x: 100, y: 100 }
        ], {
          left: 100,
          top: 100,
          fill: 'transparent',
          stroke: brushColor,
          strokeWidth: 2
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !fabricCanvasRef.current) return;

    // Check file size (2MB limit)
    const maxSize = 2 * 1024 * 1024; // 2MB in bytes
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 2MB",
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (e) => {
      const result = e.target?.result as string;
      
      if (file.type.startsWith('image/')) {
        // Handle image files
        FabricImage.fromURL(result).then((img) => {
          if (fabricCanvasRef.current) {
            // Scale image to fit reasonably on canvas
            const maxWidth = 300;
            const maxHeight = 300;
            const scaleX = img.width! > maxWidth ? maxWidth / img.width! : 1;
            const scaleY = img.height! > maxHeight ? maxHeight / img.height! : 1;
            const scale = Math.min(scaleX, scaleY);
            
            img.set({
              left: 50,
              top: 50,
              scaleX: scale,
              scaleY: scale
            });
            fabricCanvasRef.current.add(img);
            fabricCanvasRef.current.setActiveObject(img);
            handleCanvasChange();
            toast({
              title: "Image uploaded",
              description: "Image has been added to the canvas",
            });
          }
        }).catch((error) => {
          console.error('Error loading image:', error);
          toast({
            title: "Error",
            description: "Failed to load image",
            variant: "destructive"
          });
        });
      } else if (file.type === 'application/pdf') {
        // For PDF files, create a clickable placeholder
        const text = new FabricText(`📄 PDF: ${file.name}\n(Click to view externally)`, {
          left: 50,
          top: 50,
          fontFamily: 'Arial',
          fontSize: 14,
          fill: '#333333',
          backgroundColor: '#f8f9fa',
          padding: 15,
          textAlign: 'center',
          cornerStyle: 'circle',
          borderColor: '#007bff',
          borderDashArray: [5, 5]
        });
        
        // Store the file data for potential future use
        text.set('fileData', result);
        text.set('fileName', file.name);
        text.set('fileType', 'pdf');
        
        fabricCanvasRef.current.add(text);
        fabricCanvasRef.current.setActiveObject(text);
        handleCanvasChange();
        
        toast({
          title: "PDF added",
          description: "PDF placeholder added to canvas. Full PDF rendering requires additional libraries.",
        });
      }
    };
    
    reader.readAsDataURL(file);
    
    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
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
    <div className={`h-full flex ${className || ''}`} ref={containerRef}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Main Canvas Area */}
      <div className="flex-1 bg-gray-50 overflow-hidden relative">
        <canvas 
          ref={canvasRef} 
          className="border-none cursor-crosshair"
          style={{ touchAction: 'none' }} // Important for pen tablet support
        />
        
        {/* Zoom indicator */}
        <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded text-sm">
          {Math.round(zoom * 100)}%
        </div>
      </div>

      {/* Right Side Collapsible Toolbar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="fixed top-1/2 right-4 z-50 transform -translate-y-1/2 shadow-lg"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-96 p-0">
          <div className="h-full flex flex-col">
            {/* Quick Tools - Top Section */}
            <div className="p-4 border-b bg-gray-50">
              <h3 className="font-semibold mb-3">Quick Tools</h3>
              <div className="grid grid-cols-4 gap-2">
                <Button
                  variant={selectedTool === 'select' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedTool('select')}
                  className="aspect-square"
                >
                  <MousePointer className="h-4 w-4" />
                </Button>
                
                <Button
                  variant={selectedTool === 'pen' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedTool('pen')}
                  className="aspect-square"
                >
                  <Pen className="h-4 w-4" />
                </Button>
                
                <Button
                  variant={selectedTool === 'eraser' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedTool('eraser')}
                  className="aspect-square"
                >
                  <Eraser className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={addText}
                  className="aspect-square"
                >
                  <Type className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => addShape('rectangle')}
                  className="aspect-square"
                >
                  <Square className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => addShape('circle')}
                  className="aspect-square"
                >
                  <Circle className="h-4 w-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => addShape('triangle')}
                  className="aspect-square"
                >
                  <Triangle className="h-4 w-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={triggerFileUpload}
                  className="aspect-square"
                >
                  <Upload className="h-4 w-4" />
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={undo}
                  disabled={historyIndex <= 0}
                  className="aspect-square"
                >
                  <Undo className="h-4 w-4" />
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={redo}
                  disabled={historyIndex >= history.length - 1}
                  className="aspect-square"
                >
                  <Redo className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
              {/* Drawing Tools Panel */}
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
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default InfiniteWhiteboard;
