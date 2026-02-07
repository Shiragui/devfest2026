import React, { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { injectBubble } from '../bubble/bubble';
import { injectSidebar, toggleSidebar } from '../sidebar/sidebar';
import '../styles/globals.css';

let selectionMode = false;
let startPos = { x: 0, y: 0 };
let currentRect = { x: 0, y: 0, w: 0, h: 0 };
let isDrawing = false;

const ContentApp: React.FC = () => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Inject bubble and sidebar
    injectBubble();
    injectSidebar();

    // Listen for activation messages
    const handleMessage = (e: MessageEvent) => {
      if (e.data.type === 'GREEN_ACTIVATE_SELECTION') {
        selectionMode = e.data.active;
        if (selectionMode) {
          showOverlay();
        } else {
          hideOverlay();
        }
      }
    };

    window.addEventListener('message', handleMessage);

    // Handle mouse events for selection
    const handleMouseDown = (e: MouseEvent) => {
      if (!selectionMode || !overlayRef.current) return;
      isDrawing = true;
      startPos = { x: e.clientX, y: e.clientY };
      currentRect = { x: e.clientX, y: e.clientY, w: 0, h: 0 };
      drawSelection();
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!selectionMode || !isDrawing || !overlayRef.current) return;
      currentRect = {
        x: Math.min(startPos.x, e.clientX),
        y: Math.min(startPos.y, e.clientY),
        w: Math.abs(e.clientX - startPos.x),
        h: Math.abs(e.clientY - startPos.y),
      };
      drawSelection();
    };

    const handleMouseUp = async (e: MouseEvent) => {
      if (!selectionMode || !isDrawing) return;
      isDrawing = false;

      if (currentRect.w < 10 || currentRect.h < 10) {
        hideOverlay();
        selectionMode = false;
        return;
      }

      // Capture and save
      await captureAndSave(currentRect);
      hideOverlay();
      selectionMode = false;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectionMode) {
        selectionMode = false;
        hideOverlay();
      }
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('message', handleMessage);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const showOverlay = () => {
    if (overlayRef.current) {
      overlayRef.current.style.display = 'block';
      overlayRef.current.style.pointerEvents = 'auto';
    }
  };

  const hideOverlay = () => {
    if (overlayRef.current) {
      overlayRef.current.style.display = 'none';
      overlayRef.current.style.pointerEvents = 'none';
    }
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
    isDrawing = false;
  };

  const drawSelection = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (currentRect.w > 0 && currentRect.h > 0) {
      // Draw selection rectangle
      ctx.strokeStyle = '#98FF98';
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 4]);
      ctx.strokeRect(currentRect.x, currentRect.y, currentRect.w, currentRect.h);

      // Fill with semi-transparent mint
      ctx.fillStyle = 'rgba(152, 255, 152, 0.15)';
      ctx.fillRect(currentRect.x, currentRect.y, currentRect.w, currentRect.h);
    }
  };

  const captureAndSave = async (rect: { x: number; y: number; w: number; h: number }) => {
    try {
      // Capture tab
      const response = await chrome.runtime.sendMessage({ type: 'CAPTURE_TAB' });
      if (!response || !response.success) {
        throw new Error('Failed to capture tab');
      }

      // Crop image
      const cropped = await cropImage(response.dataUrl, rect);
      
      // Save to storage
      const item = {
        id: Date.now().toString(),
        image: cropped,
        timestamp: Date.now(),
      };

      const result = await chrome.storage.local.get('greenSavedItems');
      const items = result.greenSavedItems || [];
      items.unshift(item);
      await chrome.storage.local.set({ greenSavedItems: items });

      // Notify sidebar
      window.postMessage({ type: 'GREEN_ITEM_SAVED' }, '*');
      
      // Show sidebar
      window.postMessage({ type: 'GREEN_SHOW_SIDEBAR' }, '*');

      // Show success toast
      showToast('Item saved!', 'success');
    } catch (error) {
      console.error('Error saving item:', error);
      showToast('Failed to save item', 'error');
    }
  };

  const cropImage = (dataUrl: string, rect: { x: number; y: number; w: number; h: number }): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const dpr = window.devicePixelRatio || 1;
        canvas.width = rect.w * dpr;
        canvas.height = rect.h * dpr;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        ctx.drawImage(
          img,
          rect.x * dpr,
          rect.y * dpr,
          rect.w * dpr,
          rect.h * dpr,
          0,
          0,
          rect.w * dpr,
          rect.h * dpr
        );
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = dataUrl;
    });
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-24 right-6 z-[2147483648] px-4 py-2 rounded-lg shadow-lg text-white text-sm font-medium ${
      type === 'success' ? 'bg-[#98FF98] text-[#1a5a1a]' : 'bg-red-500'
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 3000);
  };

  useEffect(() => {
    // Update canvas size
    const updateCanvasSize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  return (
    <>
      <div
        ref={overlayRef}
        id="project-green-overlay"
        className="fixed inset-0 z-[2147483645] bg-black/20 pointer-events-none"
        style={{ display: 'none' }}
      >
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 pointer-events-none"
        />
      </div>
    </>
  );
};

// Inject content app immediately
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

function init() {
  if (document.getElementById('project-green-content-root')) return;
  
  const container = document.createElement('div');
  container.id = 'project-green-content-root';
  document.body.appendChild(container);
  const root = createRoot(container);
  root.render(<ContentApp />);
}
