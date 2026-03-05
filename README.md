# InkGrader 🖋️

**InkGrader** is a state-of-the-art, AI-powered grading system designed to automate the evaluation of handwritten documents. By combining advanced OCR (Optical Character Recognition) with intelligent multi-agent systems and RAG (Retrieval-Augmented Generation), InkGrader provides an unparalleled experience for automated grading and assessment management.

---

## ✨ Features

- **📷 Intelligent OCR Extraction**: High-accuracy extraction of handwritten text from scans and PDFs using multi-engine OCR strategies.
- **🤖 Multi-Agent AI System**: 
  - **Extraction Agent**: Seamlessly parses raw OCR text into structured question/answer formats.
  - **Grading Agent**: Evaluates student responses based on context, accuracy, and provided reference materials.
- **📚 RAG-Enhanced Evaluation**: Powered by PostgreSQL `pgvector`, the system cross-references student answers with official marking schemes for highly accurate grading.
- **⚡ Background Processing**: Leverages FastStream and Redis to handle grading tasks asynchronously in the background.
- **📊 Modern Dashboard**: A premium Next.js 15 dashboard for managing exams, uploading student work, and viewing detailed feedback.
- **🔐 Enterprise-Grade Auth**: Secure authentication flow utilizing **Better Auth** with Drizzle ORM and PostgreSQL.

---

## 🛠️ Technology Stack

### Backend (Python/FastAPI)
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Asynchronous high-performance API)
- **AI/LLM**: [Groq API](https://wow.groq.com/), Hugging Face Inference API for embeddings
- **Vector Search**: PostgreSQL `pgvector` extension
- **Database**: PostgreSQL (via SQLAlchemy)
- **Background Tasks**: FastStream with Redis
- **OCR**: OCR.Space API / Pypdf

### Frontend (Next.js/React)
- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Components**: shadcn/ui, Lucide Icons, Radix UI
- **Data Fetching**: React Query (@tanstack/react-query)
- **Authentication**: Better Auth with Drizzle ORM
- **Design**: Premium aesthetics with Geist Sans & Geist Mono

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL Database (with `pgvector` enabled)
- Redis Instance
- [Groq API Key](https://wow.groq.com/)
- [Hugging Face API Key](https://huggingface.co/)
- [OCR.Space API Key](https://ocr.space/ocrapi)

### 1. Backend Setup
1. Navigate to the backend:
   ```bash
   cd backend
   ```
2. Setup environment:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # Windows: .venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure `.env` (refer to [Configuration](#configuration)).
5. Start the server (using Docker is recommended):
   ```bash
   docker-compose up
   ```
   Or run the app locally:
   ```bash
   python app.py
   ```

### 2. Frontend Setup
1. Navigate to the frontend:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Setup the database schema for authentication:
   ```bash
   npm run db:push
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

---

## ⚙️ Configuration

Create a `.env` file in the project directories:

### Backend (`backend/.env`)
```env
POSTGRES_URL=postgresql+psycopg://user:pass@localhost/db

# API Keys
GROQ_API_KEY=your_groq_key
OCR_API_KEY=your_ocr_key
HF_API_KEY=your_hf_key

# Redis
REDIS_URL=redis://localhost:6379

# Frontend Callback
FRONTEND_URL=http://localhost:3000
```

### Frontend (`frontend/.env.local`)
```env
BETTER_AUTH_SECRET=your_secret_key
BETTER_AUTH_URL=http://localhost:3000
DATABASE_URL=postgresql://user:pass@localhost/db
BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL = http://localhost:3000
GOOGLE_CLIENT_ID = YOUR_GOOGLE_OAUTH_ID
GOOGLE_CLIENT_SECRET = YOUR GOOGLE_OAUTH_SECRET
```

---

## 📂 Project Structure

- `backend/`: FastAPI application, AI agents, and file processing logic.
- `frontend/`: Next.js 15 dashboard and user interface.
- `backend/Agents/`: The "brains"—Extraction and Grading agents.
- `backend/FileProcessor/`: OCR and document parsing utilities.


## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 📧 Contact

**Project Lead**: [Geoff-Robin]
**Project Link**: [https://github.com/Geoff-Robin/InkGrader](https://github.com/Geoff-Robin/InkGrader)
