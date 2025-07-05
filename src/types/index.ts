// Database types
export interface Lesson {
  id: string;
  title: string;
  user_id: string;
  export_status: string;
  created_at: string;
  updated_at: string;
}

export interface Slide {
  id: string;
  lesson_id: string;
  order_index: number;
  canvas_data: any;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  is_pro?: boolean;
  trial_start?: string;
  created_at?: string;
}

// Component prop types
export interface WebcamPreviewProps {
  isEnabled: boolean;
  isRecording: boolean;
}

export interface DraggableWebcamPreviewProps {
  isEnabled: boolean;
  isRecording: boolean;
  onClose?: () => void;
}

export interface SlideManagerProps {
  slides: Slide[];
  currentSlideIndex: number;
  onSlideSelect: (index: number) => void;
  onAddSlide: () => void;
  onDeleteSlide: (slideId: string) => void;
  onDuplicateSlide: (slideId: string) => void;
}

export interface RecordingSidebarProps {
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  onAudioToggle: () => void;
  onVideoToggle: () => void;
}

// Canvas and recording types
export interface CanvasData {
  objects?: any[];
  background?: string;
  [key: string]: any;
}

export interface RecordingState {
  isRecording: boolean;
  recordedBlob: Blob | null;
  duration: number;
  error?: string;
}

// Utility types
export type MediaPermissions = {
  audio: boolean;
  video: boolean;
};

export type ToastVariant = 'default' | 'destructive';

export interface ToastMessage {
  title: string;
  description?: string;
  variant?: ToastVariant;
}

// Position and dimensions
export interface Position {
  x: number;
  y: number;
}

export interface Dimensions {
  width: number;
  height: number;
}

export interface DragState {
  isDragging: boolean;
  offset: Position;
  startPosition: Position;
}

// Error types
export interface AppError {
  message: string;
  code?: string;
  details?: any;
}

// Lesson status
export type LessonStatus = 'draft' | 'recording' | 'processing' | 'completed' | 'error';

export type ExportStatus = 'pending' | 'processing' | 'completed' | 'failed';