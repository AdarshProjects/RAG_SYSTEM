import React, { useEffect } from "react";

function Toast({ toast, onDismiss }) {
  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      onDismiss();
    }, 3500);

    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  const { message, type } = toast;
  const isError = type === "error";

  return (
    <div className="fixed top-5 right-5 z-50">
      <div
        className={
          "flex items-center gap-3 rounded-xl border px-4 py-3 shadow-lg max-w-sm " +
          (isError
            ? "bg-red-950 border-red-800 text-red-200"
            : "bg-neutral-800 border-emerald-700 text-neutral-100")
        }
      >
        {/* Icon */}
        {isError ? (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            className="shrink-0 text-red-400"
          >
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            <path
              d="M12 8v5M12 16h.01"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            className="shrink-0 text-emerald-400"
          >
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            <path
              d="M8 12l3 3 5-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}

        <span className="text-sm flex-1">{message}</span>

        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="text-lg leading-none opacity-60 hover:opacity-100 transition-opacity"
        >
          ×
        </button>
      </div>
    </div>
  );
}

export default Toast;