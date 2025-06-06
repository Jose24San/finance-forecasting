import { useEffect, useRef } from 'react';
import { useScenarioStore } from '../store/scenario';

export function useAutoSave() {
  const { isDirty, markAsClean } = useScenarioStore();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );

  useEffect(() => {
    if (isDirty) {
      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new timeout for auto-save (2 seconds after last change)
      timeoutRef.current = setTimeout(() => {
        // In a real app, this would save to backend
        console.log('Auto-saving scenario draft...');
        markAsClean();
      }, 2000);
    }

    // Cleanup timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isDirty, markAsClean]);

  useEffect(() => {
    // Save before page unload
    const handleBeforeUnload = () => {
      if (isDirty) {
        // Force immediate save
        markAsClean();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, markAsClean]);
}
