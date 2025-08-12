import React, { useState, useRef } from 'react';
import { Plus, Download, Upload, Type, Palette, FileText, Link } from 'lucide-react';

interface TopToolbarProps {
  onAddText: (type: 'arabic' | 'english' | 'russian') => void;
  onExport: () => void;
  customFonts: string[];
  onAddFontFromUrl: (fontName: string, fontUrl: string) => void;
  onAddFontFromFile: (fontName: string, fontFile: File) => void;
}

const TopToolbar: React.FC<TopToolbarProps> = ({
  onAddText,
  onExport,
  customFonts,
  onAddFontFromUrl,
  onAddFontFromFile,
}) => {
  const [showFontModal, setShowFontModal] = useState(false);
  const [fontUploadType, setFontUploadType] = useState<'url' | 'file'>('file');
  const [newFontName, setNewFontName] = useState('');
  const [newFontUrl, setNewFontUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddFontFromUrl = () => {
    if (newFontName && newFontUrl) {
      onAddFontFromUrl(newFontName, newFontUrl);
      setNewFontName('');
      setNewFontUrl('');
      setShowFontModal(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && newFontName) {
      onAddFontFromFile(newFontName, file);
      setNewFontName('');
      setShowFontModal(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <>
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700 shadow-lg">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Title */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <FileText className="text-white" size={18} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Редактор аятов Корана</h1>
                <p className="text-xs text-gray-400">Создавайте красивые композиции с арабским текстом</p>
              </div>
            </div>

            {/* Main Actions */}
            <div className="flex items-center space-x-3">
              {/* Add Text Buttons */}
              <div className="flex items-center space-x-2 bg-gray-800 rounded-lg p-2">
                <span className="text-xs text-gray-300 font-medium">Добавить:</span>
                <button
                  onClick={() => onAddText('arabic')}
                  className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                >
                  <Plus size={14} />
                  <span>Аят</span>
                </button>
                <button
                  onClick={() => onAddText('english')}
                  className="flex items-center space-x-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                >
                  <Plus size={14} />
                  <span>English</span>
                </button>
                <button
                  onClick={() => onAddText('russian')}
                  className="flex items-center space-x-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                >
                  <Plus size={14} />
                  <span>Русский</span>
                </button>
              </div>

              {/* Font Management */}
              <button
                onClick={() => setShowFontModal(true)}
                className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <Type size={16} />
                <span>Добавить шрифт</span>
              </button>

              {/* Export */}
              <button
                onClick={onExport}
                className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-lg"
              >
                <Download size={16} />
                <span>Экспорт</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Font Upload Modal */}
      {showFontModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold text-white mb-4">Добавить новый шрифт</h3>
            
            {/* Upload Type Selector */}
            <div className="flex space-x-2 mb-4">
              <button
                onClick={() => setFontUploadType('file')}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  fontUploadType === 'file'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <Upload size={16} />
                <span>Файл</span>
              </button>
              <button
                onClick={() => setFontUploadType('url')}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  fontUploadType === 'url'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <Link size={16} />
                <span>URL</span>
              </button>
            </div>

            {/* Font Name Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Название шрифта
              </label>
              <input
                type="text"
                value={newFontName}
                onChange={(e) => setNewFontName(e.target.value)}
                placeholder="Например: My Custom Font"
                className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* File or URL Input */}
            {fontUploadType === 'file' ? (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Файл шрифта (.ttf, .otf, .woff, .woff2)
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".ttf,.otf,.woff,.woff2"
                  onChange={handleFileSelect}
                  className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white file:cursor-pointer hover:file:bg-blue-700"
                />
              </div>
            ) : (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  URL шрифта
                </label>
                <input
                  type="url"
                  value={newFontUrl}
                  onChange={(e) => setNewFontUrl(e.target.value)}
                  placeholder="https://fonts.googleapis.com/css2?family=..."
                  className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={() => setShowFontModal(false)}
                className="flex-1 py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={fontUploadType === 'url' ? handleAddFontFromUrl : () => fileInputRef.current?.click()}
                disabled={!newFontName || (fontUploadType === 'url' && !newFontUrl)}
                className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
              >
                Добавить
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TopToolbar;
