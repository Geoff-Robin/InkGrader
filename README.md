# InkGrader 🖋️

**InkGrader** is a state-of-the-art, AI-powered grading system designed to automate the evaluation of handwritten documents. By combining advanced OCR (Optical Character Recognition) with intelligent multi-agent systems and RAG (Retrieval-Augmented Generation), InkGrader provides an unparalleled experience for automated grading and assessment management.

---

## ✨ Features

- **📷 Intelligent OCR Extraction**: High-accuracy extraction of handwritten text from scans and PDFs.
- **🤖 Multi-Agent AI System**: 
  - **Extraction Agent**: Seamlessly parses raw OCR text into structured question/answer formats.
  - **Grading Agent**: Evaluates student responses based on context, accuracy, and provided reference materials.
- **📚 RAG-Enhanced Evaluation**: Powered by PostgreSQL `pgvector`, the system cross-references student answers with official marking schemes for highly accurate grading.
- **⚡ Background Processing**: Leverages FastStream and Redis to handle grading tasks asynchronously in the background.
- **📊 Modern Dashboard**: A premium Next.js 16 App Router dashboard for managing exams, uploading student work, and viewing detailed feedback.
- **🔐 Enterprise-Grade Auth**: Secure authentication flow utilizing **Better Auth** with Drizzle ORM and PostgreSQL.

---

## 🛠️ Technology Stack

### Backend (Python/FastAPI)
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Asynchronous high-performance API)
- **Package Manager**: [uv](https://docs.astral.sh/uv/)
- **AI/LLM**: [Groq API](https://wow.groq.com/), Hugging Face Inference API for embeddings
- **Vector Search**: PostgreSQL `pgvector` extension
- **Database ORM**: SQLAlchemy 2.0
- **Background Tasks**: FastStream with Redis
- **OCR**: OCR.Space API / Pypdf

### Frontend (Next.js/React)
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Components**: shadcn/ui, Lucide Icons, Radix UI
- **Data Fetching**: React Query (@tanstack/react-query)
- **Authentication**: Better Auth with Drizzle ORM
- **Design**: Premium aesthetics with Geist Sans & Geist Mono

---

## 🚀 Getting Started

### Prerequisites
- Python 3.12+ (Using `uv` for dependency management)
- Node.js 18+
- PostgreSQL Database (with `pgvector` enabled)
- Redis Instance
- [Groq API Key](https://wow.groq.com/)
- [Hugging Face API Key](https://huggingface.co/)
- [OCR.Space API Key](https://ocr.space/ocrapi)

*Tip: You can quickly spin up PostgreSQL with pgvector and Redis using Docker:*
```bash
docker run -d --name pgvector -e POSTGRES_PASSWORD=pass -p 5432:5432 pgvector/pgvector:pg16
docker run -d --name redis -p 6379:6379 redis
```

### 1. Backend Setup
1. Navigate to the backend:
   ```bash
   cd backend
   ```
2. Create your environment variables file:
   ```bash
   cp .env.example .env
   ```
   *Fill in your API keys, database URL, and Redis URL in the `.env` file.*
3. Install dependencies using `uv`:
   ```bash
   uv sync
   ```
4. Start the backend development server:
   ```bash
   uv run fastapi dev app.py
   ```

### 2. Frontend Setup
1. Navigate to the frontend:
   ```bash
   cd frontend
   ```
2. Create your environment variables file:
   ```bash
   cp .env.example .env
   ```
   *Ensure you configure `DATABASE_URL`, Google OAuth keys (if used), and Better Auth secret.*
3. Install dependencies:
   ```bash
   npm install
   ```
4. Setup the database schema for authentication via Drizzle:
   ```bash
   npm run db:push
   ```
5. Start the Next.js development server:
   ```bash
   npm run dev
   ```

---

## ⚙️ Configuration

### Backend (`backend/.env`)
```env
POSTGRES_URL=postgresql+psycopg://user:pass@localhost:5432/postgres
REDIS_URL=redis://localhost:6379
HF_API_KEY=YOUR_HUGGING_FACE_ACCESS_TOKEN
GROQ_API_KEY=YOUR_GROQ_API_KEY
OCR_API_KEY=YOUR_OCR_API_KEY
```

### Frontend (`frontend/.env`)
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/postgres
DEV=true
GOOGLE_CLIENT_ID=YOUR_GOOGLE_OAUTH_ID
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_OAUTH_SECRET
BETTER_AUTH_URL=http://localhost:3000/
NEXT_PUBLIC_APP_URL=http://localhost:3000/
BETTER_AUTH_SECRET=YOUR_BETTER_AUTH_SECRET
BACKEND_URL=http://127.0.0.1:8000/
```

---

## 📂 Project Structure

- `backend/`: FastAPI application, AI agents, and file processing logic.
  - `Agents/`: The "brains"—Extraction and Grading agents.
  - `Database/`: SQLAlchemy models and Data Access Layers (DALs).
  - `FileProcessor/`: OCR and document parsing utilities.
  - `Grading/`: FastStream background tasks for evaluating student answers.
- `frontend/`: Next.js 16 App Router interface and Better Auth integration.
  - `app/`: Next.js routes and layouts.
  - `components/`: Reusable UI components powered by shadcn/ui.
  - `drizzle/`: Drizzle ORM schemas and migrations.
- `sample_data/`: Sample reference materials, rubrics, and student submissions for testing the system.

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 📧 Contact

**Project Link**: [https://github.com/Geoff-Robin/InkGrader](https://github.com/Geoff-Robin/InkGrader)