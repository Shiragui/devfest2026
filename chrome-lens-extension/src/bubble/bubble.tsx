import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '../styles/globals.css';

const Bubble: React.FC = () => {
  const [isActive, setIsActive] = useState(false);

  const handleClick = () => {
    setIsActive(!isActive);
    // Send message to content script to activate selection mode
    window.postMessage({ type: 'GREEN_ACTIVATE_SELECTION', active: !isActive }, '*');
  };

  return (
    <div
      id="project-green-bubble"
      className="fixed bottom-6 right-6 z-[2147483647] cursor-pointer transition-transform hover:scale-110"
      onClick={handleClick}
    >
      <div
        className={`w-14 h-14 rounded-full bg-[#98FF98] shadow-lg flex items-center justify-center border-2 ${
          isActive ? 'border-[#7AE87A] ring-4 ring-[#98FF98]/50' : 'border-[#7AE87A]'
        }`}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 2L2 7L12 12L22 7L12 2Z"
            stroke="#1a5a1a"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M2 17L12 22L22 17"
            stroke="#1a5a1a"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M2 12L12 17L22 12"
            stroke="#1a5a1a"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
};

// Inject bubble into page
export function injectBubble() {
  if (document.getElementById('project-green-bubble')) return;
  
  const container = document.createElement('div');
  container.id = 'project-green-bubble-container';
  document.body.appendChild(container);
  
  const root = createRoot(container);
  root.render(<Bubble />);
}
