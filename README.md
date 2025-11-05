# 🚀 PromptCraft

> An AI-powered prompt library and "Project Decomposer" for MERN/NEXT.js developers.

This project is an open-source tool built to solve a common developer problem: "AI-Assisted" coding is still hard because writing _good_ context-aware prompts is a manual, repetitive task.

## 🎯 The Problem

When developers use AI (like Copilot or ChatGPT) for a complex, project-level task (e.g., `"make a twitter clone with MERN"`), the AI returns a useless, high-level blog post, not actionable code. This is because the AI lacks project-specific context.

## ✨ The Solution

PromptCraft is an AI "Project Decomposer." Instead of giving you a vague answer, it takes your vague idea and breaks it down into an ordered, step-by-step **`PromptSet`**—a roadmap of actionable, high-quality prompts you can use to build your app piece by piece.

## 🛠️ Core Features

1.  **Dual-Tier AI "Router":** To stay within a $$$0 free budget, the app uses two AI models:
    - **"Basic Refine" (OpenRouter):** A fast, free-tier model (like DeepSeek) for simple prompt improvements.
    - **"Pro Refine" (Gemini 2.5 Flash):** A "premium" model for the "Project Decomposer" feature, giving users a limited number of high-value refines per day.
2.  **Community Library:** A public, community-driven library where MERN developers can share, browse, and upvote the best `Prompts` and `PromptSets`.
3.  **User Authentication:** Full user auth (`next-auth`) so users can own their submitted prompts, upvote, and save their favorites.
4.  **Resilient Quota System:** The app manages _both_ the global API quotas (Gemini, OpenRouter) and gives each registered user their _own_ daily quota (e.g., 25 "Basic" and 5 "Pro" refines) to ensure the app is always functional and free.

## 💻 Tech Stack (Context for Copilot)

This project is a modern, full-stack MERN/NEXT.js application.

- **Framework:** **NEXT.js 14+ (App Router)**
- **Frontend:** **React** & **Tailwind CSS**
- **Backend:** **NEXT.js API Routes**
- **Database:** **MongoDB** (using **Mongoose** for schemas)
- **Authentication:** **`next-auth`** (Credentials provider + `bcrypt` for password hashing)
- **AI (Pro):** **Gemini API**
- **AI (Basic):** **OpenRouter API**

## 🗂️ Database Schema Overview (Context for Copilot)

### 1. `User` Schema (`/models/User.js`)

```javascript
{
  "name": { "type": "String", "required": true },
  "email": { "type": "String", "required": true, "unique": true },
  "password": { "type": "String", "required": true }, // Will be hashed by bcrypt
  "image": { "type": "String" },
  "proRefinesRemaining": { "type": "Number", "default": 5 },
  "basicRefinesRemaining": { "type": "Number", "default": 25 }
}
```

### 2. `PromptSet` Schema (`/models/PromptSet.js`)

A "Prompt Set" is a collection of ordered prompts, like a "project."

```JavaScript

{
  "title": { "type": "String", "required": true },
  "description": { "type": "String", "required": true }, // The original vague user prompt
  "tags": ["String"],
  "author": { "type": "mongoose.Schema.Types.ObjectId", "ref": "User" },
  "upvotes": { "type": "Number", "default": 0 },
  "promptIds": [{ "type": "mongoose.Schema.Types.ObjectId", "ref": "Prompt" }] // Ordered list of prompts
}
```

### 3. `Prompt` Schema (`/models/Prompt.js`)

A single, actionable prompt.

```JavaScript

{
  "title": { "type": "String", "required": true }, // e.g., "1. Build User Auth API Routes"
  "promptText": { "type": "String", "required": true }, // The actual, high-quality prompt text
  "parentSet": { "type": "mongoose.Schema.Types.ObjectId", "ref": "PromptSet" }
}
```

## 🔗 API Endpoint Overview (Context for Copilot)

This section defines the core API routes for the application, built using NEXT.js API Routes (App Router).

### 1. User Registration

- **File:** `/app/api/register/route.js`
- **Method:** `POST`
- **Purpose:** Handles new user creation.
- **Logic:**
  1.  Connects to MongoDB using `connectDB`.
  2.  Receives `name`, `email`, and `password` from the request body.
  3.  Checks if `email` already exists in the `User` collection. Returns a `400` error if it does.
  4.  Creates a new `User` document. The `password` will be hashed automatically by the `pre-save` hook in the `User` model.
  5.  Saves the new user and returns a `201` (Created) status with a success message.
  6.  Includes `try...catch` for error handling.

### 2. User Authentication (next-auth)

- **File:** `/app/api/auth/[...nextauth]/route.js`
- **Method:** `GET` / `POST`
- **Purpose:** Handles all `next-auth` operations (login, logout, session management).
- **Framework:** `next-auth`
- **Logic (AuthOptions):**
  1.  **Strategy:** `session: { strategy: 'jwt' }`
  2.  **Providers:** - `CredentialsProvider`: This is our main login method. - The `authorize` function will: 1. Receive `email` and `password` from the login form. 2. Call `connectDB()`. 3. Find the user by `email` using `User.findOne({ email }).select('+password')`. 4. If no user, `return null`. 5. Use the `user.comparePassword(password)` method to verify the hash. 6. If password matches, return the `user` object. If not, `return null`.
      ...
  3.  **Callbacks:**
      - `jwt` callback: Adds the user's `_id` to the `token` object.
      - `session` callback: Adds the `_id` from the `token` to the `session.user` object.
      - **(Updated Logic):** The `jwt` and `session` callbacks will be modified to also pass the `basicRefinesRemaining` and `proRefinesRemaining` fields from the `User` model to the `session` object, making them available on the frontend.

### 3. Frontend Auth Provider

- **File:** `/app/components/AuthProvider.js`
- **Purpose:** A client-side component (`'use client'`) that wraps the application in the `next-auth/react` `SessionProvider`.
- **Implementation:** This component will be used in the root `/app/layout.js` to provide session context to all pages.

### 4. "Basic" AI Refine Endpoint

- **File:** `/app/api/refine/basic/route.js`
- **Method:** `POST`
- **Purpose:** Handles "Basic" prompt refinement using the OpenRouter free tier.
- **Logic:**
  1.  Uses `getServerSession` from `next-auth` to get the user's session. **This is a protected route.**
  2.  Returns `401` (Unauthorized) if no user is logged in.
  3.  Receives `prompt` from the request body.
  4.  Calls `connectDB()` and finds the `User` by `session.user.id`.
  5.  **Quota Check:** Checks if `user.basicRefinesRemaining > 0`. If not, returns `402` (Payment Required) with a "quota exceeded" message.
  6.  **AI Call:** ...It uses the system role to define the AI's job. It then sends the user prompt to `meta-llama/llama-3.2-3b-instruct:free`, a fast and stable free model.
  7.  **Data Cleaning:** On a successful response, the API cleans the output string to remove special LLM tokens (like `<s>, [INST]`) before sending it to the frontend.
  8.  Returns the AI-generated text response.

### 5. "Pro" AI Refine Endpoint

- **File:** `/app/api/refine/pro/route.js`
- **Method:** `POST`
- **Purpose:** Handles high-value "Pro" refinement (e.g., "Project Decomposer") using the Gemini API.

* **Logic:**
  1.  **Protected Route:** Checks for a valid session.
  2.  Receives `prompt` from the request body.
  3.  Calls `connectDB()` and finds the `User`.
  4.  **Quota Check:** Checks if `user.proRefinesRemaining > 0`.
  5.  **AI Call (New Strategy):**
      - It will _not_ generate JSON.
      - It will use a new "Pro Master Prompt" to instruct Gemini to act as a "Strategic Co-Founder" (like Catalyst).
      - Its job is to take the user's vague idea (e.g., "MERN Twitter Clone") and generate a **single, structured, markdown-formatted "meta-prompt"**.
      - This meta-prompt will be formatted like our project's `README.md`, with sections like `## CORE_MISSION`, `## TECH_STACK`, `## DATABASE_SCHEMAS`, and `## YOUR_FIRST_TASK`.
  6.  **Quota Update:** On success, decrements `user.proRefinesRemaining`.
  7.  **Response:** Returns a _single text string_ containing the formatted markdown.

## 🎨 Frontend UI Overview (Context for Copilot)

This section defines the core React components for the "PromptCraft" user interface, built using NEXT.js (App Router) and Tailwind CSS.

### 1. Root Layout (`/app/layout.js`)

- **Purpose:** The main layout for the entire application.
- **Logic:**
  1.  Renders the `<html>` and `<body>` tags.
  2.  Wraps the entire application's `children` with our client-side `<AuthProvider>`.
  3.  Renders the `<Navbar>` component _inside_ the `<body>` but _outside_ (and above) the `children`, making it persistent on every page.

### 2. AuthProvider (`/app/components/AuthProvider.js`)

- **Purpose:** A client-side (`'use client'`) component that provides `next-auth` session context to the entire application.
- **Logic:** Wraps `{children}` with the `<SessionProvider>` from `next-auth/react`.

### 3. Navbar (`/app/components/Navbar.js`)

- **Purpose:** The primary navigation and user status bar.
- **Logic:**
  1.  Must be a client component (`'use client'`) to use the `useSession` hook.
  2.  **Logged-Out State:** Shows "Login" and "Register" links (`<Link href='/login'>` and `<Link href='/register'>`).
  3.  **Logged-In State:**
      - Uses `useSession()` to get the user's `session`.
      - Shows the user's name (`session.user.name`).
      - Shows a "Logout" button that calls `signOut()`.
      - **Dynamic Quotas:** Displays the user's remaining quotas. (We will fetch this dynamically).
  4.  **Branding:** A "PromptCraft" title links to the homepage (`'/'`).

### 4. Register Page (`/app/register/page.js`)

- **Purpose:** A client-side (`'use client'`) page with a form to register a new user.
- **State:** Manages form state for `name`, `email`, and `password`.
- **Logic:**
  1.  On submit, it calls our `/api/register` POST endpoint.
  2.  If successful, it redirects the user to the `/login` page.
  3.  If an error (e.g., "User already exists"), it displays the error message.

### 5. Login Page (`/app/login/page.js`)

- **Purpose:** A client-side (`'use client'`) page with a form to log in.
- **State:** Manages form state for `email` and `password`.
- **Logic:**
  1.  On submit, it calls the `signIn` function from `next-auth/react` with the `credentials` provider.
  2.  If successful (`signIn` returns a non-error), it redirects the user to the homepage (`'/'`).
  3.  If an error (e.g., "Invalid credentials"), it displays the error message.

### 6. Quota Context (`/app/context/QuotaContext.js`)

- **Purpose:** A client-side (`'use client'`) React Context to manage and share the user's AI quota _globally_. This allows the "Refiner" page to decrement the quota and the `Navbar` to display the new value instantly, without a page refresh.
- **Logic:**
  1.  Creates a `QuotaContext`.
  2.  Creates a `QuotaProvider` component.
  3.  `QuotaProvider` gets the initial `session` from `useSession`.
  4.  It uses `useState` to store `basicQuota` and `proQuota`.
  5.  It uses `useEffect` to load the initial quota values from `session.user.basicRefinesRemaining` and `session.user.proRefinesRemaining` when the session first loads.
  6.  It provides the `basicQuota`, `proQuota`, and a function `spendQuota(type)` to all child components.
- **Implementation:** This `QuotaProvider` will be added to the root `/app/layout.js`, wrapping the `children` _inside_ the `AuthProvider`.

### 7. Homepage - The Refiner (`/app/page.js`)

- **Purpose:** The main application interface. This page is for logged-in users to refine their prompts.
- **Logic:**
  - **Logic:**
    1.  Client component (`'use client'`).
    2.  Gets `session`, `useQuota`, `useContext`.
    3.  **State:**
        - `prompt` (string), `response` (string), `loading` (boolean), `error` (string).
        - **New State:** `mode` (string, default 'basic').
    4.  **If logged out:** Shows a "Welcome..." message.
    5.  **If logged in:** Shows the main refiner UI:
        - A `<textarea>` for the `prompt`.
        - **New UI: Example Prompts:** 2-3 buttons ("e.g., MERN Twitter Clone") that `onClick` will set the `prompt` state to a pre-defined string.
        - **New UI: Refine Controls:**
          - A `<select>` dropdown (styled with Tailwind) to set the `mode` state ('basic' or 'pro').
          - A _single_ "Refine" button, disabled if `loading` or if the selected `mode`'s quota is 0.
        - **New UI: Copy Button:** A "Copy to Clipboard" button (using `navigator.clipboard`) will appear next to the "Refined Output" title when `response` exists.
        - **Output Section:**
          - Renders the `response` text in a `<pre>` tag.
          - **Smarter Error Handling:** The `handleRefine` function will check the response `status`. If it's a `402`, it will set the `error` state to a friendly message (e.g., "Pro quota exceeded."). If it's another error, it shows a generic "An error occurred."

### 3. Navbar (`/app/components/Navbar.js`) - (Updated)

- **Logic (Updated):**
  1.  ... (existing logic) ...
  2.  **Dynamic Quotas (Updated):** It will now import `useContext(QuotaContext)` and display the `basicQuota` and `proQuota` values from the context directly, replacing the static placeholders.

### 1. Root Layout (`/app/layout.js`) - (Updated)

- **Logic (Updated):**
  1.  ... (existing logic) ...
  2.  The `QuotaProvider` will be added to the layout, wrapping the `{children}`. The final component tree will be `<body><AuthProvider><Navbar /><QuotaProvider>{children}</QuotaProvider></AuthProvider></body>`.
