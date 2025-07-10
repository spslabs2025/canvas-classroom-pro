import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger
} from "@/components/ui/dropdown-menu";
import { 
  Pen, 
  Eraser, 
  Type, 
  Upload, 
  Download,
  Square,
  Circle,
  Triangle,
  Minus,
  MousePointer,
  Palette,
  ZoomIn,
  ZoomOut,
  Grid3X3,
  Settings,
  Layers,
  FileText,
  Image,
  Shapes,
  PenTool
} from 'lucide-react';

interface WhiteboardToolsDropdownProps {
  onToolSelect?: (tool: string, options?: any) => void;
  onBrushSizeChange?: (size: number) => void;
  onColorChange?: (color: string) => void;
  currentTool?: string;
  currentBrushSize?: number;
  currentColor?: string;
}

const WhiteboardToolsDropdown = ({ 
  onToolSelect, 
  onBrushSizeChange, 
  onColorChange, 
  currentTool = 'pen',
  currentBrushSize = 3,
  currentColor = '#000000'
}: WhiteboardToolsDropdownProps) => {
  const colors = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', 
    '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#FFC0CB', '#A52A2A',
    '#808080', '#87CEEB', '#DDA0DD'
  ];

  const brushSizes = [1, 2, 3, 5, 8, 12, 16, 20, 25, 30];

  const handleToolClick = (tool: string, options?: any) => {
    if (onToolSelect) {
      onToolSelect(tool, options);
    }
  };

  const handleColorSelect = (color: string) => {
    if (onColorChange) {
      onColorChange(color);
    }
  };

  const handleBrushSizeSelect = (size: number) => {
    if (onBrushSizeChange) {
      onBrushSizeChange(size);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center space-x-2"
        >
          <PenTool className="h-4 w-4" />
          <span>Tools</span>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        className="w-64 bg-white border shadow-lg z-50" 
        align="end"
        sideOffset={5}
      >
        {/* Drawing Tools */}
        <DropdownMenuLabel className="font-semibold text-gray-700">Drawing Tools</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => handleToolClick('select')} className="cursor-pointer">
          <MousePointer className="h-4 w-4 mr-2" />
          Select
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleToolClick('pen')} 
          className={`cursor-pointer ${currentTool === 'pen' ? 'bg-blue-50 text-blue-700 font-medium' : ''}`}
        >
          <Pen className="h-4 w-4 mr-2" />
          <div className="flex flex-col">
            <span>Pen</span>
            <span className="text-xs text-gray-500">Draw and annotate</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleToolClick('eraser')} className="cursor-pointer">
          <Eraser className="h-4 w-4 mr-2" />
          Eraser
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {/* Shapes */}
        <DropdownMenuLabel className="font-semibold text-gray-700">Shapes</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => handleToolClick('rectangle')} className="cursor-pointer">
          <Square className="h-4 w-4 mr-2" />
          Rectangle
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleToolClick('circle')} className="cursor-pointer">
          <Circle className="h-4 w-4 mr-2" />
          Circle
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleToolClick('triangle')} className="cursor-pointer">
          <Triangle className="h-4 w-4 mr-2" />
          Triangle
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleToolClick('line')} className="cursor-pointer">
          <Minus className="h-4 w-4 mr-2" />
          Line
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {/* Text & Media */}
        <DropdownMenuLabel className="font-semibold text-gray-700">Text & Media</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => handleToolClick('text')} className="cursor-pointer">
          <Type className="h-4 w-4 mr-2" />
          Add Text
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleToolClick('upload-image')} className="cursor-pointer">
          <Image className="h-4 w-4 mr-2" />
          Upload Image
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleToolClick('upload-pdf')} className="cursor-pointer">
          <FileText className="h-4 w-4 mr-2" />
          Upload PDF
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {/* Brush Size */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="cursor-pointer">
            <Settings className="h-4 w-4 mr-2" />
            Thickness ({currentBrushSize}px)
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="bg-white border shadow-lg">
            <div className="grid grid-cols-5 gap-1 p-2">
              {brushSizes.map((size) => (
                <button
                  key={size}
                  className={`w-8 h-8 rounded border-2 flex items-center justify-center text-xs ${
                    currentBrushSize === size 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 hover:border-gray-500'
                  } transition-colors`}
                  onClick={() => handleBrushSizeSelect(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        {/* Colors */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="cursor-pointer">
            <Palette className="h-4 w-4 mr-2" />
            Colors
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="bg-white border shadow-lg">
            <div className="grid grid-cols-5 gap-1 p-2">
              {colors.map((color) => (
                <button
                  key={color}
                  className={`w-6 h-6 rounded border-2 ${
                    currentColor === color 
                      ? 'border-blue-500 ring-2 ring-blue-300' 
                      : 'border-gray-300 hover:border-gray-500'
                  } transition-colors`}
                  style={{ backgroundColor: color }}
                  onClick={() => handleColorSelect(color)}
                />
              ))}
            </div>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        
        <DropdownMenuSeparator />
        
        {/* View Controls */}
        <DropdownMenuLabel className="font-semibold text-gray-700">View</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => handleToolClick('zoom-in')} className="cursor-pointer">
          <ZoomIn className="h-4 w-4 mr-2" />
          Zoom In
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleToolClick('zoom-out')} className="cursor-pointer">
          <ZoomOut className="h-4 w-4 mr-2" />
          Zoom Out
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleToolClick('grid')} className="cursor-pointer">
          <Grid3X3 className="h-4 w-4 mr-2" />
          Toggle Grid
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {/* File Operations */}
        <DropdownMenuLabel className="font-semibold text-gray-700">File</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => handleToolClick('download')} className="cursor-pointer">
          <Download className="h-4 w-4 mr-2" />
          Export Canvas
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default WhiteboardToolsDropdown;