import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { X, Move } from 'lucide-react';
import WebcamPreview from './WebcamPreview';

interface DraggableWebcamPreviewProps {
  isEnabled: boolean;
  isRecording: boolean;
  onClose?: () => void;
}

const DraggableWebcamPreview = ({ 
  isEnabled, 
  isRecording, 
  onClose 
}: DraggableWebcamPreviewProps) => {
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isMinimized, setIsMinimized] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setIsDragging(true);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = Math.max(0, Math.min(window.innerWidth - 320, e.clientX - dragOffset.x));
        const newY = Math.max(0, Math.min(window.innerHeight - (isMinimized ? 60 : 240), e.clientY - dragOffset.y));
        
        setPosition({ x: newX, y: newY });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, isMinimized]);

  return (
    <div
      ref={containerRef}
      className={`fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      } ${isMinimized ? 'w-80 h-14' : 'w-80 h-60'}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transition: isDragging ? 'none' : 'all 0.2s ease'
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-2 bg-gray-50 rounded-t-lg border-b cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center space-x-2">
          <Move className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Camera Preview</span>
          {isRecording && (
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          )}
        </div>
        
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            <span className="text-xs">{isMinimized ? '□' : '‒'}</span>
          </Button>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={onClose}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      {!isMinimized && (
        <div className="p-2">
          <div className="rounded-md overflow-hidden">
            <WebcamPreview 
              isEnabled={isEnabled} 
              isRecording={isRecording}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DraggableWebcamPreview;