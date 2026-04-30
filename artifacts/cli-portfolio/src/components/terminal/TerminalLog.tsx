import { useState, useEffect } from 'react';
import type { CommandBlock } from '@/lib/commands';

interface TerminalLogProps {
  command: string;
  blocks: CommandBlock[];
  isAnimating: boolean;
  onAnimationComplete: () => void;
}

export function TerminalLog({ command, blocks, isAnimating, onAnimationComplete }: TerminalLogProps) {
  const [displayedChars, setDisplayedChars] = useState(0);

  const fullText = blocks
    .map((block) => {
      if (block.type === 'text' || block.type === 'error' || block.type === 'quote' || block.type === 'success' || block.type === 'hint')
        return block.content || '';
      if (block.type === 'table' && block.items)
        return (block.items as string[][]).map((r) => r.join(' ')).join('');
      if (block.type === 'tree' && block.items) return (block.items as string[]).join('');
      if (block.type === 'project' && block.projects)
        return block.projects.map((p) => p.name + p.description).join('');
      if (block.type === 'kv' && block.kv) return block.kv.map((k) => k.label + k.value).join('');
      if (block.type === 'inbox-list' && block.inbox)
        return block.inbox.map((m) => m.name + m.body).join('');
      return '';
    })
    .join('');

  useEffect(() => {
    if (!isAnimating) {
      setDisplayedChars(fullText.length);
      return;
    }
    const maxAnimationTime = 600;
    const timePerChar = 15;
    const totalChars = fullText.length;
    if (totalChars === 0) {
      onAnimationComplete();
      return;
    }
    const adjustedTimePerChar = Math.min(timePerChar, maxAnimationTime / totalChars);
    let charCount = 0;
    const interval = setInterval(() => {
      charCount += Math.ceil(timePerChar / adjustedTimePerChar);
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

  const renderBlock = (block: CommandBlock, index: number) => {
    switch (block.type) {
      case 'text':
        return (
          <div key={index} className="text-zinc-400 whitespace-pre-wrap break-words">
            {block.content}
          </div>
        );

      case 'success':
        return (
          <div key={index} className="text-emerald-400 whitespace-pre-wrap break-words">
            {block.content}
          </div>
        );

      case 'hint':
        return (
          <div key={index} className="text-zinc-500 whitespace-pre-wrap break-words italic">
            {block.content}
          </div>
        );

      case 'error':
        return (
          <div key={index} className="text-red-400 whitespace-pre-wrap break-words">
            {block.content}
          </div>
        );

      case 'quote':
        return (
          <div
            key={index}
            className="mt-2 text-zinc-300 whitespace-pre-wrap break-words pl-4 border-l-2 border-emerald-400 py-1"
          >
            {block.content?.split('\n').map((line, i) => (
              <div key={i} className="text-emerald-400">
                │ <span className="text-zinc-300">{line}</span>
              </div>
            ))}
          </div>
        );

      case 'table': {
        if (!block.items) return null;
        const items = block.items as string[][];
        const maxColLength = Math.max(...items.map((row) => row[0].length));
        return (
          <div key={index} className="flex flex-col text-zinc-400">
            {items.map((row, i) => (
              <div key={i} className="flex space-x-4">
                <span className="text-emerald-400 shrink-0">{row[0].padEnd(maxColLength)}</span>
                <span className="text-zinc-400">{row[1]}</span>
              </div>
            ))}
          </div>
        );
      }

      case 'tree':
        if (!block.items) return null;
        return (
          <div key={index} className="flex flex-col text-zinc-400 whitespace-pre font-mono">
            {(block.items as string[]).map((line, i) => {
              if (line.startsWith('├') || line.startsWith('└')) {
                return (
                  <div key={i} className="text-zinc-500 pl-2">
                    {line.substring(0, 3)}
                    <span className="text-emerald-400">{line.substring(3)}</span>
                  </div>
                );
              }
              return (
                <div key={i} className="text-amber-300 mt-2 font-bold">
                  {line}
                </div>
              );
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

      case 'kv':
        if (!block.kv) return null;
        return (
          <div key={index} className="flex flex-col text-zinc-400">
            {block.kv.map((row, i) => (
              <div key={i} className="flex gap-3">
                <span className="text-zinc-500 shrink-0">{row.label} :</span>
                {row.href ? (
                  <a
                    href={row.href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-400 underline-offset-2 hover:underline"
                  >
                    {row.value}
                  </a>
                ) : (
                  <span className="text-emerald-400">{row.value}</span>
                )}
              </div>
            ))}
          </div>
        );

      case 'inbox-list':
        if (!block.inbox) return null;
        return (
          <div key={index} className="flex flex-col space-y-3 mt-1">
            <div className="text-zinc-500 text-xs">
              {block.inbox.length} message{block.inbox.length === 1 ? '' : 's'} — newest first
            </div>
            {block.inbox.map((m) => (
              <div key={m.id} className="border border-zinc-800 p-3 bg-zinc-900/30">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-xs">
                  <span className="text-amber-300 font-bold">#{m.id}</span>
                  <span className="text-zinc-300">{m.name}</span>
                  <span className="text-emerald-400">{m.email ?? '(no email)'}</span>
                  <span className="text-zinc-600">{new Date(m.createdAt).toLocaleString()}</span>
                  <span className={m.delivered ? 'text-emerald-500' : 'text-amber-300'}>
                    {m.delivered ? 'delivered' : 'queued'}
                  </span>
                </div>
                <div className="text-zinc-300 mt-2 whitespace-pre-wrap break-words text-sm">
                  {m.body}
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
      {command && (
        <div className="flex space-x-2">
          <span className="text-emerald-500 font-bold whitespace-pre">guest@portfolio:~$</span>
          <span className="text-zinc-200">{command}</span>
        </div>
      )}

      {!isAnimating || displayedChars >= fullText.length ? (
        <div className="flex flex-col space-y-2">{blocks.map((b, i) => renderBlock(b, i))}</div>
      ) : (
        <div className="text-zinc-400 whitespace-pre-wrap break-words min-h-[1.5em]">
          {fullText.substring(0, displayedChars)}
        </div>
      )}
    </div>
  );
}
