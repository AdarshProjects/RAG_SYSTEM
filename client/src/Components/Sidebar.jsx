import React from "react";

/**
 * Status badge shown next to each file in the sidebar.
 */
function StatusBadge({ status }) {
  if (status === "uploading") {
    return (
      <span className="inline-block w-2 h-2 rounded-full bg-yellow-400 animate-pulse shrink-0" />
    );
  }
  if (status === "error") {
    return <span className="inline-block w-2 h-2 rounded-full bg-red-500 shrink-0" />;
  }
  // "ready" or undefined (older items without a status)
  return <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 shrink-0" />;
}

function Sidebar({ files = [], activeId, onSelect, onNewChat }) {
  return (
    <aside className="w-65 min-w-65 h-full bg-neutral-900 border-r border-neutral-700 flex flex-col p-3 box-border">
      <button
        onClick={onNewChat}
        className="text-left text-sm text-neutral-100 border border-neutral-700 rounded-lg px-3 py-2.5 mb-4 hover:bg-neutral-800 transition-colors"
      >
        + New Chat
      </button>

      <div className="text-xs uppercase tracking-wide text-neutral-500 px-2 mb-1">
        Previous Files
      </div>

      <ul className="flex-1 overflow-y-auto list-none m-0 p-0 space-y-0.5">
        {files.length === 0 && (
          <li className="px-3 py-2.5 text-sm italic text-neutral-500">
            No files uploaded yet
          </li>
        )}

        {files.map((item) => (
          <li
            key={item.id}
            onClick={() => onSelect(item.id)}
            title={item.title}
            className={
              "flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm cursor-pointer transition-colors " +
              (item.id === activeId
                ? "bg-neutral-700 text-neutral-100"
                : "text-neutral-300 hover:bg-neutral-800 hover:text-neutral-100")
            }
          >
            <StatusBadge status={item.status} />
            <span className="truncate">{item.title}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default Sidebar;