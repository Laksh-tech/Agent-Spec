export type CommandType =
  | 'text'
  | 'tree'
  | 'quote'
  | 'table'
  | 'project'
  | 'error'
  | 'success'
  | 'hint'
  | 'clear'
  | 'cancel'
  | 'options'
  | 'kv'
  | 'inbox-list'
  | 'auth-action'
  | 'message-start';

export interface InboxMessageView {
  id: number;
  name: string;
  email: string | null;
  body: string;
  createdAt: string;
  delivered: boolean;
}

export interface CommandBlock {
  type: CommandType;
  content?: string;
  items?: string[] | string[][];
  projects?: { name: string; tag: string; description: string; lines: number; lang: string }[];
  kv?: { label: string; value: string; href?: string }[];
  inbox?: InboxMessageView[];
  action?: 'login' | 'logout';
}

export interface CommandOutput {
  command: string;
  blocks: CommandBlock[];
  /** true means the Terminal should run an async handler instead of treating this as final output */
  async?: 'inbox' | 'message-submit';
  /** when async='message-submit', payload to POST */
  payload?: { name: string; email: string | null; body: string };
}

export interface AuthSnapshot {
  isAuthenticated: boolean;
  email: string | null;
}

const COMMANDS: Record<string, string> = {
  help: 'List available commands',
  whoami: 'Display profile information',
  'ls -skills': 'List technical skills',
  roadmap: 'Show current learning path',
  projects: 'View builder portfolio',
  philosophy: 'Read engineering manifesto',
  contact: 'Display contact information',
  message: 'Send Laksh a message (delivered to gmail)',
  login: 'Sign in (owner only)',
  logout: 'Sign out',
  inbox: 'Read received messages (owner only)',
  whoami_session: 'Show current session user',
  clear: 'Clear terminal output',
  date: 'Print current date/time',
  echo: 'Print arguments',
  pwd: 'Print working directory',
};

const AUTOCOMPLETE_LIST: string[] = [
  'help',
  'whoami',
  'ls',
  'ls -skills',
  'roadmap',
  'projects',
  'philosophy',
  'contact',
  'message',
  'login',
  'logout',
  'inbox',
  'clear',
  'date',
  'echo',
  'pwd',
];

export function getAvailableCommands(): string[] {
  return AUTOCOMPLETE_LIST;
}

export function handleCommand(input: string, auth?: AuthSnapshot): CommandOutput {
  const trimmed = input.trim();
  const args = trimmed.split(/\s+/);
  const cmd = args[0].toLowerCase();

  if (!cmd) {
    return { command: input, blocks: [] };
  }

  const blocks: CommandBlock[] = [];

  switch (cmd) {
    case 'help': {
      const tableItems = Object.entries(COMMANDS)
        .filter(([c]) => c !== 'whoami_session')
        .map(([c, d]) => [c, d]);
      blocks.push({ type: 'table', items: tableItems });
      break;
    }

    case 'whoami':
      blocks.push({
        type: 'text',
        content:
          'Computer Science student (Class of 2026) focused on backend architecture. While others chase AI frameworks, I master the primitives: clean OOP, Data Structures, and systems connectivity.',
      });
      break;

    case 'ls':
      if (args[1] === '-skills') {
        blocks.push({
          type: 'tree',
          items: [
            'Languages',
            '├── C++',
            '├── Java',
            '├── Python',
            '└── SQL',
            'Systems',
            '├── Data Structures',
            '├── OOP',
            '├── Memory Management',
            '└── Concurrency',
            'Tooling',
            '├── Git',
            '├── Linux',
            '├── Make',
            '└── gdb',
          ],
        });
      } else {
        blocks.push({
          type: 'error',
          content: `ls: cannot access '${args[1] || ''}': No such file or directory`,
        });
      }
      break;

    case 'roadmap':
      blocks.push({ type: 'text', content: 'What I am currently mastering:' });
      blocks.push({
        type: 'text',
        content:
          '[x] STL containers\n[x] POSIX threads\n[~] Lock-free data structures\n[~] Advanced SQL indexing\n[ ] Distributed consensus\n[ ] Custom memory allocators\n[ ] Network protocols from scratch',
      });
      break;

    case 'projects':
      blocks.push({
        type: 'project',
        projects: [
          {
            name: 'MemKV',
            tag: 'In-memory key-value store',
            description:
              'Built a concurrent hash map with fine-grained locking. Implementing efficient eviction policies and managing memory overhead was a solid challenge.',
            lines: 1240,
            lang: 'C++',
          },
          {
            name: 'ServX',
            tag: 'Multithreaded HTTP server',
            description:
              'A custom web server built on raw sockets. Handling partial reads, HTTP parsing without regex, and managing a thread pool taught me the realities of networking.',
            lines: 2850,
            lang: 'Java',
          },
          {
            name: 'QueryOpt',
            tag: 'SQL query optimizer',
            description:
              'Parses simple SQL ASTs and applies heuristic rules (e.g., predicate pushdown) to generate a basic execution plan. Hardest part was tree traversal and transformation logic.',
            lines: 930,
            lang: 'Python',
          },
        ],
      });
      break;

    case 'philosophy':
      blocks.push({ type: 'text', content: 'Fundamentals Over Frameworks' });
      blocks.push({
        type: 'quote',
        content:
          "I realized that deploying tools I didn't understand wasn't engineering; it was just wiring. I ignore the daily AI hype cycle to focus 100% on the core computer science principles that build scalable systems.",
      });
      break;

    case 'contact':
      blocks.push({
        type: 'kv',
        kv: [
          { label: 'github  ', value: 'Laksh-tech', href: 'https://github.com/Laksh-tech' },
          {
            label: 'linkedin',
            value: 'laksh-singh-kushwah-tech8675',
            href: 'https://linkedin.com/in/laksh-singh-kushwah-tech8675/',
          },
          { label: 'email   ', value: 'laksh.sk108@gmail.com', href: 'mailto:laksh.sk108@gmail.com' },
        ],
      });
      blocks.push({
        type: 'hint',
        content: "tip: type 'message' to send something straight to my inbox.",
      });
      break;

    case 'message':
      blocks.push({ type: 'message-start' });
      break;

    case 'login':
      if (auth?.isAuthenticated) {
        blocks.push({
          type: 'text',
          content: `already signed in as ${auth.email ?? 'unknown'}`,
        });
      } else {
        blocks.push({
          type: 'text',
          content: 'redirecting to identity provider...',
        });
        blocks.push({ type: 'auth-action', action: 'login' });
      }
      break;

    case 'logout':
      if (!auth?.isAuthenticated) {
        blocks.push({ type: 'text', content: 'no active session.' });
      } else {
        blocks.push({ type: 'text', content: 'signing out...' });
        blocks.push({ type: 'auth-action', action: 'logout' });
      }
      break;

    case 'inbox':
      if (!auth?.isAuthenticated) {
        blocks.push({
          type: 'error',
          content: "permission denied. type 'login' to authenticate.",
        });
        break;
      }
      return { command: input, blocks: [], async: 'inbox' };

    case 'clear':
      blocks.push({ type: 'clear' });
      break;

    case 'date':
      blocks.push({ type: 'text', content: new Date().toString() });
      break;

    case 'echo':
      blocks.push({ type: 'text', content: args.slice(1).join(' ') });
      break;

    case 'pwd':
      blocks.push({ type: 'text', content: '/home/guest' });
      break;

    default:
      blocks.push({
        type: 'error',
        content: `command not found: ${cmd}. type 'help' for available commands.`,
      });
  }

  return { command: input, blocks };
}
