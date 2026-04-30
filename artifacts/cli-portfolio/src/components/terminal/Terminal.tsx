import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@workspace/replit-auth-web';
import { TerminalHeader } from './TerminalHeader';
import { TerminalLog } from './TerminalLog';
import { TerminalPrompt } from './TerminalPrompt';
import { Avatar } from './Avatar';
import {
  handleCommand,
  type CommandOutput,
  type CommandBlock,
  type InboxMessageView,
} from '@/lib/commands';
import { BOOT_SEQUENCE, INITIAL_HINT } from '@/lib/boot';

type MessageStep = 'name' | 'email' | 'body' | 'confirm';

interface MessageDraft {
  step: MessageStep;
  name?: string;
  email?: string | null;
  body?: string;
}

export function Terminal() {
  const { user, isAuthenticated, login, logout } = useAuth();

  const [logs, setLogs] = useState<CommandOutput[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [isBooting, setIsBooting] = useState(true);
  const [bootLog, setBootLog] = useState<string[]>([]);
  const [lastCommand, setLastCommand] = useState('');
  const [animatingLogIndex, setAnimatingLogIndex] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState<MessageDraft | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Boot sequence
  useEffect(() => {
    let currentLine = 0;
    const interval = setInterval(() => {
      if (currentLine < BOOT_SEQUENCE.length) {
        setBootLog((prev) => [...prev, BOOT_SEQUENCE[currentLine]]);
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
  }, [logs, bootLog, isBooting, draft]);

  const appendLog = useCallback(
    (entry: CommandOutput, animate = true) => {
      setLogs((prev) => {
        const next = [...prev, entry];
        if (animate) setAnimatingLogIndex(next.length - 1);
        return next;
      });
    },
    [],
  );

  const appendBlocks = useCallback(
    (command: string, blocks: CommandBlock[], animate = true) => {
      appendLog({ command, blocks }, animate);
    },
    [appendLog],
  );

  const runInbox = useCallback(async () => {
    setBusy(true);
    try {
      const res = await fetch('/api/messages', { credentials: 'include' });
      if (res.status === 401) {
        appendBlocks('', [
          { type: 'error', content: "permission denied. type 'login' to authenticate." },
        ], false);
        return;
      }
      if (res.status === 403) {
        appendBlocks('', [
          { type: 'error', content: 'forbidden. only the owner account can read the inbox.' },
        ], false);
        return;
      }
      if (!res.ok) {
        appendBlocks('', [
          { type: 'error', content: `inbox: server error (${res.status})` },
        ], false);
        return;
      }
      const data = (await res.json()) as { messages: InboxMessageView[] };
      if (data.messages.length === 0) {
        appendBlocks('', [{ type: 'hint', content: 'inbox is empty.' }], false);
        return;
      }
      appendBlocks('', [{ type: 'inbox-list', inbox: data.messages }], false);
    } catch (err) {
      appendBlocks('', [
        { type: 'error', content: `inbox: network error (${(err as Error).message})` },
      ], false);
    } finally {
      setBusy(false);
    }
  }, [appendBlocks]);

  const submitMessage = useCallback(
    async (payload: { name: string; email: string | null; body: string }) => {
      setBusy(true);
      try {
        const res = await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          appendBlocks('', [
            { type: 'error', content: `message: failed (${res.status})` },
          ], false);
          return;
        }
        const data = (await res.json()) as { id: number; delivered: boolean };
        if (data.delivered) {
          appendBlocks('', [
            { type: 'success', content: `message #${data.id} sent. delivered to laksh.sk108@gmail.com.` },
          ], false);
        } else {
          appendBlocks('', [
            {
              type: 'success',
              content: `message #${data.id} stored.`,
            },
            {
              type: 'hint',
              content:
                'note: smtp delivery is offline right now, but your message is safely queued and will reach the owner.',
            },
          ], false);
        }
      } catch (err) {
        appendBlocks('', [
          { type: 'error', content: `message: network error (${(err as Error).message})` },
        ], false);
      } finally {
        setBusy(false);
      }
    },
    [appendBlocks],
  );

  const startMessageFlow = useCallback(() => {
    setDraft({ step: 'name' });
    appendBlocks('', [
      { type: 'hint', content: "compose a message. press Ctrl+C at any prompt to abort." },
    ], false);
  }, [appendBlocks]);

  const handleDraftInput = useCallback(
    (raw: string) => {
      if (!draft) return;
      const value = raw.trim();

      if (draft.step === 'name') {
        if (!value) {
          appendBlocks('', [{ type: 'error', content: 'name is required.' }], false);
          return;
        }
        appendBlocks(`name> ${value}`, [], false);
        setDraft({ ...draft, step: 'email', name: value });
        return;
      }

      if (draft.step === 'email') {
        const email = value === '' || value === '-' ? null : value;
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          appendBlocks('', [
            { type: 'error', content: "that doesn't look like a valid email. try again or type '-' to skip." },
          ], false);
          return;
        }
        appendBlocks(`email> ${email ?? '(skipped)'}`, [], false);
        setDraft({ ...draft, step: 'body', email });
        return;
      }

      if (draft.step === 'body') {
        if (!value) {
          appendBlocks('', [{ type: 'error', content: 'message body is required.' }], false);
          return;
        }
        appendBlocks(`message>`, [{ type: 'text', content: value }], false);
        const next: MessageDraft = { ...draft, step: 'confirm', body: value };
        setDraft(next);
        appendBlocks('', [
          {
            type: 'kv',
            kv: [
              { label: 'from ', value: next.name ?? '' },
              { label: 'reply', value: next.email ?? '(none)' },
            ],
          },
          { type: 'hint', content: "type 'send' to deliver, or 'cancel' to abort." },
        ], false);
        return;
      }

      if (draft.step === 'confirm') {
        const cmd = value.toLowerCase();
        if (cmd === 'send' || cmd === 'y' || cmd === 'yes') {
          appendBlocks(`confirm> ${value}`, [], false);
          const payload = {
            name: draft.name!,
            email: draft.email ?? null,
            body: draft.body!,
          };
          setDraft(null);
          void submitMessage(payload);
          return;
        }
        if (cmd === 'cancel' || cmd === 'n' || cmd === 'no' || cmd === 'abort') {
          appendBlocks(`confirm> ${value}`, [{ type: 'text', content: 'aborted.' }], false);
          setDraft(null);
          return;
        }
        appendBlocks('', [
          { type: 'error', content: "please type 'send' or 'cancel'." },
        ], false);
      }
    },
    [draft, appendBlocks, submitMessage],
  );

  const onCommand = useCallback(
    (cmd: string) => {
      // Multi-step message flow takes priority
      if (draft) {
        setHistory((prev) => [...prev, cmd]);
        handleDraftInput(cmd);
        return;
      }

      if (cmd.startsWith('_options ')) {
        const options = cmd.substring(9);
        appendLog({ command: cmd, blocks: [{ type: 'text', content: options }] }, false);
        return;
      }

      setHistory((prev) => [...prev, cmd]);
      setLastCommand(cmd);

      const output = handleCommand(cmd, {
        isAuthenticated,
        email: user?.email ?? null,
      });

      if (output.async === 'inbox') {
        appendLog({ command: cmd, blocks: [{ type: 'text', content: 'fetching inbox...' }] }, false);
        void runInbox();
        return;
      }

      if (output.blocks.length === 1 && output.blocks[0].type === 'clear') {
        setLogs([]);
        setAnimatingLogIndex(null);
        return;
      }

      // intercept side-effect blocks
      const sideEffect = output.blocks.find(
        (b) => b.type === 'auth-action' || b.type === 'message-start',
      );

      const visibleBlocks = output.blocks.filter(
        (b) => b.type !== 'auth-action' && b.type !== 'message-start',
      );
      if (visibleBlocks.length > 0 || !sideEffect) {
        appendLog({ command: cmd, blocks: visibleBlocks });
      } else {
        // ensure command line is echoed
        appendLog({ command: cmd, blocks: [] }, false);
      }

      if (sideEffect?.type === 'auth-action') {
        // small delay so user reads the redirect message
        window.setTimeout(() => {
          if (sideEffect.action === 'login') login();
          else if (sideEffect.action === 'logout') logout();
        }, 350);
      }
      if (sideEffect?.type === 'message-start') {
        startMessageFlow();
      }
    },
    [
      draft,
      handleDraftInput,
      appendLog,
      isAuthenticated,
      user?.email,
      runInbox,
      login,
      logout,
      startMessageFlow,
    ],
  );

  const onCancel = useCallback(() => {
    appendLog({ command: '', blocks: [{ type: 'text', content: '^C' }] }, false);
    if (draft) setDraft(null);
    setAnimatingLogIndex(null);
  }, [appendLog, draft]);

  const onClear = useCallback(() => {
    setLogs([]);
    setAnimatingLogIndex(null);
    setLastCommand('clear');
    setDraft(null);
  }, []);

  const promptLabel = draft
    ? draft.step === 'name'
      ? 'name>'
      : draft.step === 'email'
        ? 'email (optional, "-" to skip)>'
        : draft.step === 'body'
          ? 'message>'
          : 'confirm (send / cancel)>'
    : 'guest@portfolio:~$';

  const isAnimating = animatingLogIndex !== null || busy;

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-zinc-950 text-emerald-500 font-mono overflow-hidden selection:bg-emerald-500/30 selection:text-emerald-200">
      <TerminalHeader sessionEmail={isAuthenticated ? user?.email ?? null : null} />

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24">
        <div className="max-w-4xl mx-auto flex flex-col min-h-full">
          {/* Boot Log */}
          {bootLog.map((line, i) => (
            <div key={`boot-${i}`} className="text-zinc-500 mb-1">
              {line}
            </div>
          ))}

          {/* Initial Hint */}
          {!isBooting && logs.length === 0 && !draft && (
            <div className="text-zinc-600 mb-4 mt-2">{INITIAL_HINT}</div>
          )}

          {/* Command Logs */}
          {!isBooting &&
            logs.map((log, i) => {
              if (log.command.startsWith('_options ')) {
                return (
                  <div key={`log-${i}`} className="text-zinc-400 mb-4 whitespace-pre-wrap">
                    {log.blocks[0].content}
                  </div>
                );
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
              isAnimating={isAnimating}
              label={promptLabel}
              autocompleteEnabled={!draft}
            />
          )}
        </div>
      </div>

      <Avatar lastCommand={lastCommand} draftStep={draft?.step ?? null} busy={busy} />
    </div>
  );
}
