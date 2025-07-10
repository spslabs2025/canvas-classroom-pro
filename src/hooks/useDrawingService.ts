import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DrawingStroke {
  id: string;
  slide_id: string;
  user_id: string;
  stroke_data: any;
  tool_type: string;
  color: string;
  size: number;
  created_at: string;
  updated_at: string;
}

interface PendingStroke {
  stroke_data: any;
  tool_type: string;
  color: string;
  size: number;
  timestamp: number;
}

export const useDrawingService = (slideId: string | null, userId: string | null) => {
  const [pendingStrokes, setPendingStrokes] = useState<PendingStroke[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Save a single stroke to the backend
  const saveStroke = useCallback(async (strokeData: any, toolType: string, color: string, size: number) => {
    if (!slideId || !userId) return null;

    try {
      const { data, error } = await supabase
        .from('drawing_strokes')
        .insert({
          slide_id: slideId,
          user_id: userId,
          stroke_data: strokeData,
          tool_type: toolType,
          color,
          size
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving stroke:', error);
      throw error;
    }
  }, [slideId, userId]);

  // Queue a stroke for batch saving
  const queueStroke = useCallback((strokeData: any, toolType: string, color: string, size: number) => {
    const pendingStroke: PendingStroke = {
      stroke_data: strokeData,
      tool_type: toolType,
      color,
      size,
      timestamp: Date.now()
    };

    setPendingStrokes(prev => [...prev, pendingStroke]);

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout for batch save
    saveTimeoutRef.current = setTimeout(() => {
      savePendingStrokes();
    }, 1000); // Save after 1 second of inactivity

  }, []);

  // Save all pending strokes in batch
  const savePendingStrokes = useCallback(async () => {
    if (pendingStrokes.length === 0 || !slideId || !userId) return;

    setIsSyncing(true);
    
    try {
      const strokesToSave = pendingStrokes.map(stroke => ({
        slide_id: slideId,
        user_id: userId,
        stroke_data: stroke.stroke_data,
        tool_type: stroke.tool_type,
        color: stroke.color,
        size: stroke.size
      }));

      const { error } = await supabase
        .from('drawing_strokes')
        .insert(strokesToSave);

      if (error) throw error;

      // Clear pending strokes after successful save
      setPendingStrokes([]);
      
      console.log(`Saved ${strokesToSave.length} strokes to backend`);
      
    } catch (error) {
      console.error('Error saving pending strokes:', error);
      toast({
        title: "Sync Warning",
        description: "Some drawing data couldn't be saved. Your work is preserved locally.",
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
  }, [pendingStrokes, slideId, userId, toast]);

  // Load strokes for a slide
  const loadStrokes = useCallback(async (targetSlideId: string) => {
    if (!targetSlideId) return [];

    try {
      const { data, error } = await supabase
        .from('drawing_strokes')
        .select('*')
        .eq('slide_id', targetSlideId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error loading strokes:', error);
      return [];
    }
  }, []);

  // Delete strokes for a slide
  const deleteSlideStrokes = useCallback(async (targetSlideId: string) => {
    try {
      const { error } = await supabase
        .from('drawing_strokes')
        .delete()
        .eq('slide_id', targetSlideId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting slide strokes:', error);
      throw error;
    }
  }, []);

  // Force save pending strokes immediately
  const forceSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    savePendingStrokes();
  }, [savePendingStrokes]);

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    if (pendingStrokes.length > 0) {
      savePendingStrokes();
    }
  }, [pendingStrokes, savePendingStrokes]);

  return {
    saveStroke,
    queueStroke,
    loadStrokes,
    deleteSlideStrokes,
    forceSave,
    cleanup,
    isSyncing,
    pendingCount: pendingStrokes.length
  };
};