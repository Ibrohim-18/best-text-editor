import { useState, useCallback } from 'react';

interface TextElement {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  language: 'arabic' | 'english' | 'russian';
}

const useTextElements = () => {
  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  const addTextElement = useCallback((type: 'arabic' | 'english' | 'russian') => {
    const defaultTexts = {
      arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
      english: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.',
      russian: 'Во имя Аллаха, Милостивого, Милосердного.'
    };

    const defaultFonts = {
      arabic: 'Amiri',
      english: 'Georgia',
      russian: 'Georgia'
    };

    const defaultSizes = {
      arabic: 64,
      english: 36,
      russian: 36
    };

    const newElement: TextElement = {
      id: Date.now().toString(),
      text: defaultTexts[type],
      x: Math.random() * 200 + 50,
      y: Math.random() * 200 + 50,
      fontSize: defaultSizes[type],
      fontFamily: defaultFonts[type],
      color: '#000000',
      language: type,
    };

    setTextElements(prev => [...prev, newElement]);
    setSelectedElementId(newElement.id);
  }, []);

  const updateTextElement = useCallback((id: string, updates: Partial<TextElement>) => {
    setTextElements(prev =>
      prev.map(element =>
        element.id === id ? { ...element, ...updates } : element
      )
    );
  }, []);

  const moveTextElement = useCallback((id: string, x: number, y: number) => {
    setTextElements(prev =>
      prev.map(element =>
        element.id === id ? { ...element, x, y } : element
      )
    );
  }, []);

  const deleteTextElement = useCallback((id: string) => {
    setTextElements(prev => prev.filter(element => element.id !== id));
    if (selectedElementId === id) {
      setSelectedElementId(null);
    }
  }, [selectedElementId]);

  const selectElement = useCallback((id: string) => {
    setSelectedElementId(id);
  }, []);

  const deselectElement = useCallback(() => {
    setSelectedElementId(null);
  }, []);

  const getSelectedElement = useCallback(() => {
    return textElements.find(element => element.id === selectedElementId) || null;
  }, [textElements, selectedElementId]);

  const clearAll = useCallback(() => {
    setTextElements([]);
    setSelectedElementId(null);
  }, []);


  return {
    textElements,
    selectedElementId,
    addTextElement,
    updateTextElement,
    moveTextElement,
    deleteTextElement,
    selectElement,
    deselectElement,
    getSelectedElement,
    clearAll,
  };
};

export default useTextElements;