from fastapi import FastAPI, UploadFile, File
from pypdf import PdfReader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from app.chromaDB.db import collection
from app.utils.llm import generate_answer, generate_embeddings, generate_query_embedding
import uuid
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


class QuestionRequest(BaseModel):
    question: str
    document_id: str | None = None


app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    print("CodeMind AI Running")
    return {"message": "CodeMind AI Running"}


@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):

    # Check file type before processing
    if not file.filename.lower().endswith(".pdf"):
        return {"error": "Only PDF files are allowed"}

    # Extract text from PDF
    fulltext = ""

    reader = PdfReader(file.file)

    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            fulltext += page_text

    # Calculate text length
    text_length = len(fulltext)

    # Target approximately 30 chunks
    target_chunks = 30

    # Calculate dynamic chunk size
    chunk_size = text_length // target_chunks

    # Keep chunk size within limits
    chunk_size = max(500, min(chunk_size, 2000))

    # Overlap = 20% of chunk size
    chunk_overlap = chunk_size // 5

    # Create text splitter
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap
    )

    chunks = text_splitter.split_text(fulltext)

    # Generate embeddings using Gemini API
    try:
        embeddings = generate_embeddings(chunks)
    except Exception as e:
        return {
            "error": f"Error generating embeddings: {str(e)}"
        }

    # Generate one unique document ID
    document_id = str(uuid.uuid4())[:8]

    # Add metadata to embeddings
    ids = []
    metadatas = []

    for i, chunk in enumerate(chunks):

        chunk_id = f"{document_id}_chunk_{i}"

        ids.append(chunk_id)

        metadatas.append({
            "document_id": document_id,
            "filename": file.filename,
            "chunk_number": i
        })

    print(ids)
    print(metadatas)

    # Store chunks + embeddings in ChromaDB
    collection.add(
        documents=chunks,
        embeddings=embeddings,
        metadatas=metadatas,
        ids=ids
    )

    print(f"Total Records: {collection.count()}")
    print(collection.peek())

    return {
        "message": "File uploaded successfully",
        "filename": file.filename,
        "document_id": document_id,
        "filecontent": fulltext,
        "chunks": chunks,
        "chunk_embeddings": embeddings
    }


@app.post("/ask")
async def ask_question(request: QuestionRequest):

    question = request.question

    # Generate embedding for the user's question
    try:
        question_embedding = generate_query_embedding(question)
    except Exception as e:
        return {
            "error": f"Error generating question embedding: {str(e)}"
        }

    query_kwargs = {
        "query_embeddings": [question_embedding],
        "n_results": 5,
    }

    if request.document_id:
        query_kwargs["where"] = {
            "document_id": request.document_id
        }

    # Search ChromaDB
    results = collection.query(**query_kwargs)

    relevant_chunks = []

    for i in range(len(results["ids"][0])):
        relevant_chunks.append({
            "chunk_id": results["ids"][0][i],
            "text": results["documents"][0][i],
            "filename": results["metadatas"][0][i]["filename"],
            "chunk_number": results["metadatas"][0][i]["chunk_number"],
            "distance": results["distances"][0][i]
        })

    # Combine retrieved chunks as context
    context = "\n\n".join(results["documents"][0])

    # Generate final answer using Gemini
    answer = generate_answer(context, question)

    print(f"Answer: {answer}")

    return {
        "question": question,
        "answer": answer,
        "relevant_chunks": relevant_chunks
    }
