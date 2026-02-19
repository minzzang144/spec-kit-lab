import { useState, useCallback, useRef, useEffect } from 'react';
import { useNoteSearchStore } from '../Store';

export function useNoteSearch() {
  const setKeyword = useNoteSearchStore((s) => s.setKeyword);
  const clearKeyword = useNoteSearchStore((s) => s.clearKeyword);
  const [inputValue, setInputValue] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleInputChange = useCallback(
    (value: string) => {
      setInputValue(value);

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        setKeyword(value);
      }, 300);
    },
    [setKeyword],
  );

  const handleClear = useCallback(() => {
    setInputValue('');
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    clearKeyword();
  }, [clearKeyword]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return { inputValue, handleInputChange, handleClear };
}
