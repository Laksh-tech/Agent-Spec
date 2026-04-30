import React, { useEffect, useState } from 'react';

interface AvatarProps {
  lastCommand: string;
}

export function Avatar({ lastCommand }: AvatarProps) {
  const [message, setMessage] = useState("System ready. Type 'help' to begin.");
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const cmd = lastCommand.trim().toLowerCase().split(/\s+/)[0];
    let nextMessage = "";

    switch (cmd) {
      case '':
        nextMessage = "System ready. Type 'help' to begin.";
        break;
      case 'projects':
        nextMessage = "I built these from scratch. No copy-pasting allowed.";
        break;
      case 'philosophy':
        nextMessage = "This is the most important part of my stack.";
        break;
      case 'whoami':
        nextMessage = "Backend. Always backend.";
        break;
      case 'ls':
        if (lastCommand.includes('-skills')) {
          nextMessage = "Primitives, not frameworks.";
        } else {
          nextMessage = "Hmm, that one's not wired up.";
        }
        break;
      case 'roadmap':
        nextMessage = "Always sharpening the saw.";
        break;
      case 'help':
        nextMessage = "Pick a thread to pull on.";
        break;
      case 'clear':
        nextMessage = "Clean slate.";
        break;
      case 'contact':
      case 'date':
      case 'echo':
      case 'pwd':
        nextMessage = "Basic utilities.";
        break;
      default:
        nextMessage = "Hmm, that one's not wired up.";
    }

    if (message !== nextMessage) {
      setOpacity(0);
      setTimeout(() => {
        setMessage(nextMessage);
        setOpacity(1);
      }, 150);
    }
  }, [lastCommand]);

  return (
    <div className="fixed bottom-4 right-4 hidden sm:flex flex-col items-end space-y-2 pointer-events-none select-none z-50">
      <div 
        className="max-w-[260px] bg-zinc-900 border border-emerald-500 p-3 rounded-none text-zinc-200 text-sm font-mono transition-opacity duration-150 ease-in-out"
        style={{ opacity }}
      >
        {message}
      </div>
      <div className="w-[64px] h-[64px] rounded-full border-2 border-emerald-500 bg-zinc-900 flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="w-10 h-10">
          <circle cx="35" cy="40" r="5" fill="#10b981" />
          <circle cx="65" cy="40" r="5" fill="#10b981" />
          <line x1="30" y1="65" x2="70" y2="65" stroke="#10b981" strokeWidth="4" strokeLinecap="square" />
        </svg>
      </div>
    </div>
  );
}
