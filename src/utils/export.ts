export const exportCanvasAsPNG = (textElements: any[]) => {
  // Create a temporary canvas
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return;

  // Find the bounds of all text elements by measuring actual text
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  
  // First pass: measure all text elements to find bounds
  textElements.forEach(element => {
    // Set font for measurement
    ctx.font = `${element.fontSize}px ${element.fontFamily}`;
    
    const lines = element.text.split('\n');
    let maxLineWidth = 0;
    
    lines.forEach(line => {
      const metrics = ctx.measureText(line);
      maxLineWidth = Math.max(maxLineWidth, metrics.width);
    });
    
    const textHeight = lines.length * element.fontSize * 1.2;
    
    minX = Math.min(minX, element.x);
    minY = Math.min(minY, element.y);
    maxX = Math.max(maxX, element.x + maxLineWidth);
    maxY = Math.max(maxY, element.y + textHeight);
  });

  // Add padding
  const padding = 50;
  const width = Math.max(800, maxX - minX + padding * 2);
  const height = Math.max(600, maxY - minY + padding * 2);
  
  // Set high DPI for better quality
  const dpr = window.devicePixelRatio || 1;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);
  
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';

  // Clear background (transparent)
  ctx.clearRect(0, 0, width, height);

  // Draw each text element
  textElements.forEach(element => {
    ctx.font = `${element.fontSize}px ${element.fontFamily}`;
    ctx.fillStyle = element.color;
    ctx.textBaseline = 'top';
    
    // Set text direction and alignment based on language
    if (element.language === 'arabic') {
      ctx.direction = 'rtl';
      ctx.textAlign = 'right';
    } else {
      ctx.direction = 'ltr';
      ctx.textAlign = 'left';
    }

    const x = element.x - minX + padding;
    const y = element.y - minY + padding;

    // Handle multi-line text
    const lines = element.text.split('\n');
    lines.forEach((line: string, index: number) => {
      const lineY = y + (index * element.fontSize * 1.2);
      
      if (element.language === 'arabic') {
        // For Arabic text, we need to handle RTL properly
        const lineWidth = ctx.measureText(line).width;
        ctx.fillText(line, x + lineWidth, lineY);
      } else {
        ctx.fillText(line, x, lineY);
      }
    });
  });

  // Download the image
  canvas.toBlob((blob) => {
    if (blob) {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `quran-verse-${Date.now()}.png`;
      link.click();
      URL.revokeObjectURL(url);
    }
  }, 'image/png');
};