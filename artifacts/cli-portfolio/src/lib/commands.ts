export type CommandType = 'text' | 'tree' | 'quote' | 'table' | 'project' | 'error' | 'clear' | 'cancel' | 'options';

export interface CommandBlock {
  type: CommandType;
  content?: string;
  items?: string[] | string[][];
  projects?: { name: string; tag: string; description: string; lines: number; lang: string }[];
}

export interface CommandOutput {
  command: string;
  blocks: CommandBlock[];
}

const COMMANDS = {
  help: 'List available commands',
  whoami: 'Display profile information',
  'ls -skills': 'List technical skills',
  roadmap: 'Show current learning path',
  projects: 'View builder portfolio',
  philosophy: 'Read engineering manifesto',
  contact: 'Display contact information',
  clear: 'Clear terminal output',
  date: 'Print current date/time',
  echo: 'Print arguments',
  pwd: 'Print working directory'
};

export function getAvailableCommands(): string[] {
  return Object.keys(COMMANDS);
}

export function handleCommand(input: string): CommandOutput {
  const trimmed = input.trim();
  const args = trimmed.split(/\s+/);
  const cmd = args[0].toLowerCase();
  
  if (!cmd) {
    return { command: input, blocks: [] };
  }

  const blocks: CommandBlock[] = [];

  switch (cmd) {
    case 'help':
      const tableItems = Object.entries(COMMANDS).map(([c, d]) => [c, d]);
      blocks.push({ type: 'table', items: tableItems });
      break;

    case 'whoami':
      blocks.push({ 
        type: 'text', 
        content: 'Computer Science student (Class of 2026) focused on backend architecture. While others chase AI frameworks, I master the primitives: clean OOP, Data Structures, and systems connectivity.' 
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
            '└── gdb'
          ]
        });
      } else {
        blocks.push({ type: 'error', content: `ls: cannot access '${args[1] || ''}': No such file or directory` });
      }
      break;

    case 'roadmap':
      blocks.push({ type: 'text', content: 'What I am currently mastering:' });
      blocks.push({
        type: 'text',
        content: '[x] STL containers\n[x] POSIX threads\n[~] Lock-free data structures\n[~] Advanced SQL indexing\n[ ] Distributed consensus\n[ ] Custom memory allocators\n[ ] Network protocols from scratch'
      });
      break;

    case 'projects':
      blocks.push({
        type: 'project',
        projects: [
          {
            name: 'MemKV',
            tag: 'In-memory key-value store',
            description: 'Built a concurrent hash map with fine-grained locking. Implementing efficient eviction policies and managing memory overhead was a solid challenge.',
            lines: 1240,
            lang: 'C++'
          },
          {
            name: 'ServX',
            tag: 'Multithreaded HTTP server',
            description: 'A custom web server built on raw sockets. Handling partial reads, HTTP parsing without regex, and managing a thread pool taught me the realities of networking.',
            lines: 2850,
            lang: 'Java'
          },
          {
            name: 'QueryOpt',
            tag: 'SQL query optimizer',
            description: 'Parses simple SQL ASTs and applies heuristic rules (e.g., predicate pushdown) to generate a basic execution plan. Hardest part was tree traversal and transformation logic.',
            lines: 930,
            lang: 'Python'
          }
        ]
      });
      break;

    case 'philosophy':
      blocks.push({ type: 'text', content: 'Fundamentals Over Frameworks' });
      blocks.push({
        type: 'quote',
        content: "I realized that deploying tools I didn't understand wasn't engineering; it was just wiring. I ignore the daily AI hype cycle to focus 100% on the core computer science principles that build scalable systems."
      });
      break;

    case 'contact':
      blocks.push({ type: 'text', content: 'github   : john-doe' });
      blocks.push({ type: 'text', content: 'email    : john.doe@example.com' });
      blocks.push({ type: 'text', content: 'linkedin : john-doe' });
      break;

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
      blocks.push({ type: 'error', content: `command not found: ${cmd}. type 'help' for available commands.` });
  }

  return { command: input, blocks };
}
