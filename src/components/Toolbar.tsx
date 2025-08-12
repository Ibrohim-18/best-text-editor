import React, { useState } from 'react';
import { Plus, Type, Palette, Download, Upload } from 'lucide-react';

interface ToolbarProps {
  selectedText: any;
  onAddText: (type: 'arabic' | 'english' | 'russian') => void;
  onUpdateText: (updates: any) => void;
  onExport: () => void;
  customFonts: string[];
  onAddFont: (fontName: string, fontUrl: string) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  selectedText,
  onAddText,
  onUpdateText,
  onExport,
  customFonts,
  onAddFont,
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showFontUpload, setShowFontUpload] = useState(false);
  const [newFontName, setNewFontName] = useState('');
  const [newFontUrl, setNewFontUrl] = useState('');
  const [textareaRef, setTextareaRef] = useState<HTMLTextAreaElement | null>(null);

  const defaultFonts = [
    'Arial',
    'Georgia',
    'Times New Roman',
    'Helvetica',
    'Verdana',
    'Amiri', // Arabic font
    'Noto Sans Arabic',
    'Roboto',
    'Open Sans',
    'Lato'
  ];

  const colors = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#800000', '#008000',
    '#000080', '#808000', '#800080', '#008080', '#C0C0C0',
    '#808080', '#9999FF', '#993366', '#FFFFCC', '#CCFFFF'
  ];

  const handleAddFont = () => {
    if (newFontName && newFontUrl) {
      onAddFont(newFontName, newFontUrl);
      setNewFontName('');
      setNewFontUrl('');
      setShowFontUpload(false);
    }
  };

  const addKashida = () => {
    if (selectedText && selectedText.language === 'arabic' && textareaRef) {
      const cursorPosition = textareaRef.selectionStart;
      const textBefore = selectedText.text.substring(0, cursorPosition);
      const textAfter = selectedText.text.substring(cursorPosition);
      const newText = textBefore + 'ـ' + textAfter;
      onUpdateText({ text: newText });
      
      // Restore cursor position after the kashida
      setTimeout(() => {
        if (textareaRef) {
          textareaRef.focus();
          textareaRef.setSelectionRange(cursorPosition + 1, cursorPosition + 1);
        }
      }, 0);
    }
  };
  return (
    <div className="w-40 bg-gray-900 shadow-xl border-r border-gray-700 h-full overflow-y-auto">
      <div className="p-3 border-b border-gray-700">
        <h2 className="text-sm font-bold text-white mb-2">Редактор аятов</h2>
        
        {/* Add Text Buttons */}
        <div className="space-y-1 mb-3">
          <button
            onClick={() => onAddText('arabic')}
            className="w-full flex items-center justify-center space-x-1 bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600 transition-colors"
          >
            <Plus size={12} />
            <span>Добавить аят</span>
          </button>
          
          <button
            onClick={() => onAddText('english')}
            className="w-full flex items-center justify-center space-x-1 bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600 transition-colors"
          >
            <Plus size={12} />
            <span>English Translation</span>
          </button>
          
          <button
            onClick={() => onAddText('russian')}
            className="w-full flex items-center justify-center space-x-1 bg-purple-500 text-white px-2 py-1 rounded text-xs hover:bg-purple-600 transition-colors"
          >
            <Plus size={12} />
            <span>Русский перевод</span>
          </button>
        </div>

        <button
          onClick={onExport}
          className="w-full flex items-center justify-center space-x-1 bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-1.5 rounded text-xs hover:from-orange-600 hover:to-red-600 transition-all"
        >
          <Download size={12} />
          <span>Скачать без фона</span>
        </button>
      </div>

      {selectedText && (
        <div className="p-3 space-y-2">
          <h3 className="text-sm font-semibold text-white">Настройки текста</h3>
          
          {/* Text Input */}
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Текст</label>
            <textarea
              ref={setTextareaRef}
              value={selectedText.text}
              onChange={(e) => onUpdateText({ text: e.target.value })}
              className="w-full p-1.5 border border-gray-600 rounded bg-gray-800 text-white text-xs focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              rows={2}
              placeholder="Введите текст..."
            />
          </div>

          {/* Kashida Button for Arabic */}
          {selectedText.language === 'arabic' && (
            <div>
              <button
                onClick={addKashida}
                className="w-full flex items-center justify-center space-x-1 bg-yellow-500 text-white px-2 py-1 rounded text-xs hover:bg-yellow-600 transition-colors"
              >
                <span className="text-sm">ـ</span>
                <span>Добавить кашида</span>
              </button>
            </div>
          )}

          {/* Font Family */}
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Шрифт</label>
            <select
              value={selectedText.fontFamily}
              onChange={(e) => onUpdateText({ fontFamily: e.target.value })}
              className="w-full p-1.5 border border-gray-600 rounded bg-gray-800 text-white text-xs focus:ring-1 focus:ring-blue-500"
            >
              {defaultFonts.map((font) => (
                <option key={font} value={font}>{font}</option>
              ))}
              {customFonts.map((font) => (
                <option key={font} value={font}>{font} (пользовательский)</option>
              ))}
            </select>
          </div>

          {/* Add Custom Font */}
          <div>
            <button
              onClick={() => setShowFontUpload(!showFontUpload)}
              className="w-full flex items-center justify-center space-x-1 bg-indigo-500 text-white px-2 py-1 rounded text-xs hover:bg-indigo-600 transition-colors"
            >
              <Upload size={12} />
              <span>Добавить шрифт</span>
            </button>
            
            {showFontUpload && (
              <div className="mt-2 space-y-1.5 p-2 bg-gray-800 rounded">
                <input
                  type="text"
                  placeholder="Название шрифта"
                  value={newFontName}
                  onChange={(e) => setNewFontName(e.target.value)}
                  className="w-full p-1 border border-gray-600 rounded bg-gray-700 text-white text-xs focus:ring-1 focus:ring-indigo-500"
                />
                <input
                  type="url"
                  placeholder="URL шрифта (Google Fonts, etc.)"
                  value={newFontUrl}
                  onChange={(e) => setNewFontUrl(e.target.value)}
                  className="w-full p-1 border border-gray-600 rounded bg-gray-700 text-white text-xs focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  onClick={handleAddFont}
                  className="w-full bg-indigo-600 text-white py-1 rounded text-xs hover:bg-indigo-700"
                >
                  Добавить шрифт
                </button>
              </div>
            )}
          </div>

          {/* Font Size */}
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Размер шрифта: {selectedText.fontSize}px
            </label>
            <input
              type="range"
              min="12"
              max="72"
              value={selectedText.fontSize}
              onChange={(e) => onUpdateText({ fontSize: parseInt(e.target.value) })}
              className="w-full h-1 bg-gray-700 rounded appearance-none cursor-pointer"
            />
          </div>

          {/* Color */}
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Цвет</label>
            <div className="flex items-center space-x-1">
              <div
                className="w-5 h-5 rounded border border-gray-600 cursor-pointer"
                style={{ backgroundColor: selectedText.color }}
                onClick={() => setShowColorPicker(!showColorPicker)}
              />
              <input
                type="text"
                value={selectedText.color}
                onChange={(e) => onUpdateText({ color: e.target.value })}
                className="flex-1 p-1 border border-gray-600 rounded bg-gray-800 text-white text-xs focus:ring-1 focus:ring-blue-500"
              />
              <input
                type="color"
                value={selectedText.color}
                onChange={(e) => onUpdateText({ color: e.target.value })}
                className="w-5 h-5 rounded border border-gray-600 cursor-pointer"
              />
            </div>
            
            {showColorPicker && (
              <div className="mt-1.5 grid grid-cols-5 gap-1">
                {colors.map((color) => (
                  <div
                    key={color}
                    className="w-4 h-4 rounded cursor-pointer border border-gray-600 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      onUpdateText({ color });
                      setShowColorPicker(false);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Toolbar;