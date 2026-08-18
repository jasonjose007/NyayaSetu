import os
import google.generativeai as genai
import chromadb
from chromadb import Documents, EmbeddingFunction, Embeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from app.config import CHROMA_PERSIST_DIR, KNOWLEDGE_DIR, GEMINI_API_KEY

genai.configure(api_key=GEMINI_API_KEY)


class GeminiEmbeddingFunction(EmbeddingFunction):
    def __call__(self, input: Documents) -> Embeddings:
        embeddings = []
        for text in input:
            result = genai.embed_content(
                model="models/gemini-embedding-001",
                content=text,
                task_type="retrieval_document",
            )
            embeddings.append(result["embedding"])
        return embeddings


def get_embedding_function():
    return GeminiEmbeddingFunction()


def get_chroma_client():
    return chromadb.PersistentClient(path=CHROMA_PERSIST_DIR)


def get_or_create_collection(client):
    return client.get_or_create_collection(
        name="legal_knowledge",
        metadata={"hnsw:space": "cosine"},
        embedding_function=get_embedding_function(),
    )


def ingest_documents():
    client = get_chroma_client()
    collection = get_or_create_collection(client)

    if collection.count() > 0:
        print(f"Collection already has {collection.count()} documents. Skipping ingestion.")
        return collection

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        separators=["\n\n", "\n", ". ", " ", ""],
    )

    documents = []
    metadatas = []
    ids = []
    doc_id = 0

    for filename in os.listdir(KNOWLEDGE_DIR):
        if not filename.endswith(".txt"):
            continue

        filepath = os.path.join(KNOWLEDGE_DIR, filename)
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()

        chunks = splitter.split_text(content)
        category = filename.replace(".txt", "").replace("_", " ").title()

        for chunk in chunks:
            documents.append(chunk)
            metadatas.append({"source": filename, "category": category})
            ids.append(f"doc_{doc_id}")
            doc_id += 1

    if documents:
        batch_size = 50
        for i in range(0, len(documents), batch_size):
            batch_end = min(i + batch_size, len(documents))
            collection.add(
                documents=documents[i:batch_end],
                metadatas=metadatas[i:batch_end],
                ids=ids[i:batch_end],
            )
            print(f"  Ingested batch {i//batch_size + 1}...")

    print(f"Ingested {len(documents)} chunks from knowledge base.")
    return collection


def query_knowledge(query: str, n_results: int = 5) -> list[dict]:
    client = get_chroma_client()
    collection = get_or_create_collection(client)

    if collection.count() == 0:
        ingest_documents()

    results = collection.query(query_texts=[query], n_results=n_results)

    formatted = []
    for i in range(len(results["documents"][0])):
        formatted.append({
            "content": results["documents"][0][i],
            "source": results["metadatas"][0][i]["source"],
            "category": results["metadatas"][0][i]["category"],
            "distance": results["distances"][0][i] if results.get("distances") else None,
        })

    return formatted
