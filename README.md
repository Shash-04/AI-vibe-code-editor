<div align="center">
  <img src="public/banner.png" alt="VibeCode Banner" width="100%" />

  # 🧠 VibeCode Editor
  ### The AI-Powered Web IDE of the Future
  
  [![Next.js](https://img.shields.io/badge/Next.js-15+-black?logo=next.js&logoColor=white)](https://nextjs.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  
  **VibeCode Editor** is a professional-grade, browser-based IDE designed for modern developers. Built with **WebContainers** and **Monaco Editor**, it brings the power of a desktop IDE to your browser with seamless AI integration and real-time execution.
</div>

---

## ✨ Key Features

VibeCode is packed with features to enhance your development workflow:

- 🚀 **WebContainers Integration**: Run Node.js, Next.js, and other frontend/backend stacks directly in your browser. No local setup required!
- 🤖 **AI-Powered Intelligence**: 
  - **MonacoPilot**: Inline code suggestions as you type.
  - **Context-Aware Chat**: Chat with your codebase to refactor, debug, or explain logic.
  - **Local LLM Support**: Integrated with llama for privacy-focused AI.
- 📂 **Workspace Management**:
  - Full-featured File Explorer to manage files and folders.
  - Multi-tab editor support with state persistence.
- 💻 **Interactive Pro-Terminal**: A fully interactive xterm.js terminal with support for standard shell commands.
- 🌗 **Themes & UX**: 
  - Beautifully crafted Dark and Light modes.
  - Minimalist, glassmorphic UI built with Shadcn UI.
- 🧱 **Instant Starters**: One-click initialization for React, Next.js, Angular, Vue, Hono, and Express.
- 🔐 **Secure Authentication**: OAuth integration with Google and GitHub via NextAuth.

---

## 🛠️ Tech Stack

VibeCode is built using the latest industry-standard technologies:

| Category | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Next.js 15+, Tailwind CSS 4 |
| **Editor** | Monaco Editor, MonacoPilot |
| **Runtime** | WebContainers API |
| **Terminal** | xterm.js |
| **Auth** | NextAuth (Auth.js) |
| **Database** | MongoDB + Prisma ORM |
| **AI/ML** | llama, Monacopilot |
| **UI Components** | Lucide Icons, Radix UI, Framer Motion |

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **NPM**, **PNPM**, or **Bun**
- **MongoDB** (Local or Atlas)

### 2. Installation
Clone the repository and install dependencies:

```bash
git clone https://github.com/your-username/vibe-code-editor.git
cd vibe-code-editor
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory and add the following:

```env
# Database
DATABASE_URL="mongodb+srv://..."

# Authentication
AUTH_SECRET="your_secret"
AUTH_GOOGLE_ID="your_google_id"
AUTH_GOOGLE_SECRET="your_google_secret"
AUTH_GITHUB_ID="your_github_id"
AUTH_GITHUB_SECRET="your_github_secret"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Database Setup
Sync your Prisma schema with MongoDB:

```bash
npx prisma generate
npx prisma db push
```

### 5. Launch
Start the development server:

```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to start coding!

---

## 🎹 Keyboard Shortcuts

Boost your productivity with built-in shortcuts:

| Shortcut | Action |
| :--- | :--- |
| `Ctrl + S` | Save current file |
| `Ctrl + Shift + S` | Save all open files |
| `Ctrl + Space` | Trigger AI suggestion |
| `Tab` | Accept AI suggestion |
| `Ctrl + B` | Toggle Sidebar (if implemented) |

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for more details.

---

<div align="center">
  <sub>Built with ❤️ by the VibeCode Team</sub>
</div>