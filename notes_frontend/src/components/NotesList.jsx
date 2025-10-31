import React from "react";

/**
 * PUBLIC_INTERFACE
 * NotesList renders a vertical list of notes with selection and delete support.
 */
export default function NotesList({
  notes,
  selectedId,
  onSelect,
  onCreate,
  onDelete
}) {
  return (
    <div className="notes-list">
      <div className="notes-list__header">
        <h2>Notes</h2>
        <button className="btn btn-primary" onClick={typeof onCreate === "function" ? onCreate : undefined}>
          + New Note
        </button>
      </div>
      <ul className="notes-list__items">
        {notes.map((n) => (
          <li
            key={n.id}
            className={`notes-list__item ${selectedId === n.id ? "active" : ""}`}
            onClick={() => onSelect(n)}
          >
            <div className="notes-list__item-title">{n.title || "Untitled"}</div>
            <div className="notes-list__item-meta">
              {n.updated_at ? new Date(n.updated_at).toLocaleString() : ""}
            </div>
            <button
              className="icon-btn danger"
              title="Delete"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(n);
              }}
            >
              🗑
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
