# 🧠 CodeMind-AI | RAG-Based Semantic Search System

A **Retrieval-Augmented Generation (RAG)** application that allows users to upload PDF documents and ask questions in natural language. The system retrieves semantically relevant information using **ChromaDB** and **Sentence Transformers**, then generates context-aware responses with **Google Gemini**.

---

## ✨ Features

- 📄 Upload and process PDF documents
- 🔍 Semantic search using vector embeddings
- 🤖 AI-powered question answering with Gemini
- ⚡ FastAPI backend for high-performance APIs
- 💬 Interactive React-based chat interface
- 🗂️ ChromaDB vector database for efficient retrieval
- 🔐 Secure API key management using `.env`

---

## 🛠️ Tech Stack

### Frontend
- React.js
- Vite
- CSS

### Backend
- FastAPI
- Python

### AI/ML
- Google Gemini
- Sentence Transformers
- ChromaDB

### Utilities
- PyMuPDF
- Python-dotenv

---

## 📁 Project Structure

```text
CODEMIND-AI
│
├── client
│   ├── public
│   ├── src
│   │   ├── Components
│   │   │   ├── ChatArea.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── Toast.jsx
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── server
│   ├── app
│   │   ├── chromaDB
│   │   ├── utils
│   │   │   └── llm.py
│   │   └── main.py
│   ├── .env
│   ├── requirements.txt
│   └── .gitignore
│
└── README.md
```

---

## ⚙️ Workflow

```text
           PDF Upload
                │
                ▼
        Text Extraction
                │
                ▼
      Document Chunking
                │
                ▼
 Sentence Transformer Embeddings
                │
                ▼
      ChromaDB Vector Store
                │
                ▼
           User Query
                │
                ▼
       Similarity Retrieval
                │
                ▼
      Relevant Context + Query
                │
                ▼
         Google Gemini LLM
                │
                ▼
      Context-Aware Response
```

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/CODEMIND-AI.git
cd CODEMIND-AI
```

---

### 2. Backend Setup

```bash
cd server

python -m venv venv
```

Activate the virtual environment.

**Windows**

```bash
venv\Scripts\activate
```

**Linux/macOS**

```bash
source venv/bin/activate
```

Install dependencies.

```bash
pip install -r requirements.txt
```

Create a `.env` file.

```env
GEMINI_API_KEY=your_api_key_here
```

Run the backend.

```bash
uvicorn app.main:app --reload
```

---

### 3. Frontend Setup

```bash
cd client

npm install

npm run dev
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|----------|-----------|-------------|
| POST | `/upload` | Upload PDF document |
| POST | `/ask` | Ask questions from uploaded documents |

---

## 🎯 Future Enhancements

- Multi-document support
- Chat history
- Source citations
- Streaming AI responses
- Authentication
- LangGraph-based multi-agent workflow
- Hybrid keyword + semantic retrieval
- Confidence scoring



## 👨‍💻 Author

**Adarsh Kumar**

If you found this project helpful, don't forget to ⭐ the repository!