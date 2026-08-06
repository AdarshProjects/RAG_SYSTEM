import React, { useState, useRef } from "react";

function AttachmentChip({ attachment, onRemove }) {
  if (!attachment) return null;

  const { name, status } = attachment;

  return (
    <div className="relative w-16 h-16 rounded-xl bg-neutral-700 border border-neutral-600 flex flex-col items-center justify-center mb-2 shrink-0">
      {/* Remove button */}
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove attachment"
        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-neutral-900 border border-neutral-600 text-neutral-300 hover:text-white hover:bg-neutral-700 flex items-center justify-center text-xs leading-none"
      >
        ×
      </button>

      {/* PDF icon */}
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={status === "error" ? "text-red-400" : "text-red-400/90"}
      >
        <path
          d="M6 2h9l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path d="M15 2v5h5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <text x="12" y="17" textAnchor="middle" fontSize="6" fill="currentColor" fontWeight="700">
          PDF
        </text>
      </svg>

      {/* File name, truncated */}
      <span className="mt-1 w-14 text-center text-[10px] text-neutral-300 truncate px-1">
        {name}
      </span>

      {/* Uploading overlay spinner */}
      {status === "uploading" && (
        <div className="absolute inset-0 rounded-xl bg-neutral-900/70 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-neutral-500 border-t-emerald-400 rounded-full animate-spin" />
        </div>
      )}

      {/* Ready badge */}
      {status === "ready" && (
        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
            <path
              d="M20 6L9 17l-5-5"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}

      {/* Error badge */}
      {status === "error" && (
        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-white text-[10px] font-bold leading-none">
          !
        </div>
      )}
    </div>
  );
}
function SearchBar({
  onSubmit,
  onFileSelect,
  attachment = null,
  onRemoveAttachment,
  disabled = false,
}) {
  const [query, setQuery] = useState("");
  const [fileError, setFileError] = useState("");
  const fileInputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed || disabled) return;

    onSubmit(trimmed);
    setQuery("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      handleSubmit(e);
    }
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";

    if (!file) return;

    if (file.type !== "application/pdf") {
      setFileError("Only PDF files are supported.");
      setTimeout(() => setFileError(""), 3000);
      return;
    }

    setFileError("");
    onFileSelect(file);
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-6">
      {fileError && (
        <div className="text-sm text-red-400 mb-2 px-1">{fileError}</div>
      )}

      {/* Attachment preview sits above the input row, like ChatGPT's file chip */}
      {attachment && (
        <div className="flex px-1">
          <AttachmentChip attachment={attachment} onRemove={onRemoveAttachment} />
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="flex items-center bg-neutral-700 border border-neutral-600 rounded-2xl pl-2 pr-1.5 py-1.5 box-border"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="hidden"
        />

        <button
          type="button"
          onClick={handleAttachClick}
          disabled={disabled}
          aria-label="Attach PDF"
          className="w-10 h-10 min-w-10 rounded-xl flex items-center justify-center text-neutral-300 hover:bg-neutral-600 hover:text-neutral-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M21.44 11.05l-9.19 9.19a5.5 5.5 0 0 1-7.78-7.78l9.19-9.19a3.5 3.5 0 0 1 4.95 4.95l-9.2 9.19a1.5 1.5 0 0 1-2.12-2.12l8.49-8.48"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <input
          type="text"
          placeholder="Ask something about your documents..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className="flex-1 bg-transparent border-none outline-none text-neutral-100 text-[15px] py-3 px-2 placeholder-neutral-500 disabled:opacity-50"
        />

        <button
          type="submit"
          disabled={disabled || !query.trim()}
          aria-label="Search"
          className="w-11 h-11 min-w-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4 12H20M20 12L14 6M20 12L14 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </form>
    </div>
  );
}

export default SearchBar;