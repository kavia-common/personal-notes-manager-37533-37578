import React from "react";

/**
 * PUBLIC_INTERFACE
 * Simple empty state with CTA.
 */
export default function EmptyState({ title = "No notes yet", action, onAction }) {
  return (
    <div className="empty-state">
      <h3>{title}</h3>
      <p>Create your first note to get started.</p>
      {action ? (
        <button className="btn btn-primary" onClick={onAction}>
          {action}
        </button>
      ) : null}
    </div>
  );
}
