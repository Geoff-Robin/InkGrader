# InkGrader 🖋️

**InkGrader** is a state-of-the-art, AI-powered grading system designed to automate the evaluation of handwritten documents. By combining advanced OCR (Optical Character Recognition) with intelligent multi-agent systems and RAG (Retrieval-Augmented Generation), InkGrader provides an unparalleled experience for automated grading and assessment management.

---

## ✨ Features

- **📷 Intelligent OCR Extraction**: High-accuracy extraction of handwritten text from scans and PDFs using multi-engine OCR strategies.
- **🤖 Multi-Agent AI System**: 
  - **Extraction Agent**: Seamlessly parses raw OCR text into structured question/answer formats.
  - **Grading Agent**: Evaluates student responses based on context, accuracy, and provided reference materials.
- **📚 RAG-Enhanced Evaluation**: Powered by FAISS and OpenVINO, the system cross-references student answers with official marking schemes for highly accurate grading.
- **⚡ Real-time Updates**: Track the grading process in real-time via WebSockets as the agents work through batches of documents.
- **📊 Modern Dashboard**: A premium Next.js 15 dashboard for managing exams, uploading student work, and viewing detailed feedback.
- **🔐 Enterprise-Grade Auth**: Secure authentication flow with JWT (Access & Refresh tokens) and MongoDB storage.

---

## 🛠️ Technology Stack

### Backend (Python/FastAPI)
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Asynchronous high-performance API)
- **AI/LLM**: [PydanticAI](https://github.com/pydantic/pydantic-ai), Groq (LLM Inference), Sentence-Transformers
- **Vector Search**: [FAISS](https://github.com/facebookresearch/faiss) with [OpenVINO](https://www.intel.com/content/www/us/en/developer/tools/openvino-toolkit/overview.html) optimization
- **Database**: MongoDB (Async Motor driver)
- **Streaming**: Redis Streams for background task coordination
- **OCR**: OCR.Space API / Pypdf

### Frontend (Next.js/React)
- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/)
- **Components**: Radix UI, Lucide Icons
- **Fetching**: Axios with interceptors for auth management
- **Design**: Premium aesthetics with Geist Sans & Geist Mono

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- MongoDB Instance (Atlas)
- Redis Instance
- [Groq API Key](https://wow.groq.com/)
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
4. Configure `.env` (refer to [Configuration](#configuration)):
5. Start the server:
   ```bash
   python app.py
   ```

### 2. Frontend Setup
1. Navigate to the frontend:
   ```bash
   cd frontend_next_js
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

---

## ⚙️ Configuration

Create a `.env` file in the `backend/` directory:

```env
# Database
MONGO_DB_USERNAME=your_username
MONGO_DB_PASSWORD=your_password

# Authentication
JWT_SECRET_KEY=your_secret_key
JWT_REFRESH_SECRET_KEY=your_refresh_key

# AI & OCR
GROQ_API_KEY=your_groq_key
OCR_API_KEY=your_ocr_key

# Redis
REDIS_URL=localhost
REDIS_PORT=6379
REDIS_PASSWORD=default
```

---

## 📂 Project Structure

- `backend/`: FastAPI application, AI agents, and file processing logic.
- `frontend_next_js/`: Next.js 15 dashboard and user interface.
- `backend/Agents/`: The "brains"—Extraction and Grading agents.
- `backend/FileProcessor/`: OCR and document parsing utilities.

---

## 🤝 Contributing

Contributions make the open-source community an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 📧 Contact

**Project Lead**: [Your Name/Github]
**Project Link**: [https://github.com/Geoff-Robin/InkGrader](https://github.com/Geoff-Robin/InkGrader)
