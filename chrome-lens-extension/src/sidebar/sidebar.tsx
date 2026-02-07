import React, { useEffect, useState, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import '../styles/globals.css';

interface SavedItem {
  id: string;
  image: string;
  timestamp: number;
  description?: string;
}

const Sidebar: React.FC = () => {
  const [items, setItems] = useState<SavedItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ 
    x: Math.max(20, window.innerWidth - 340), 
    y: 20 
  });
  const [isVisible, setIsVisible] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Register instance for external control
    setSidebarInstance({ setIsVisible });
    
    loadItems();
    // Listen for new items and show requests
    const handleMessage = (e: MessageEvent) => {
      if (e.data.type === 'GREEN_ITEM_SAVED') {
        loadItems();
        setIsVisible(true);
      }
      if (e.data.type === 'GREEN_SHOW_SIDEBAR') {
        setIsVisible(true);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const loadItems = async () => {
    const result = await chrome.storage.local.get('greenSavedItems');
    const savedItems = result.greenSavedItems || [];
    setItems(savedItems);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.sidebar-content')) return;
    setIsDragging(true);
    const rect = sidebarRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  const removeItem = async (id: string) => {
    const updated = items.filter((item) => item.id !== id);
    await chrome.storage.local.set({ greenSavedItems: updated });
    setItems(updated);
  };

  if (!isVisible) return null;

  return (
    <div
      ref={sidebarRef}
      id="project-green-sidebar"
      className="fixed z-[2147483646] w-80 bg-white rounded-lg shadow-2xl border-2 border-[#98FF98]"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="sidebar-content">
        <div className="bg-[#98FF98] px-4 py-3 rounded-t-lg flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#1a5a1a]">Saved Items</h2>
          <button
            onClick={() => setIsVisible(false)}
            className="text-[#1a5a1a] hover:text-[#0d3a0d] text-xl font-bold"
          >
            ×
          </button>
        </div>
        <div className="max-h-[600px] overflow-y-auto p-4">
          {items.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No items saved yet</p>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="border border-gray-200 rounded-lg p-3 hover:border-[#98FF98] transition-colors"
                >
                  <img
                    src={item.image}
                    alt="Saved item"
                    className="w-full h-32 object-cover rounded mb-2"
                  />
                  {item.description && (
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>
                      {new Date(item.timestamp).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-700 font-medium"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export function injectSidebar() {
  if (document.getElementById('project-green-sidebar')) return;
  
  const container = document.createElement('div');
  container.id = 'project-green-sidebar-container';
  document.body.appendChild(container);
  
  const root = createRoot(container);
  root.render(<Sidebar />);
}

let sidebarInstance: { setIsVisible: (visible: boolean) => void } | null = null;

export function setSidebarInstance(instance: { setIsVisible: (visible: boolean) => void }) {
  sidebarInstance = instance;
}

export function toggleSidebar() {
  if (sidebarInstance) {
    sidebarInstance.setIsVisible(true);
  } else {
    injectSidebar();
    // Sidebar will show itself after injection
    setTimeout(() => {
      if (sidebarInstance) {
        sidebarInstance.setIsVisible(true);
      }
    }, 100);
  }
}
