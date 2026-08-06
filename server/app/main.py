from fastapi import FastAPI, UploadFile, File
from pypdf import PdfReader
from langchain_text_splitters import RecursiveCharacterTextSplitter 
from sentence_transformers import SentenceTransformer
from chromaDB.db import collection
from utils.llm import generate_answer
import uuid
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

class QuestionRequest(BaseModel):
    question: str
    document_id: str | None = None  # Optional field for document ID

#load a pertrained sentence Transformer model
model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
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

    # Extract text from PDF
    fulltext = ""

    reader = PdfReader(file.file)

    for page in reader.pages:
        fulltext += page.extract_text()

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

    # print(f"Text Length   : {text_length}")
    # print(f"Chunk Size    : {chunk_size}")
    # print(f"Chunk Overlap : {chunk_overlap}")

    # Create text splitter
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap
    )

    chunks = text_splitter.split_text(fulltext)

    try:
      embeddings = model.encode(chunks) 
    except Exception as e:
        return {"error": f"Error generating embeddings: {str(e)}"}

   # Generate one unique document ID for this uploaded PDF
    document_id = str(uuid.uuid4())[:8]

    # ADDING METADATA CONTENT TO THE EMBEDDINGS
    ids = []
    metadatas = []

    for i, chunk in enumerate(chunks):

        # Create a unique ID for each chunk
        chunk_id = f"{document_id}_chunk_{i}"
        ids.append(chunk_id)

        # Create metadata for each chunk
        metadatas.append({
            "document_id": document_id,
            "filename": file.filename,
            "chunk_number": i
        })

    print(ids)
    print(metadatas)

    collection.add(
        documents=chunks,
        embeddings=embeddings.tolist(),
        metadatas=metadatas,
        ids=ids
    )

    print(f"Total Records: {collection.count()}")
    print(collection.peek())

    if not file.filename.endswith(('.pdf')):
        return {"error": "Only PDF files are allowed"}
    return {
        "message": "File uploaded successfully",
        "filename": file.filename,
        "document_id": document_id,
        "filecontent": fulltext,
        "chunks": chunks,
        "chunk_embeddings": embeddings.tolist()
    }  

@app.post("/ask")
async def ask_question(request: QuestionRequest):
    question = request.question
    question_embedding = model.encode([question])

    query_kwargs = {
        "query_embeddings": question_embedding.tolist(),
        "n_results": 5,
    }
    if request.document_id:
        query_kwargs["where"] = {"document_id": request.document_id}

    results = collection.query(**query_kwargs)
    # ...rest stays exactly the same

    relevant_chunks = []

    for i in range(len(results["ids"][0])):
        relevant_chunks.append({
            "chunk_id": results["ids"][0][i],
            "text": results["documents"][0][i],
            "filename": results["metadatas"][0][i]["filename"],
            "chunk_number": results["metadatas"][0][i]["chunk_number"],
            "distance": results["distances"][0][i]
        })


    context = "\n\n".join(results["documents"][0])
    answer = generate_answer(context, question)

    print(f"Answer: {answer}")

    return {
        "question": question,
        "answer": answer,
        "relevant_chunks": relevant_chunks
    }