import React, { useState, useRef, useEffect } from 'react';
import { GripVertical, Type, Palette, Move } from 'lucide-react';

interface DraggableTextProps {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  language: 'arabic' | 'english' | 'russian';
  isSelected: boolean;
  onMove: (id: string, x: number, y: number) => void;
  onUpdate: (id: string, updates: Partial<DraggableTextProps>) => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

const DraggableText: React.FC<DraggableTextProps> = ({
  id,
  text,
  x,
  y,
  fontSize,
  fontFamily,
  color,
  language,
  isSelected,
  onMove,
  onUpdate,
  onSelect,
  onDelete,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const textRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === textRef.current || (e.target as HTMLElement).closest('.drag-handle')) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - x,
        y: e.clientY - y,
      });
      onSelect(id);
      e.preventDefault();
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = e.clientX - dragStart.x;
        const newY = e.clientY - dragStart.y;
        onMove(id, newX, newY);
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
  }, [isDragging, dragStart, id, onMove]);

  const getTextDirection = () => {
    return language === 'arabic' ? 'rtl' : 'ltr';
  };

  const getTextAlign = () => {
    return language === 'arabic' ? 'right' : 'left';
  };

  return (
    <div
      ref={textRef}
      className={`absolute cursor-move select-none transition-all duration-200 ${
        isSelected ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
      } ${isDragging ? 'z-50 scale-105' : 'z-10'}`}
      style={{
        left: x,
        top: y,
        fontSize: `${fontSize * 0.5}px`,
        fontFamily,
        color,
        direction: getTextDirection(),
        textAlign: getTextAlign(),
        maxWidth: language === 'arabic' ? '300px' : '250px',
        lineHeight: language === 'arabic' ? '1.8' : '1.6',
      }}
      onMouseDown={handleMouseDown}
      onClick={() => onSelect(id)}
    >
      {isSelected && (
        <div className="absolute -top-6 left-0 flex items-center space-x-1 bg-gray-900 shadow-lg rounded px-1.5 py-0.5 border border-gray-700">
          <div className="drag-handle cursor-grab active:cursor-grabbing">
            <GripVertical size={10} className="text-gray-400" />
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(id);
            }}
            className="text-red-400 hover:text-red-300 text-xs"
          >
            ✕
          </button>
        </div>
      )}
      
      <div className="whitespace-pre-wrap break-words">
        {text}
      </div>
      
      {isDragging && (
        <div className="absolute inset-0 bg-blue-100 bg-opacity-20 rounded border-2 border-dashed border-blue-400" />
      )}
    </div>
  );
};

export default DraggableText;