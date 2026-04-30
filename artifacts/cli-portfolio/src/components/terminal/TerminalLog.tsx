import React, { useState, useEffect } from 'react';
import { CommandBlock } from '@/lib/commands';

interface TerminalLogProps {
  command: string;
  blocks: CommandBlock[];
  isAnimating: boolean;
  onAnimationComplete: () => void;
}

export function TerminalLog({ command, blocks, isAnimating, onAnimationComplete }: TerminalLogProps) {
  const [displayedChars, setDisplayedChars] = useState(0);

  // Flatten text content for simple calculation of animation frames
  const fullText = blocks.map(block => {
    if (block.type === 'text' || block.type === 'error' || block.type === 'quote') return block.content || '';
    if (block.type === 'table' && block.items) return block.items.map(r => r.join(' ')).join('');
    if (block.type === 'tree' && block.items) return block.items.join('');
    if (block.type === 'project' && block.projects) return block.projects.map(p => p.name + p.description).join('');
    return '';
  }).join('');

  useEffect(() => {
    if (!isAnimating) {
      setDisplayedChars(fullText.length);
      return;
    }

    const maxAnimationTime = 600; // ms
    const timePerChar = 15; // ms
    const totalChars = fullText.length;
    
    // If output is very long, speed up so we max out at 600ms
    const adjustedTimePerChar = Math.min(timePerChar, maxAnimationTime / totalChars);

    let charCount = 0;
    const interval = setInterval(() => {
      charCount += Math.ceil(timePerChar / adjustedTimePerChar); // step size
      if (charCount >= totalChars) {
        setDisplayedChars(totalChars);
        clearInterval(interval);
        onAnimationComplete();
      } else {
        setDisplayedChars(charCount);
      }
    }, adjustedTimePerChar);

    return () => clearInterval(interval);
  }, [isAnimating, fullText.length, onAnimationComplete]);

  // For non-text blocks or when animation is off, just render fully or wait.
  // For simplicity, we animate by revealing blocks incrementally if they're text-based, 
  // or revealing immediately if we reach their "turn".
  // A perfect typewriter effect would slice inside blocks. 
  // We'll just slice the whole thing if it's plain text, otherwise show everything when complete.
  
  if (isAnimating) {
    // If we're animating, we can just show a raw dump of text or wait until done to show complex UI.
    // For this implementation, we will wait until the animation finishes to show complex blocks,
    // and just type out plain text blocks.
  }

  const renderBlock = (block: CommandBlock, index: number) => {
    switch (block.type) {
      case 'text':
        return <div key={index} className="text-zinc-400 whitespace-pre-wrap break-words">{block.content}</div>;
      
      case 'error':
        return <div key={index} className="text-red-400 whitespace-pre-wrap break-words">{block.content}</div>;

      case 'quote':
        return (
          <div key={index} className="mt-2 text-zinc-300 whitespace-pre-wrap break-words pl-4 border-l-2 border-emerald-400 py-1">
            {block.content?.split('\n').map((line, i) => (
              <div key={i}>│ {line}</div>
            ))}
          </div>
        );

      case 'table':
        if (!block.items) return null;
        // Pad first column
        const maxColLength = Math.max(...block.items.map(row => row[0].length));
        return (
          <div key={index} className="flex flex-col text-zinc-400">
            {block.items.map((row, i) => (
              <div key={i} className="flex space-x-4">
                <span className="text-emerald-400 w-[120px] shrink-0">{row[0].padEnd(maxColLength)}</span>
                <span className="text-zinc-400">{row[1]}</span>
              </div>
            ))}
          </div>
        );

      case 'tree':
        if (!block.items) return null;
        return (
          <div key={index} className="flex flex-col text-zinc-400 whitespace-pre font-mono">
            {(block.items as string[]).map((line, i) => {
              if (line.startsWith('├') || line.startsWith('└')) {
                return <div key={i} className="text-zinc-500 pl-2">{line.substring(0, 3)}<span className="text-emerald-400">{line.substring(3)}</span></div>;
              }
              return <div key={i} className="text-amber-300 mt-2 font-bold">{line}</div>;
            })}
          </div>
        );

      case 'project':
        if (!block.projects) return null;
        return (
          <div key={index} className="flex flex-col space-y-4 mt-2">
            {block.projects.map((p, i) => (
              <div key={i} className="flex flex-col border border-zinc-800 p-3 bg-zinc-900/30">
                <div className="flex items-baseline space-x-2">
                  <span className="text-amber-300 font-bold">{p.name}</span>
                  <span className="text-zinc-500 text-xs">[{p.tag}]</span>
                </div>
                <div className="text-zinc-400 mt-2 mb-3 text-sm">{p.description}</div>
                <div className="flex justify-between text-xs text-zinc-600">
                  <span>lines: {p.lines}</span>
                  <span>lang: {p.lang}</span>
                </div>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col space-y-2 mb-4 font-mono text-sm sm:text-base">
      <div className="flex space-x-2">
        <span className="text-emerald-500 font-bold">guest@portfolio:~$</span>
        <span className="text-zinc-200">{command}</span>
      </div>
      
      {(!isAnimating || displayedChars >= fullText.length) ? (
        <div className="flex flex-col space-y-2">
          {blocks.map((b, i) => renderBlock(b, i))}
        </div>
      ) : (
        <div className="text-zinc-400 whitespace-pre-wrap break-words min-h-[1.5em]">
          {fullText.substring(0, displayedChars)}
        </div>
      )}
    </div>
  );
}
