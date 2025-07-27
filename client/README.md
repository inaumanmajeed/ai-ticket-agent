# AI Ticket Assistant Frontend

This is the Vite + React + TypeScript frontend for the AI Ticket Assistant project.

## Features

- Submit support tickets via a form
- Display ticket summary, category, suggested response, confidence, and optional trace/debug output
- Connects to backend API for ticket processing

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

- `src/` — Main source code
- `.github/copilot-instructions.md` — Copilot custom instructions

## Next Steps

- Implement the ticket submission form and result display
- Connect to backend API (Express/Nest + LangChain + LangGraph)

---

For backend setup, create a `/server` folder with Express.js, LangChain, LangGraph, ChromaDB, and OpenAI integration.
