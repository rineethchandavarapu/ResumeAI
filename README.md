<div align="center">
  <img src="./src/app/icon-rai.png" width="120" alt="RAI Logo" />
  <h1>ResumeAI</h1>
  <p><strong>The Deterministic AI Career Intelligence Platform</strong></p>
  
  <p>
    <a href="#features">Features</a> •
    <a href="#how-it-works">How It Works</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#getting-started">Getting Started</a> •
    <a href="#privacy">Privacy</a> •
    <a href="#license">License</a>
  </p>
</div>

---

## 🚀 The ATS Problem
Modern hiring systems don't read resumes like humans do—they parse documents into raw text, tokenize keywords, and use algorithmic matrices to rank candidates. If your formatting is slightly off or your phrasing lacks the exact semantic meaning the system expects, your resume is instantly discarded.

ResumeAI (**RAI**) reverses engineers this pipeline. It bridges the gap between talented professionals and the opaque Applicant Tracking Systems (ATS) used by 95% of Fortune 500 companies.

## ✨ Core Features

### 1. The ATS Parser Simulator
We ingest your document exactly how a corporate ATS (like Workday or Greenhouse) would. We identify catastrophic formatting failures before you submit your application.

### 2. Semantic Job Matching
Using advanced AI models, we cross-reference your extracted experience against your target job description, generating a deterministic fit threshold and keyword coverage index.

### 3. AI Rewrite Engine
Instead of just telling you what's wrong, our proprietary AI engine actively rewrites weak bullet points to maximize keyword density and grammatical impact. 

### 4. Career Roadmap & Diagnostics
We generate tailored technical & behavioral interview questions, plus optimized LinkedIn summaries, based strictly on the unique background extracted from your resume.

### 5. Beautiful, Brutalist UI
RAI is designed to feel like a premium SaaS product. It features a brutalist, typography-heavy design system powered by Tailwind CSS and smooth micro-animations powered by Framer Motion.

## 🛠 Tech Stack

RAI is built on a modern, high-performance web architecture:
- **Frontend Framework:** Next.js 14 (App Router) & React
- **Styling:** Tailwind CSS (Vanilla CSS structure, no external UI libraries)
- **Animation:** Framer Motion
- **Backend Infrastructure:** Next.js Serverless API Routes (Node.js)
- **Document Parsing:** Advanced extraction engines using `pdf-parse`
- **Core AI Engine:** **Google Gemini 1.5 Flash**. We utilize the official `@google/generative-ai` SDK to run complex, multi-stage prompts that act as our deterministic ATS simulator and content rewriter.

## 💻 Getting Started

RAI is a unified full-stack application. The backend intelligence and frontend UI are tightly integrated into a single repository, meaning you only need to run one development server.

### 1. Prerequisites
- Node.js (v18 or higher)
- npm (Node Package Manager)
- A [Google Gemini API Key](https://aistudio.google.com/app/apikey)

### 2. Environment Setup
Create a `.env.local` or `.env` file in the root directory of the project and add your API key:
```env
GEMINI_API_KEY="your-google-gemini-api-key"
```

### 3. Installation
Install the required Node.js dependencies:
```bash
npm install
```

### 4. Start the Application
Boot up the integrated Next.js development server:
```bash
npm run dev
```

### 5. Access the Platform
Open your browser and navigate to:
**[http://localhost:3000](http://localhost:3000)**

## 🔒 Privacy First
ResumeAI is designed to be run locally. Your uploaded resumes and job descriptions are never saved to a database. The data is temporarily kept in your browser's memory and securely sent to the Gemini API for processing. When you refresh the page, your data is wiped completely clean.

## 👨‍💻 The Creator
ResumeAI is independently designed, developed, and maintained by **Rineeth Chandavarapu** to level the playing field in enterprise hiring.

🔗 **[Connect with me on LinkedIn](https://www.linkedin.com/in/rineethchandavarapu/)**

## 📄 License
This project is licensed under the **MIT License**. See the [LICENSE](./LICENSE) file for more details.

---
<div align="center">
  <em>© 2026 Rineeth Chandavarapu. ALL RIGHTS RESERVED.</em>
</div>
