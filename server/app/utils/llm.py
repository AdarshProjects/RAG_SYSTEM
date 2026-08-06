from dotenv import load_dotenv
import os
load_dotenv()
from google import genai
api_key = os.getenv("gemini_api_key")

client = genai.Client(api_key=api_key)

def generate_answer(context, question):

    prompt = f"""
You are an AI assistant. You have the context info now simply you have to answer the question based on the context. 


Answer the user's question ONLY using the provided context.
If the answer is not present in the context, say:
"I couldn't find this information in the uploaded document."

Context:
{context}

print("reached in llmpy")

Question:
{question}
"""

    response = client.models.generate_content(
        model="gemini-3.5-flash-lite",
        contents=prompt
    )

    return response.text