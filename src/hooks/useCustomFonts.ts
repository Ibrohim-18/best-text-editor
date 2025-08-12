import { useState, useCallback } from 'react';

const useCustomFonts = () => {
  const [customFonts, setCustomFonts] = useState<string[]>([]);

  const addFontFromUrl = useCallback((fontName: string, fontUrl: string) => {
    // Create a new font face from URL
    const newFontFace = new FontFace(fontName, `url(${fontUrl})`);

    newFontFace.load().then((loadedFont) => {
      // Add font to document
      document.fonts.add(loadedFont);

      // Add to our custom fonts list
      setCustomFonts(prev => {
        if (!prev.includes(fontName)) {
          return [...prev, fontName];
        }
        return prev;
      });
    }).catch((error) => {
      console.error('Error loading font:', error);
      alert('Ошибка загрузки шрифта. Проверьте URL.');
    });
  }, []);

  const addFontFromFile = useCallback((fontName: string, fontFile: File) => {
    // Create a blob URL from the file
    const fontUrl = URL.createObjectURL(fontFile);

    // Create a new font face from file
    const newFontFace = new FontFace(fontName, `url(${fontUrl})`);

    newFontFace.load().then((loadedFont) => {
      // Add font to document
      document.fonts.add(loadedFont);

      // Add to our custom fonts list
      setCustomFonts(prev => {
        if (!prev.includes(fontName)) {
          return [...prev, fontName];
        }
        return prev;
      });
    }).catch((error) => {
      console.error('Error loading font:', error);
      alert('Ошибка загрузки шрифта. Проверьте файл.');
      // Clean up the blob URL on error
      URL.revokeObjectURL(fontUrl);
    });
  }, []);

  return {
    customFonts,
    addFontFromUrl,
    addFontFromFile,
  };
};

export default useCustomFonts;