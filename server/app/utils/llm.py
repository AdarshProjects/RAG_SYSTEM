
from dotenv import load_dotenv
import os

from google import genai
from google.genai import types


load_dotenv()


api_key = os.getenv("gemini_api_key")

client = genai.Client(api_key=api_key)


# --------------------------------------------------
# Generate embeddings for document chunks
# --------------------------------------------------

def generate_embeddings(texts):

    response = client.models.embed_content(
        model="gemini-embedding-001",
        contents=texts,
        config=types.EmbedContentConfig(
            task_type="RETRIEVAL_DOCUMENT",
            output_dimensionality=384
        )
    )

    return [
        embedding.values
        for embedding in response.embeddings
    ]


# --------------------------------------------------
# Generate embedding for user question
# --------------------------------------------------

def generate_query_embedding(question):

    response = client.models.embed_content(
        model="gemini-embedding-001",
        contents=question,
        config=types.EmbedContentConfig(
            task_type="RETRIEVAL_QUERY",
            output_dimensionality=384
        )
    )

    return response.embeddings[0].values


# --------------------------------------------------
# Generate final answer
# --------------------------------------------------

def generate_answer(context, question):

    print("Reached generate_answer()")

    prompt = f"""
You are an AI assistant.

Answer the user's question ONLY using the provided context.

If the answer is not present in the context, say:
"I couldn't find this information in the uploaded document."

Context:
{context}

Question:
{question}
"""

    response = client.models.generate_content(
        model="gemini-3.5-flash-lite",
        contents=prompt
    )

    return response.text
