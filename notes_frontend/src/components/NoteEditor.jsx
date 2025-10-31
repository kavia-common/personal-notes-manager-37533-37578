import React, { useEffect, useState } from "react";

/**
 * NoteEditor allows editing the selected note.
 */
export default function NoteEditor({ note, onSave }) {
  const [title, setTitle] = useState(note?.title || "");
  const [content, setContent] = useState(note?.content || "");
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setTitle(note?.title || "");
    setContent(note?.content || "");
    setDirty(false);
  }, [note?.id]);

  const handleSave = () => {
    onSave({ title: title.trim(), content });
    setDirty(false);
  };

  if (!note) {
    return (
      <div className="note-editor empty">
        <div className="empty-state">
          <h3>Select or create a note</h3>
          <p>Choose a note from the list or create a new one to start editing.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="note-editor">
      <div className="note-editor__header">
        <input
          className="input title-input"
          placeholder="Note title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setDirty(true);
          }}
        />
        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={!dirty}
          title={dirty ? "Save changes" : "No changes to save"}
        >
          Save
        </button>
      </div>
      <textarea
        className="input content-input"
        placeholder="Write your note here..."
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          setDirty(true);
        }}
      />
    </div>
  );
}
