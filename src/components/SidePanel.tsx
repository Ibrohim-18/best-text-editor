import React, { useState } from 'react';
import { Type, Palette, Sliders, Plus } from 'lucide-react';

interface SidePanelProps {
  selectedText: any;
  onUpdateText: (updates: any) => void;
  customFonts: string[];
}

const SidePanel: React.FC<SidePanelProps> = ({
  selectedText,
  onUpdateText,
  customFonts,
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
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

  if (!selectedText) {
    return (
      <div className="w-80 bg-gray-900 border-l border-gray-700 h-full flex items-center justify-center">
        <div className="text-center text-gray-500 p-6">
          <Type size={48} className="mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">Выберите текст</h3>
          <p className="text-sm">Кликните на любой текст на холсте, чтобы начать редактирование</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-gray-900 border-l border-gray-700 h-full overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Sliders className="text-white" size={16} />
          </div>
          <h3 className="text-lg font-bold text-white">Настройки текста</h3>
        </div>

        <div className="space-y-6">
          {/* Text Content */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Содержимое
            </label>
            <textarea
              ref={setTextareaRef}
              value={selectedText.text}
              onChange={(e) => onUpdateText({ text: e.target.value })}
              className="w-full p-3 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={4}
              placeholder="Введите текст..."
            />
            
            {/* Kashida Button for Arabic */}
            {selectedText.language === 'arabic' && (
              <button
                onClick={addKashida}
                className="mt-2 w-full flex items-center justify-center space-x-2 bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <span className="text-lg">ـ</span>
                <span>Добавить кашида</span>
              </button>
            )}
          </div>

          {/* Font Family */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Шрифт
            </label>
            <select
              value={selectedText.fontFamily}
              onChange={(e) => onUpdateText({ fontFamily: e.target.value })}
              className="w-full p-3 border border-gray-600 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <optgroup label="Системные шрифты">
                {defaultFonts.map((font) => (
                  <option key={font} value={font}>{font}</option>
                ))}
              </optgroup>
              {customFonts.length > 0 && (
                <optgroup label="Пользовательские шрифты">
                  {customFonts.map((font) => (
                    <option key={font} value={font}>{font}</option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>

          {/* Font Size */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Размер шрифта: <span className="text-blue-400 font-bold">{selectedText.fontSize}px</span>
            </label>
            <div className="space-y-2">
              <input
                type="range"
                min="12"
                max="120"
                value={selectedText.fontSize}
                onChange={(e) => onUpdateText({ fontSize: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>12px</span>
                <span>120px</span>
              </div>
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Цвет текста
            </label>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div
                  className="w-12 h-12 rounded-lg border-2 border-gray-600 cursor-pointer shadow-lg"
                  style={{ backgroundColor: selectedText.color }}
                  onClick={() => setShowColorPicker(!showColorPicker)}
                />
                <div className="flex-1">
                  <input
                    type="text"
                    value={selectedText.color}
                    onChange={(e) => onUpdateText({ color: e.target.value })}
                    className="w-full p-2 border border-gray-600 rounded-lg bg-gray-800 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="#000000"
                  />
                </div>
                <input
                  type="color"
                  value={selectedText.color}
                  onChange={(e) => onUpdateText({ color: e.target.value })}
                  className="w-12 h-12 rounded-lg border-2 border-gray-600 cursor-pointer"
                />
              </div>
              
              {showColorPicker && (
                <div className="grid grid-cols-5 gap-2 p-3 bg-gray-800 rounded-lg border border-gray-700">
                  {colors.map((color) => (
                    <div
                      key={color}
                      className="w-8 h-8 rounded-lg cursor-pointer border-2 border-gray-600 hover:scale-110 transition-transform shadow-sm"
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

          {/* Language Info */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Информация</h4>
            <div className="space-y-1 text-xs text-gray-400">
              <div>Язык: <span className="text-white">{
                selectedText.language === 'arabic' ? 'Арабский' :
                selectedText.language === 'english' ? 'Английский' : 'Русский'
              }</span></div>
              <div>Направление: <span className="text-white">{
                selectedText.language === 'arabic' ? 'Справа налево' : 'Слева направо'
              }</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SidePanel;
