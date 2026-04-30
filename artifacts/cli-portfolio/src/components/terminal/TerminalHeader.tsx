import React from 'react';

export function TerminalHeader() {
  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-zinc-900/50 select-none">
      <div className="flex items-center space-x-4">
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-none bg-red-500" />
          <div className="w-3 h-3 rounded-none bg-amber-500" />
          <div className="w-3 h-3 rounded-none bg-emerald-500" />
        </div>
        <span className="text-xs text-muted-foreground font-mono">guest@portfolio:~$</span>
      </div>
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-xs text-muted-foreground font-mono">connected</span>
      </div>
    </div>
  );
}
