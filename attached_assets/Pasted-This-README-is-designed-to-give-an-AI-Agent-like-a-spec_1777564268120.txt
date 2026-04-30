This README is designed to give an AI Agent (like a specialized coding agent or a developer tool) the exact technical specifications and content structure required to build your site.

It translates your "Fundamentals Over Frameworks" philosophy into a concrete technical roadmap.

---

# README: Backend-Focused CLI Portfolio

## 1. Project Overview
A minimalist, high-performance personal portfolio designed as a **Terminal/CLI interface**. The goal is to showcase a "fundamentals-first" engineering mindset, focusing on backend architecture, OOP, and systems programming.

## 2. The Technical Stack
*   **Framework:** Next.js 14+ (App Router)
*   **Language:** TypeScript (for strict type safety)
*   **Styling:** Tailwind CSS (Theme: `bg-zinc-950`, `text-emerald-500`, Font: `JetBrains Mono`)
*   **State Management:** React `useState` and `useEffect` to manage command history and terminal output.

## 3. Core Requirements & UI Logic

### **A. Terminal Component**
*   **Input Handling:** A persistent input field at the bottom of the "log."
*   **Command History:** Users can use the Arrow Up/Down keys to cycle through previous commands.
*   **The "Blank Screen" Principle:** On load, the site should be nearly empty—just a blinking cursor—forcing interaction.

### **B. Command Dictionary**
The agent should implement a `handleCommand()` function with the following mappings:
*   `whoami`: Returns the **About Me** (Class of 2026, Backend focus).
*   `ls -skills`: Returns the **Technical Arsenal** (C++, Java, Python, SQL).
*   `roadmap`: Returns **What I Am Currently Mastering**.
*   `projects`: Returns the **Builder's Portfolio** with descriptions.
*   `philosophy`: Triggers the **"Fundamentals Over Frameworks"** manifesto.
*   `help`: Lists all available commands.
*   `clear`: Resets the terminal state.

### **C. The Avatar System (Guide)**
*   **Visual:** A simple, clean SVG or circular image in the bottom-right.
*   **Reactive Logic:** The Avatar component should watch the `terminalOutput` state.
*   **Messages:**
    *   *Idle:* "System ready. Type `help` to begin."
    *   *On Project command:* "I built these from scratch. No copy-pasting allowed."
    *   *On Philosophy command:* "This is the most important part of my stack."

## 4. Content Data (To be injected)

### **The "About Me" (Elevator Pitch)**
> "Computer Science student (Class of 2026) focused on backend architecture. While others chase AI frameworks, I master the primitives: clean OOP, Data Structures, and systems connectivity."

### **Engineering Philosophy**
> **"Fundamentals Over Frameworks"**
> "I realized that deploying tools I didn't understand wasn't engineering; it was just wiring. I ignore the daily AI hype cycle to focus 100% on the core computer science principles that build scalable systems."

## 5. Architectural Style Guidelines
*   **Simplicity:** No animations except for the blinking cursor and the typewriter effect for text output.
*   **Clean Code:** The Agent must ensure the code is modular (e.g., separate `Terminal`, `Avatar`, and `CommandLogic` components).
*   **Responsiveness:** The terminal must be mobile-friendly, using a virtual keyboard trigger for mobile users.

---

### **Agent Prompt to Start Coding:**
*"Using the README provided, initialize a Next.js project with Tailwind CSS. Create a terminal-emulator UI that processes the specific commands listed. Ensure the 'Engineering Philosophy' section is highlighted as the core identity of the site. Start by building the Command Logic handler first."*