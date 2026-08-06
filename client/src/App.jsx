import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import ChatArea from "./components/ChatArea";
import SearchBar from "./components/SearchBar";
import Toast from "./components/Toast";

const FILES_STORAGE_KEY = "rag_uploaded_files";
const API_BASE_URL = "http://localhost:8000";

function App() {
  const [files, setFiles] = useState(() => {
    try {
      const saved = localStorage.getItem(FILES_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [activeId, setActiveId] = useState(null);
  const [toast, setToast] = useState(null); 
  const [attachment, setAttachment] = useState(null);
  useEffect(() => {
    try {
      localStorage.setItem(FILES_STORAGE_KEY, JSON.stringify(files));
    } catch (err) {
      console.error("Failed to save file list:", err);
    }
  }, [files]);

  // ---- Chat state ----
  // Each message: { id, role: "user" | "assistant", text }
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleNewChat = () => {
    setMessages([]);
    setActiveId(null); // reset scope back to "search all files" until a file is picked again
  };

  const handleSelectFile = (id) => {
    setActiveId(id);
  };

  // -------------------------------------------------------
  // PDF upload
  // -------------------------------------------------------
  const handleFileSelect = async (file) => {
    const fileEntry = { id: Date.now(), title: file.name, status: "uploading" };
    setFiles((prev) => [fileEntry, ...prev]);
    setActiveId(fileEntry.id);

    // Drive the square attachment chip above the search bar
    setAttachment({ id: fileEntry.id, name: file.name, status: "uploading" });

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || "Upload failed");
      }

      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileEntry.id
            ? { ...f, status: "ready", documentId: data.document_id }
            : f
        )
      );
      setAttachment((prev) =>
        prev && prev.id === fileEntry.id ? { ...prev, status: "ready" } : prev
      );
      setToast({ message: `"${file.name}" uploaded successfully`, type: "success" });
    } catch (err) {
      setFiles((prev) =>
        prev.map((f) => (f.id === fileEntry.id ? { ...f, status: "error" } : f))
      );
      setAttachment((prev) =>
        prev && prev.id === fileEntry.id ? { ...prev, status: "error" } : prev
      );
      setToast({ message: `Failed to upload "${file.name}"`, type: "error" });
      console.error("PDF upload error:", err);
    }
  };

  const handleRemoveAttachment = () => {
    setAttachment(null);
  };

  // -------------------------------------------------------
  // Chat query
  // -------------------------------------------------------
  const handleSearchSubmit = async (query) => {
    const userMessage = { id: Date.now(), role: "user", text: query };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setAttachment(null); 
    const activeFile = files.find((f) => f.id === activeId);
    const documentId = activeFile?.documentId;

    try {
      const response = await fetch(`${API_BASE_URL}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: query, document_id: documentId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Query failed");
      }

      const assistantMessage = {
        id: Date.now() + 1,
        role: "assistant",
        text: data.answer,
        sources: data.relevant_chunks || [],
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage = {
        id: Date.now() + 2,
        role: "assistant",
        text: "Something went wrong while fetching the answer. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
      console.error("RAG API error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex w-screen h-screen overflow-hidden">
      <Toast toast={toast} onDismiss={() => setToast(null)} />

      <Sidebar
        files={files}
        activeId={activeId}
        onSelect={handleSelectFile}
        onNewChat={handleNewChat}
      />

      <main className="flex-1 flex flex-col h-full bg-neutral-800">
        <ChatArea messages={messages} isLoading={isLoading} />
        <SearchBar
          onSubmit={handleSearchSubmit}
          onFileSelect={handleFileSelect}
          attachment={attachment}
          onRemoveAttachment={handleRemoveAttachment}
          disabled={isLoading}
        />
      </main>
    </div>
  );
}

export default App;