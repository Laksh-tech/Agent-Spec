import React, { useRef, useEffect, useState, KeyboardEvent } from 'react';
import { getAvailableCommands } from '@/lib/commands';

interface TerminalPromptProps {
  onCommand: (cmd: string) => void;
  onCancel: () => void;
  onClear: () => void;
  history: string[];
  isAnimating: boolean;
}

export function TerminalPrompt({ onCommand, onCancel, onClear, history, isAnimating }: TerminalPromptProps) {
  const [input, setInput] = useState('');
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [savedInput, setSavedInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus management
  useEffect(() => {
    const focusInput = () => {
      // Don't steal focus if user is selecting text
      if (window.getSelection()?.toString() !== '') return;
      inputRef.current?.focus();
    };

    document.addEventListener('click', focusInput);
    focusInput(); // Initial focus

    return () => document.removeEventListener('click', focusInput);
  }, []);

  // Prevent input while animating
  useEffect(() => {
    if (!isAnimating && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAnimating]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (isAnimating) {
      e.preventDefault();
      return;
    }

    if (e.key === 'c' && e.ctrlKey) {
      e.preventDefault();
      onCancel();
      setInput('');
      setHistoryIndex(-1);
      return;
    }

    if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      onClear();
      return;
    }

    if (e.key === 'Enter') {
      if (input.trim()) {
        onCommand(input);
      } else {
        onCancel(); // Just print prompt again if empty
      }
      setInput('');
      setHistoryIndex(-1);
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length === 0) return;
      
      const nextIndex = historyIndex + 1;
      if (nextIndex < history.length) {
        if (historyIndex === -1) {
          setSavedInput(input);
        }
        setHistoryIndex(nextIndex);
        setInput(history[history.length - 1 - nextIndex]);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIndex = historyIndex - 1;
        setHistoryIndex(nextIndex);
        setInput(history[history.length - 1 - nextIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput(savedInput);
      }
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      const commands = getAvailableCommands();
      const currentInput = input.trim().toLowerCase();
      
      if (!currentInput) return;

      const matches = commands.filter(c => c.startsWith(currentInput));
      
      if (matches.length === 1) {
        setInput(matches[0] + ' ');
      } else if (matches.length > 1) {
        // Just command that shows options, wait this breaks the normal input flow.
        // To be exact to the spec: single match completes; multiple matches print options
        // But printing options requires adding a log without a full command run.
        // Let's cheat a bit and submit a special internal command for options or just let user type.
        onCommand(`_options ${matches.join(' ')}`);
      }
    }
  };

  return (
    <div className="flex text-sm sm:text-base font-mono relative mt-1 items-center">
      <span className="text-emerald-500 font-bold whitespace-pre shrink-0">guest@portfolio:~$ </span>
      <div className="relative flex-1 flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full bg-transparent outline-none border-none text-transparent caret-transparent font-mono absolute inset-0 z-10"
          autoComplete="off"
          spellCheck="false"
          autoCorrect="off"
          autoCapitalize="off"
          disabled={isAnimating}
        />
        <div className="pointer-events-none flex whitespace-pre overflow-hidden">
          <span className="text-zinc-200">{input}</span>
          <span className="w-2.5 sm:w-3 h-[1.2em] bg-emerald-500 inline-block animate-[blink_1s_step-start_infinite] relative -ml-[1px]"></span>
        </div>
      </div>
    </div>
  );
}
