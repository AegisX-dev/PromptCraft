# 🚀 PromptCraft

> An AI co-founder that turns your vague MERN/NEXT.js ideas into expert-level meta-prompts for your coding AI.

[YOUR HERO GIF HERE: A 10-second GIF showing the "MERN Twitter Clone" example. Show the "Basic" text output, then toggle to the "Pro" mode and show the beautiful, structured "Catalyst" meta-prompt being generated.]

## 🔴 Live Demo

**[YOUR LIVE DEMO LINK HERE - e.g., promptcraft.vercel.app]**

---

## The "Blank Page" Problem

As AI-assisted developers, we all know this frustrating loop:

> **You:** "Hey Copilot/ChatGPT, build me a MERN pet store website."
>
> **Useless AI:** "Sure! That's a great idea. Here's a 5-part blog post on what you'll need: 1. Set up React. 2. Choose a database. 3. Build an Express server..."

This is a failure of **context**. The AI doesn't know your stack, your goals, or your schemas, so it gives you a generic, high-level guide instead of _actionable code_.

## ✨ The "Expert Co-Founder" Solution

**PromptCraft** solves this. It's an AI-powered "Strategic Co-Founder" that you have a conversation with.

It takes your vague, project-level idea and turns it into a structured, expert-level **"meta-prompt"**—the _exact_ prompt an expert orchestrator would write. This single meta-prompt contains the mission, stack, schemas, and first tasks, all in one.

You just copy this one "meta-prompt" and paste it into your code assistant (Copilot, Gemini, etc.) to get _cohesive, context-aware code_ from the very first line.

## 🛠️ Core Features

- **🧠 AI-Powered "Pro Refiner":**
  Our main feature. It takes your idea (e.g., "MERN Twitter Clone") and generates a complete, structured "Catalyst" meta-prompt with sections for `## CORE_MISSION`, `## TECH_STACK`, `## DATABASE_SCHEMAS`, and `## YOUR_FIRST_TASK`.

- **⚡ Fast "Basic Refiner":**
  A high-speed refiner (powered by Llama 3.2 on OpenRouter) for smaller tasks, like improving a single, existing prompt.

- **💰 $$$0-Budget Architecture:**
  This project is a case study in $$$0-budget, resilient architecture.

  - **Dual-Model AI Router:** It intelligently routes requests between the "Pro" tier (Gemini 2.5 Flash) and the "Basic" tier (OpenRouter's free models).
  - **Per-User Quota System:** To stay 100% free, the app manages global API keys and gives every registered user their _own_ daily quota (e.c., 5 Pro, 25 Basic), which is tracked in MongoDB.

- **✨ Polished UX:**
  Includes all the "delight" features a real product needs: a "Copy to Clipboard" button, "Example Prompts" to demo the app, and smart, friendly error messages ("Quota exceeded!").

## 💻 Tech Stack

- **Framework:** **NEXT.js 14+** (App Router)
- **Backend:** **NEXT.js API Routes**
- **Database:** **MongoDB** (with **Mongoose**)
- **Authentication:** **`next-auth`** (Credentials Provider, JWT, `bcrypt` hashing)
- **Global State:** **React Context** (for real-time quota-sync between components)
- **AI (Pro):** **Gemini 2.5 Flash API**
- **AI (Basic):** **OpenRouter API** (routing to `meta-llama/llama-3.2-3b-instruct:free`)
- **Styling:** **Tailwind CSS**

## 🚀 How to Run Locally

1.  **Clone the repository:**

    ```bash
    git clone [https://github.com/](https://github.com/)[YOUR_USERNAME]/promptcraft.git
    cd promptcraft
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Set up your Environment Variables:**
    Create a file named `.env.local` in the root and add the following:

    ```env
    # Get from MongoDB Atlas
    MONGODB_URI=...

    # Get from Google AI Studio
    GEMINI_API_KEY=...

    # Get from OpenRouter.ai
    OPENROUTER_API_KEY=...
    NEXT_PUBLIC_OPENROUTER_BASE_URL=[https://openrouter.ai/api/v1](https://openrouter.ai/api/v1)

    # Generate a secret (e.g., `openssl rand -base64 32`)
    NEXTAUTH_SECRET=...
    ```

4.  **Run the development server:**

    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) to see the app.

## ⭐ Like this project?

If this project helped you, or if you just think the architecture is cool, please **give it a star!**
