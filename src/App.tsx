import React, { useState } from 'react';

function App() {
  const [textElements, setTextElements] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [canvasBackground, setCanvasBackground] = useState('#ffffff');
  const [exportFullCanvas, setExportFullCanvas] = useState(true); // всегда включено, но скрыто
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, elementX: 0, elementY: 0 });
  const [textareaRef, setTextareaRef] = useState<HTMLTextAreaElement | null>(null);
  const [customFonts, setCustomFonts] = useState<string[]>([]);
  const [storedFonts, setStoredFonts] = useState<{ name: string; dataUrl: string; }[]>([]);
  const [exportScale, setExportScale] = useState<number>(2);
  const canvasRef = React.useRef<HTMLDivElement | null>(null);
  const vGuideRef = React.useRef<HTMLDivElement | null>(null);
  const hGuideRef = React.useRef<HTMLDivElement | null>(null);
  const dragNodeRef = React.useRef<HTMLElement | null>(null);
  const dragIdRef = React.useRef<string | null>(null);
  const latestPosRef = React.useRef<{ x: number; y: number } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newFontName, setNewFontName] = useState<string>('');
  const [showFontModal, setShowFontModal] = useState(false); // modal exists; button can be hidden
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  // Center guides
  const [showVGuide, setShowVGuide] = useState(false);
  const [showHGuide, setShowHGuide] = useState(false);
  // Responsive scale and side panel toggle
  const [displayScale, setDisplayScale] = useState(1);
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  React.useEffect(() => {
    const update = () => setDisplayScale(window.innerWidth < 768 ? 0.3 : 1);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);


  // Автоматически показывать модал добавления шрифта при старте (если ещё нет шрифтов)
  React.useEffect(() => {
    if (storedFonts.length === 0) {
      // можно включить авто-открытие, если нужно: setShowFontModal(true)
    }
  }, [storedFonts.length]);

  const addText = (type: 'arabic' | 'english' | 'russian') => {
    const texts = {
      arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
      english: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.',
      russian: 'Во имя Аллаха, Милостивого, Милосердного.'
    };

    // Place roughly at canvas center first
    const rect = canvasRef.current?.getBoundingClientRect();
    const centerX = rect ? rect.width / 2 : 400;
    const centerY = rect ? rect.height / 2 : 300;

    const newElement = {
      id: Date.now().toString(),
      text: texts[type],
      x: centerX,
      y: centerY,
      fontSize: type === 'arabic' ? 32 : 18,
      color: '#ffffff', // default white
      language: type
    };

    setTextElements((prev) => [...prev, newElement]);
    setSelectedId(newElement.id);

    // After render, measure and perfectly center the block
    requestAnimationFrame(() => {
      const node = canvasRef.current?.querySelector(`[data-eid="${newElement.id}"]`) as HTMLElement | null;
      const r2 = canvasRef.current?.getBoundingClientRect();
      if (node && r2) {
        const ew = node.offsetWidth;
        const eh = node.offsetHeight;
        const nx = r2.width / 2 - ew / 2;
        const ny = r2.height / 2 - eh / 2;
        setTextElements((prev) => prev.map((el) => el.id === newElement.id ? { ...el, x: nx, y: ny } : el));
      }
    });
  };

  const updateText = (id: string, updates: any) => {
    setTextElements(prev =>
      prev.map(el => el.id === id ? { ...el, ...updates } : el)
    );
  };

  // rAF scheduler for smoother drag updates (component scope)
  const rafPendingRef = React.useRef(false);
  const rafPosRef = React.useRef<{ x: number; y: number } | null>(null);
  const scheduleDragUpdate = React.useCallback((newX: number, newY: number, id?: string) => {
    rafPosRef.current = { x: newX, y: newY };
    if (rafPendingRef.current) return;
    rafPendingRef.current = true;
    requestAnimationFrame(() => {
      const pos = rafPosRef.current;
      rafPendingRef.current = false;
      const curId = id || selectedId;
      if (!pos || !curId) return;
      updateText(curId, { x: pos.x, y: pos.y });
      if (canvasRef.current) {
        const rectW = canvasRef.current.offsetWidth;
        const rectH = canvasRef.current.offsetHeight;
        const node = canvasRef.current.querySelector(`[data-eid="${curId}"]`) as HTMLElement | null;
        const ew = node?.offsetWidth || 0;
        const eh = node?.offsetHeight || 0;
        const centerX = rectW / 2;
        const centerY = rectH / 2;
        setShowVGuide(Math.abs((pos.x + ew / 2) - centerX) < 5);
        setShowHGuide(Math.abs((pos.y + eh / 2) - centerY) < 5);
      }
    });
  }, [selectedId]);
  const deleteText = (id: string) => {
    setTextElements(prev => prev.filter(el => el.id !== id));
    setSelectedId(null);
  };

  const addKashida = () => {
    if (selectedElement && selectedElement.language === 'arabic' && textareaRef) {
      const cursorPosition = textareaRef.selectionStart;
      const textBefore = selectedElement.text.substring(0, cursorPosition);
      const textAfter = selectedElement.text.substring(cursorPosition);
      const newText = textBefore + 'ـ' + textAfter;

      updateText(selectedElement.id, { text: newText });

      // Восстановить позицию курсора после кашида
      setTimeout(() => {
        if (textareaRef) {
          textareaRef.focus();
          textareaRef.setSelectionRange(cursorPosition + 1, cursorPosition + 1);
        }
      }, 0);
    }
  };

  const exportCanvasAsPNG = async () => {
    if (textElements.length === 0) {
      alert('Add some text before export');
      return;
    }

    // Убедимся, что все шрифты готовы (важно для измерений и отрисовки)
    try {
      const families = Array.from(
        new Set(
          textElements.map((el) => (el.fontFamily || (el.language === 'arabic' ? 'Amiri, serif' : 'Georgia, serif')))
        )
      );
      await Promise.all(families.map((f) => (document as any).fonts.load(`16px ${f}`)));
      await (document as any).fonts.ready;
    } catch {}

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    // Если экспорт как видимый холст - НЕ меняем границы, используем реальные позиции текста
    // if (exportFullCanvas && canvasRef.current) {
    //   const rect = canvasRef.current.getBoundingClientRect();
    //   minX = 0; minY = 0; maxX = rect.width; maxY = rect.height;
    // }

    // Для согласованности с версткой: факторы межстрочного интервала
    const getLineFactor = (lang: 'arabic' | 'english' | 'russian') => (lang === 'arabic' ? 1.8 : 1.6);
    const quoteIfNeeded = (name: string) => (name.includes('"') || name.includes("'") || !name.includes(' ') ? name : `"${name}"`);
    const getFontFamily = (el: { language: 'arabic' | 'english' | 'russian'; fontFamily?: string }) => {
      const fam = el.fontFamily && el.fontFamily.trim().length > 0
        ? quoteIfNeeded(el.fontFamily)
        : (el.language === 'arabic' ? 'Amiri, serif' : 'Georgia, serif');
      return fam;
    };

    textElements.forEach((el) => {
      ctx.font = `${el.fontSize}px ${getFontFamily(el)}`;
      const lines = el.text.split('\n');
      let maxLineWidth = 0;
      lines.forEach((line) => {
        const w = ctx.measureText(line).width;
        if (w > maxLineWidth) maxLineWidth = w;
      });
      const lineFactor = getLineFactor(el.language);
      const blockHeight = lines.length * el.fontSize * lineFactor;

      // Всегда считаем границы по тексту
      minX = Math.min(minX, el.x);
      minY = Math.min(minY, el.y);
      maxX = Math.max(maxX, el.x + maxLineWidth);
      maxY = Math.max(maxY, el.y + blockHeight);
    });

    let padding = 50;
    let width: number;
    let height: number;
    if (exportFullCanvas && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      padding = 0;
      width = Math.ceil(rect.width);
      height = Math.ceil(rect.height);
    } else {
      width = Math.max(800, Math.ceil(maxX - minX + padding * 2));
      height = Math.max(600, Math.ceil(maxY - minY + padding * 2));
    }

    // High DPI для четкости
    const dpr = window.devicePixelRatio || 1;
    const scale = Math.max(1, Math.min(6, exportScale)) * dpr; // масштаб экспорта 1..6x
    canvas.width = Math.ceil(width * scale);
    canvas.height = Math.ceil(height * scale);
    ctx.scale(scale, scale);
    // Улучшаем сглаживание
    (ctx as any).imageSmoothingEnabled = true;
    (ctx as any).imageSmoothingQuality = 'high';

    // Фон (цветной или прозрачный)
  // Pointer-based dragging for ultimate smoothness
  React.useEffect(() => {
    const root = canvasRef.current;
    if (!root) return;

    const onDown = (e: PointerEvent) => {
      const target = (e.target as HTMLElement).closest('[data-eid]') as HTMLElement | null;
      if (!target) return;
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      dragNodeRef.current = target as HTMLElement;
      dragIdRef.current = target.getAttribute('data-eid');
      const id = dragIdRef.current;
      if (!id) return;
      const el = textElements.find((x) => x.id === id);
      if (!el) return;
      setIsDragging(true);
      setSelectedId(id);
      latestPosRef.current = { x: el.x, y: el.y };
      dragStart.x = e.clientX; dragStart.y = e.clientY; dragStart.elementX = el.x; dragStart.elementY = el.y;
    };

    const onMove = (e: PointerEvent) => {
      if (!isDragging || !dragIdRef.current) return;
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      const nx = dragStart.elementX + deltaX;
      const ny = dragStart.elementY + deltaY;
      latestPosRef.current = { x: nx, y: ny };
      // Ultra-fast visual feedback: move DOM directly via transform
      if (dragNodeRef.current) {
        dragNodeRef.current.style.transform = `translate(${nx}px, ${ny}px)`;
      }
    };

    const onUp = () => {
      if (!isDragging || !dragIdRef.current) return;
      setIsDragging(false);
      const id = dragIdRef.current;
      const pos = latestPosRef.current;
      dragIdRef.current = null;
      dragNodeRef.current = null;
      if (id && pos) updateText(id, { x: pos.x, y: pos.y });
      setShowVGuide(false); setShowHGuide(false);
    };

    root.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      root.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [textElements]);
    if (canvasBackground !== 'transparent') {
      ctx.fillStyle = canvasBackground;
      ctx.fillRect(0, 0, width, height);
    } else {
      ctx.clearRect(0, 0, width, height);
    }

    // 2) Рисуем элементы с теми же параметрами, что и в редакторе
    textElements.forEach((el) => {
      ctx.fillStyle = el.color;
      ctx.font = `${el.fontSize}px ${getFontFamily(el)}`;
      ctx.textBaseline = 'top';
      // Рисуем одинаково для всех языков от левого верхнего угла блока
      ctx.textAlign = 'left';

      const x = exportFullCanvas ? el.x : (el.x - minX + padding);
      const y = exportFullCanvas ? el.y : (el.y - minY + padding);

      const lines = el.text.split('\n');
      const lineFactor = getLineFactor(el.language);

      lines.forEach((line, idx) => {
        const lineY = y + idx * el.fontSize * lineFactor;
        ctx.fillText(line, x, lineY);
      });
    });

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `quran-verse-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
  };

  const handleMouseDown = (e: React.MouseEvent, elementId: string) => {
    const element = textElements.find(el => el.id === elementId);
    if (element) {
      setIsDragging(true);
      setSelectedId(elementId);
      setDragStart({
        x: e.clientX,
        y: e.clientY,
        elementX: element.x,
        elementY: element.y
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && selectedId) {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      const newX = dragStart.elementX + deltaX;
      const newY = dragStart.elementY + deltaY;
      scheduleDragUpdate(newX, newY);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setShowVGuide(false);
    setShowHGuide(false);
  };

  // Persistence: load/save from localStorage
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('editor_state_v1');
      if (saved) {
        const data = JSON.parse(saved);
        if (Array.isArray(data.textElements)) setTextElements(data.textElements);
        if (typeof data.canvasBackground === 'string') setCanvasBackground(data.canvasBackground);
        if (typeof data.exportFullCanvas === 'boolean') setExportFullCanvas(data.exportFullCanvas);
        else setExportFullCanvas(true); // по умолчанию включено
        if (Array.isArray(data.fonts)) {
          setStoredFonts(data.fonts);
          // Preload fonts
          data.fonts.forEach((f: { name: string; dataUrl: string }) => {
            const ff = new FontFace(f.name, `url(${f.dataUrl})`);
            ff.load().then((ld) => document.fonts.add(ld)).catch(() => {});
          });
        }
      }
    } catch {}
  }, []);

  React.useEffect(() => {
    const payload = {
      textElements,
      canvasBackground,
      exportFullCanvas,
      fonts: storedFonts,
    };
    localStorage.setItem('editor_state_v1', JSON.stringify(payload));
  }, [textElements, canvasBackground, exportFullCanvas, storedFonts]);

  const selectedElement = textElements.find(el => el.id === selectedId);

  return (
    <div className="h-screen flex flex-col bg-gray-800">
      {/* Top Toolbar */}
      <div className="bg-gray-900 border-b border-gray-700 p-2 md:p-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h1 className="text-sm md:text-xl font-bold text-white">📖 Quran Verse Editor</h1>

          <div className="flex items-center flex-wrap gap-1 md:gap-3">
            <div className="flex items-center space-x-2 text-xs text-gray-300">
              <span>Quality:</span>
              <select
                value={exportScale}
                onChange={(e) => setExportScale(parseInt(e.target.value))}
                className="bg-gray-800 border border-gray-600 text-white rounded px-2 py-1"
              >
                <option value={1}>1x</option>
                <option value={2}>2x</option>
                <option value={3}>3x</option>
                <option value={4}>4x</option>
                <option value={5}>5x</option>
                <option value={6}>6x</option>
              </select>
            </div>



            <button
              onClick={() => addText('arabic')}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium px-2 py-1 text-xs md:px-4 md:py-2 md:text-sm"
            >
              ➕ Ayah
            </button>
            <button
              onClick={() => addText('english')}
              className="bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium px-2 py-1 text-xs md:px-4 md:py-2 md:text-sm"
            >
              ➕ English
            </button>
            <button
              onClick={() => addText('russian')}
              className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium px-2 py-1 text-xs md:px-4 md:py-2 md:text-sm"
            >
              ➕ Russian
            </button>
            <button
              onClick={() => setShowFontModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-2 py-1 text-xs md:px-3 md:py-2 md:text-sm"
            >
              + Add font

            </button>
            <button
              onClick={exportCanvasAsPNG}
              className="bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium px-2 py-1 text-xs md:px-4 md:py-2 md:text-sm"
            >
              💾 Export
            </button>
          </div>
        </div>
            {/* Mobile toggle for side panel */}
            <button
              className="md:hidden text-white/80 bg-gray-700 px-2 py-1 rounded text-xs"
              onClick={() => setIsPanelOpen(p => !p)}
            >
              {isPanelOpen ? 'Hide settings' : 'Show settings'}
            </button>
      </div>

      {/* Font Upload Modal */}
      {showFontModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold text-white mb-4">Add font</h3>

            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Font name</label>
                <input
                  type="text"
                  value={newFontName}
                  onChange={(e) => setNewFontName(e.target.value)}
                  placeholder="e.g., My Quran Font"
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Font file (.ttf, .otf, .woff, .woff2)</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".ttf,.otf,.woff,.woff2"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = async () => {
                      const dataUrl = reader.result as string;
                      try {
                        // Автоматическое имя: берём имя файла без расширения, если поле пустое
                        const autoName = newFontName.trim() || (file.name.replace(/\.[^.]+$/, ''));
                        const ff = new FontFace(autoName, `url(${dataUrl})`);
                        const loaded = await ff.load();
                        document.fonts.add(loaded);
                        setCustomFonts((prev) => [...prev.filter(f => f !== autoName), autoName]);
                        setStoredFonts((prev) => [...prev.filter(f => f.name !== autoName), { name: autoName, dataUrl }]);
                        setNewFontName('');
                        setShowFontModal(false);
                        // Если выбран элемент — применим новый шрифт сразу
                        if (selectedElement) {
                          updateText(selectedElement.id, { fontFamily: autoName });
                        }
                      } catch (err) {
                        alert('Failed to load font. Check the file.');
                      }
                    };
                    reader.readAsDataURL(file);
                  }}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                />
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => setShowFontModal(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={!newFontName}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 text-white px-3 py-2 rounded"
              >
                Choose file
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}

      <div className="flex flex-1">
        {/* Canvas */}
        <div className="flex-1 bg-gray-100 relative overflow-hidden">
          <div
            ref={canvasRef}
            className="w-full h-full min-h-full relative"
            style={{
              backgroundColor: canvasBackground === 'transparent' ? '#0b0d0f' : canvasBackground,
              backgroundImage: canvasBackground === 'transparent' ?
                `linear-gradient(90deg, rgba(255,255,255,0.06) 1px, rgba(0,0,0,0) 1px),
                 linear-gradient(0deg, rgba(255,255,255,0.06) 1px, rgba(0,0,0,0) 1px)`
              :
                'none',
              backgroundSize: canvasBackground === 'transparent' ? '24px 24px, 24px 24px' : 'auto',
              backgroundPosition: canvasBackground === 'transparent' ? '0 0, 0 0' : 'auto',
              touchAction: isDragging ? 'none' : 'auto',
              overscrollBehavior: 'contain'
            }}
            onMouseDown={(e) => {
              const target = (e.target as HTMLElement).closest('[data-eid]');
              if (!target) {
                setSelectedId(null);
              }
            }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={(e) => {
              const touch = e.touches[0];
              if (!touch) return;
              const target = (e.target as HTMLElement).closest('[data-eid]') as HTMLElement | null;
              if (!target) { setSelectedId(null); return; }
              const id = target.getAttribute('data-eid');
              if (!id) return;
              const element = textElements.find(el => el.id === id);
              if (!element) return;
              setIsDragging(true);
              setSelectedId(id);
              setDragStart({ x: touch.clientX, y: touch.clientY, elementX: element.x, elementY: element.y });
            }}
            onTouchMove={(e) => {
              const touch = e.touches[0];
              if (!touch || !isDragging || !selectedId) return;
              const deltaX = touch.clientX - dragStart.x;
              const deltaY = touch.clientY - dragStart.y;
              const newX = dragStart.elementX + deltaX;
              const newY = dragStart.elementY + deltaY;
              scheduleDragUpdate(newX, newY);
            }}
            onTouchEnd={() => {
              setIsDragging(false);
              setShowVGuide(false);
              setShowHGuide(false);
            }}
          >
            {/* Center guides */}
            {canvasRef.current && (
              <>
                {/* Vertical */}
                <div
                  ref={vGuideRef}
                  style={{
                    position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px',
                    backgroundColor: showVGuide ? 'red' : 'transparent', transform: 'translateX(-0.5px)', pointerEvents: 'none', zIndex: 5,
                  }}
                />
                {/* Horizontal */}
                <div
                  ref={hGuideRef}
                  style={{
                    position: 'absolute', top: '50%', left: 0, right: 0, height: '1px',
                    backgroundColor: showHGuide ? 'red' : 'transparent', transform: 'translateY(-0.5px)', pointerEvents: 'none', zIndex: 5,
                  }}
                />
              </>
            )}
            {textElements.map((element) => (
              <div
                key={element.id}
                data-eid={element.id}
                role="button"
                tabIndex={0}
                className={`absolute cursor-move select-none p-0 rounded transition-all ${
                  selectedId === element.id ? 'ring-2 ring-blue-500 bg-blue-50 bg-opacity-50' : 'hover:bg-gray-50 hover:bg-opacity-30'
                } ${isDragging && selectedId === element.id ? 'z-50 scale-105' : 'z-10'}`}
                style={{
                  transform: `translate(${element.x}px, ${element.y}px)`,
                  willChange: 'transform',
                  fontSize: element.fontSize,
                  color: element.color,
                  direction: element.language === 'arabic' ? 'rtl' : 'ltr',
                  fontFamily: element.fontFamily || (element.language === 'arabic' ? 'Amiri, serif' : 'Georgia, serif'),
                  maxWidth: '400px',
                  lineHeight: element.language === 'arabic' ? '1.8' : '1.6'
                }}
                onClick={() => setSelectedId(element.id)}
                onDoubleClick={() => {
                  setEditingId(element.id);
                  setSelectedId(element.id);
                }}>
                {editingId === element.id ? (
                  <textarea
                    autoFocus
                    value={element.text}
                    onChange={(e) => updateText(element.id, { text: e.target.value })}
                    onBlur={() => setEditingId(null)}
                    className="min-w-[120px] max-w-[400px] p-1 bg-white/80 text-black rounded border border-gray-400 text-sm"
                    rows={Math.max(2, Math.min(6, element.text.split('\n').length))}
                  />
                ) : (
                  <>
                    {selectedId === element.id && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteText(element.id);
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs hover:bg-red-600 z-10"
                      >
                        ✕
                      </button>
                    )}
                    {element.text}
                  </>
                )}
              >

              </div>
            ))}

            {textElements.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <div className="text-6xl mb-4">📖</div>
                  <h3 className="text-lg font-medium mb-2">Start creating</h3>
                  <p className="text-sm">Add an ayah or translation with the buttons above</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Side Panel */}
        {(!isPanelOpen && window.innerWidth < 768) ? null : (
        <div className="bg-gray-900 border-l border-gray-700 overflow-y-auto p-2 md:p-4" style={{ width: window.innerWidth < 768 ? '10rem' : '20rem' }}>
          {/* Canvas Background Settings */}
          <div className="text-white mb-3 space-y-2 text-xs">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-white/80">🎨 Canvas background</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-2">Background color</label>
                <div className="flex space-x-2">
                  <input
                    type="color"
                    value={canvasBackground === 'transparent' ? '#ffffff' : canvasBackground}
                    onChange={(e) => setCanvasBackground(e.target.value)}
                    className="w-10 h-8 rounded border border-gray-600"
                  />
                  <button
                    onClick={() => setCanvasBackground('transparent')}
                    className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                      canvasBackground === 'transparent'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    🔲 Transparent
                  </button>
                </div>
              </div>
            </div>

            <div style={{ display: 'none' }}>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={exportFullCanvas}
                  onChange={(e) => setExportFullCanvas(e.target.checked)}
                />
                <span>Export as visible canvas</span>
              </label>
            </div>
          </div>

          {selectedElement ? (
            <div className="text-white">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-white/80 mb-2">⚙️ Text settings</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Text</label>
                  <textarea
                    ref={setTextareaRef}
                    value={selectedElement.text}
                    onChange={(e) => updateText(selectedElement.id, { text: e.target.value })}
                    className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white resize-none text-xs"
                    rows={2}
                  />
                </div>

                {/* Kashida Button for Arabic */}
                {selectedElement.language === 'arabic' && (
                  <div>
                    <button
                      onClick={addKashida}
                      className="w-full bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
                    >
                      ـ Add kashida
                    </button>
                  </div>
                )}
                {/* Шрифт */}
                <div>
                  <label className="block text-sm font-medium mb-2">Font</label>
                  <select
                    value={selectedElement.fontFamily || (selectedElement.language === 'arabic' ? 'Amiri, serif' : 'Georgia, serif')}
                    onChange={(e) => updateText(selectedElement.id, { fontFamily: e.target.value })}
                    className="w-full p-2 border border-gray-600 rounded bg-gray-800 text-white text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <optgroup label="System fonts">
                      <option value={'Amiri, serif'}>Amiri</option>
                      <option value={'Georgia, serif'}>Georgia</option>
                    </optgroup>
                    {customFonts.length > 0 && (
                      <optgroup label="Custom fonts">
                        {customFonts.map((font) => (
                          <option key={font} value={font}>{font}</option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                </div>


                <div>
                  <label className="block text-xs font-medium mb-1">
                    Size: {selectedElement.fontSize}px
                  </label>
                  <input
                    type="range"
                    min="6"
                    max="120"
                    value={selectedElement.fontSize}
                    onChange={(e) => updateText(selectedElement.id, { fontSize: parseInt(e.target.value) })}
                    className="w-full h-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Text color</label>
                  <input
                    type="color"
                    value={selectedElement.color}
                    onChange={(e) => updateText(selectedElement.id, { color: e.target.value })}
                    className="w-full h-8 rounded border border-gray-600"
                  />
                </div>

                <div className="bg-gray-800 rounded p-3 border border-gray-700">
                  <h4 className="text-sm font-medium mb-2">ℹ️ Info</h4>
                  <div className="text-xs text-gray-400 space-y-1">
                    <div>Language: <span className="text-white">{
                      selectedElement.language === 'arabic' ? 'Arabic' :
                      selectedElement.language === 'english' ? 'English' : 'Russian'
                    }</span></div>
                    <div>Position: <span className="text-white">{Math.round(selectedElement.x)}, {Math.round(selectedElement.y)}</span></div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 mt-20">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-lg font-medium mb-2">Select a text</h3>
              <p className="text-sm">Click on a text to edit it</p>
              <p className="text-xs mt-2">💡 Drag a text to move it</p>
            </div>
          )}
        </div>
          )}
      </div>
    </div>
  );
}

export default App;