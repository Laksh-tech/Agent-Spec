interface TerminalHeaderProps {
  sessionEmail?: string | null;
}

export function TerminalHeader({ sessionEmail }: TerminalHeaderProps) {
  return (
    <div className="flex items-center justify-between bg-zinc-900 border-b border-zinc-800 px-3 py-2 shrink-0">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 bg-red-500" />
        <div className="w-3 h-3 bg-amber-400" />
        <div className="w-3 h-3 bg-emerald-500" />
      </div>
      <span className="text-xs text-zinc-400 font-mono">guest@portfolio:~$</span>
      <div className="flex items-center gap-2 text-xs font-mono">
        {sessionEmail && (
          <span className="text-emerald-400 truncate max-w-[180px]">
            {sessionEmail}
          </span>
        )}
        <span className="flex items-center gap-1 text-zinc-500">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
          connected
        </span>
      </div>
    </div>
  );
}
