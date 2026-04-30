import React, { useState, useEffect, useRef } from 'react';
import { TerminalHeader } from './TerminalHeader';
import { TerminalLog } from './TerminalLog';
import { TerminalPrompt } from './TerminalPrompt';
import { Avatar } from './Avatar';
import { handleCommand, CommandOutput } from '@/lib/commands';
import { BOOT_SEQUENCE, INITIAL_HINT } from '@/lib/boot';

export function Terminal() {
  const [logs, setLogs] = useState<CommandOutput[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [isBooting, setIsBooting] = useState(true);
  const [bootLog, setBootLog] = useState<string[]>([]);
  const [lastCommand, setLastCommand] = useState('');
  const [animatingLogIndex, setAnimatingLogIndex] = useState<number | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Boot sequence
  useEffect(() => {
    let currentLine = 0;
    const interval = setInterval(() => {
      if (currentLine < BOOT_SEQUENCE.length) {
        setBootLog(prev => [...prev, BOOT_SEQUENCE[currentLine]]);
        currentLine++;
      } else {
        clearInterval(interval);
        setTimeout(() => setIsBooting(false), 300);
      }
    }, 200);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, bootLog, isBooting]);

  const onCommand = (cmd: string) => {
    if (cmd.startsWith('_options ')) {
      // Special hidden command for autocomplete options
      const options = cmd.substring(9);
      setLogs(prev => [...prev, { command: cmd, blocks: [{ type: 'text', content: options }] }]);
      return;
    }

    setHistory(prev => [...prev, cmd]);
    setLastCommand(cmd);
    
    const output = handleCommand(cmd);
    
    if (output.blocks.length === 1 && output.blocks[0].type === 'clear') {
      setLogs([]);
      setAnimatingLogIndex(null);
      return;
    }

    setLogs(prev => {
      const next = [...prev, output];
      setAnimatingLogIndex(next.length - 1);
      return next;
    });
  };

  const onCancel = () => {
    setLogs(prev => [...prev, { command: '', blocks: [{ type: 'text', content: '^C' }] }]);
    setAnimatingLogIndex(null);
  };

  const onClear = () => {
    setLogs([]);
    setAnimatingLogIndex(null);
    setLastCommand('clear');
  };

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-zinc-950 text-emerald-500 font-mono overflow-hidden selection:bg-emerald-500/30 selection:text-emerald-200">
      <TerminalHeader />
      
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24"
      >
        <div className="max-w-4xl mx-auto flex flex-col min-h-full">
          
          {/* Boot Log */}
          {bootLog.map((line, i) => (
            <div key={`boot-${i}`} className="text-zinc-500 mb-1">{line}</div>
          ))}

          {/* Initial Hint */}
          {!isBooting && logs.length === 0 && (
            <div className="text-zinc-600 mb-4 mt-2">{INITIAL_HINT}</div>
          )}

          {/* Command Logs */}
          {!isBooting && logs.map((log, i) => {
            if (log.command.startsWith('_options ')) {
              return <div key={`log-${i}`} className="text-zinc-400 mb-4 whitespace-pre-wrap">{log.blocks[0].content}</div>;
            }
            return (
              <TerminalLog 
                key={`log-${i}`} 
                command={log.command} 
                blocks={log.blocks} 
                isAnimating={i === animatingLogIndex}
                onAnimationComplete={() => {
                  if (i === animatingLogIndex) setAnimatingLogIndex(null);
                }}
              />
            );
          })}

          {/* Prompt */}
          {!isBooting && (
            <TerminalPrompt 
              onCommand={onCommand}
              onCancel={onCancel}
              onClear={onClear}
              history={history}
              isAnimating={animatingLogIndex !== null}
            />
          )}

        </div>
      </div>

      <Avatar lastCommand={lastCommand} />
    </div>
  );
}
