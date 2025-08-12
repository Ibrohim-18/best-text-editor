import React, { useRef, useEffect } from 'react';

interface CanvasProps {
  children: React.ReactNode;
  onCanvasClick: (e: React.MouseEvent) => void;
}

const Canvas: React.FC<CanvasProps> = ({ children, onCanvasClick }) => {
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      onCanvasClick(e);
    }
  };

  return (
    <div className="h-full bg-gradient-to-br from-gray-100 to-gray-200 overflow-auto">
      <div
        ref={canvasRef}
        className="relative w-full h-full min-h-full bg-white shadow-inner cursor-crosshair"
        onClick={handleClick}
        style={{
          backgroundImage: `
            linear-gradient(45deg, #f8fafc 25%, transparent 25%),
            linear-gradient(-45deg, #f8fafc 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #f8fafc 75%),
            linear-gradient(-45deg, transparent 75%, #f8fafc 75%)
          `,
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
        }}
      >
        {children}

        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-3 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, #64748b 1px, transparent 1px),
              linear-gradient(to bottom, #64748b 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
      </div>
    </div>
  );
};

export default Canvas;