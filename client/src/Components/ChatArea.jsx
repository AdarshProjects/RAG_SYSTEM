import React from "react";
function Sources({ sources }) {
  if (!sources || sources.length === 0) return null;

  return (
    <details className="mt-2 group">
      <summary className="cursor-pointer list-none text-xs text-neutral-400 hover:text-neutral-200 inline-flex items-center gap-1">
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          className="transition-transform group-open:rotate-90"
        >
          <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {sources.length} source{sources.length > 1 ? "s" : ""}
      </summary>

      <div className="mt-2 flex flex-col gap-2">
        {sources.map((src) => (
          <div
            key={src.chunk_id}
            className="text-xs bg-neutral-800 border border-neutral-600 rounded-lg px-3 py-2"
          >
            <div className="flex items-center justify-between text-neutral-400 mb-1">
              <span className="truncate font-medium text-neutral-300">
                {src.filename} · chunk {src.chunk_number}
              </span>
              {typeof src.distance === "number" && (
                <span className="shrink-0 ml-2">score {src.distance.toFixed(3)}</span>
              )}
            </div>
            <p className="text-neutral-400 line-clamp-3">{src.text}</p>
          </div>
        ))}
      </div>
    </details>
  );
}

//chatarea
function ChatArea({ messages = [], isLoading = false }) {
  const isEmpty = messages.length === 0;

  return (
    <div className="flex-1 h-full overflow-y-auto flex flex-col items-center px-6 py-10 box-border">
      {isEmpty ? (
        <div className="m-auto text-center text-neutral-300">
          <h1 className="text-2xl font-semibold text-neutral-100 mb-2">
            Welcome to the site
          </h1>
          <p className="text-base text-neutral-500">
            Ask a question about your documents to get started.
          </p>
        </div>
      ) : (
        <div className="w-full max-w-2xl flex flex-col gap-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={
                "px-4 py-3.5 rounded-xl max-w-[85%] leading-relaxed text-[15px] whitespace-pre-wrap " +
                (msg.role === "user"
                  ? "self-end bg-emerald-600 text-white"
                  : "self-start bg-neutral-700 text-neutral-100 border border-neutral-600")
              }
            >
              <div className="text-[11px] uppercase tracking-wide opacity-60 mb-1">
                {msg.role === "user" ? "You" : "Assistant"}
              </div>
              <div>{msg.text}</div>

              {msg.role === "assistant" && <Sources sources={msg.sources} />}
            </div>
          ))}

          {isLoading && (
            <div className="self-start bg-neutral-700 text-neutral-100 border border-neutral-600 px-4 py-3.5 rounded-xl max-w-[85%]">
              <div className="text-[11px] uppercase tracking-wide opacity-60 mb-1">
                Assistant
              </div>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce" />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ChatArea;