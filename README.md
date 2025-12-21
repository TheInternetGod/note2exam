# Note2Exam 🎓 | AI Study Companion

**Turn your notes into professional exam-style tests instantly.**

Note2Exam is a sophisticated SaaS-grade platform that leverages Google's advanced Gemini AI models to convert PDF study materials, images, and raw text into rigorous Computer Based Tests (CBT). Designed for serious aspirants preparing for Banking, SSC, Railways, and academic examinations.

🚀 **Live Demo:** [https://note2exam.vercel.app](https://note2exam.vercel.app)

---

## 🌟 Introduction

Success in competitive exams requires more than just reading—it requires practicing in a simulated environment. Note2Exam bridges the gap between passive learning and active testing. 

Unlike generic quiz generators, Note2Exam uses a multi-layered AI architecture to understand context, generate deep rationales for answers, and mimic the exact UI/UX of real government computer-based exams.

### Key Features
- **📂 Multi-Format Support:** Upload PDFs, Images, or paste text notes.
- **🧠 Smart Model Cascading:** Automatically switches between Gemini 3.0, 2.5, and 1.5 to ensure 100% uptime.
- **⚡ Fail-Safe API Architecture:** Supports multi-key rotation to bypass rate limits during heavy usage.
- **📊 Professional Analytics:** Detailed scorecards with accuracy, time analysis, and topic proficiency graphs.
- **🔒 Privacy First:** All processing happens in-memory; your notes are never stored on a server.
- **📱 Responsive CBT UI:** A distraction-free interface that mirrors real exam portals.

---

## ⚙️ How It Works

The application is built on a modern **React + Vite** stack and interacts directly with Google's GenAI API.

1.  **Input Processing:** The user uploads a file or text. Large texts are sanitized and chunked to fit within token limits.
2.  **Prompt Engineering:** The app constructs a specialized "Academic Professor" prompt, injecting the user's content and specific instructions regarding difficulty (Easy/Medium/Hard) and JSON schema strictness.
3.  **AI Generation (The Brain):**
    *   The request is sent to **Gemini 3.0 Flash Preview** (Highest Intelligence).
    *   If that fails or is overloaded, it automatically falls back to **Gemini 2.5 Flash**.
    *   If that fails, it falls back to **Gemini 1.5 Flash**.
    *   *Result:* The user always gets an exam, regardless of API status.
4.  **Parsing & Rendering:** The JSON response is validated and rendered into an interactive exam interface.
5.  **Result Compilation:** Upon submission, the app calculates scores, generates a PDF report, and visualizes performance data using Recharts.

---

## 🛠️ Run Locally

Prerequisites: **Node.js 18+**

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/note2exam.git
    cd note2exam
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment:**
    Create a `.env` file in the root directory and add your Google Gemini API key:
    ```env
    VITE_API_KEY=your_gemini_api_key_here
    ```
    *(You can get a free key from [Google AI Studio](https://aistudio.google.com/app/apikey))*

4.  **Run the app:**
    ```bash
    npm run dev
    ```
    Open `http://localhost:5173` to view it in the browser.

---

## 🚀 Deployment Guide

You can deploy this project to **Vercel** (recommended), Netlify, or any static site hosting provider in minutes.

### Deploy to Vercel (Recommended)

1.  **Push to GitHub:** Ensure your code is pushed to a GitHub repository.
2.  **Import to Vercel:**
    *   Go to [Vercel Dashboard](https://vercel.com/dashboard).
    *   Click **"Add New"** > **"Project"**.
    *   Select your `note2exam` repository.
3.  **Configure Project:**
    *   **Framework Preset:** Vite
    *   **Root Directory:** `./`
4.  **Environment Variables:**
    *   Expand the "Environment Variables" section.
    *   Key: `API_KEY` (or `VITE_API_KEY`)
    *   Value: `Paste your Google Gemini API Key here`
5.  **Deploy:** Click **Deploy**. Vercel will build the app and provide a live URL within seconds.

### Deploy to Netlify/Others
The process is identical. Just ensure you add the `API_KEY` in the hosting platform's Environment Variables settings before triggering the build.

---

## Screenshots

<img width="1365" height="638" alt="img1" src="https://github.com/user-attachments/assets/91065309-4847-4234-8411-7577dd7a8c9d" />
<img width="1365" height="643" alt="img2" src="https://github.com/user-attachments/assets/8459399a-9adb-4bf8-8d5d-49ba7251bbc0" />
<img width="1366" height="768" alt="img3" src="https://github.com/user-attachments/assets/bb735278-d510-45c2-bace-637f5c1faf09" />
<img width="1365" height="637" alt="img4" src="https://github.com/user-attachments/assets/bb3c4ab7-60fe-4bb7-b8ae-fc502cba2dd2" />

---

## 🛡️ License

This project is open-source and available for educational purposes.

---

*Built with ❤️ for Students.*
