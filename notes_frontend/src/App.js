import React, { useEffect, useMemo, useState, useCallback } from "react";
import "./App.css";
import "./index.css";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import NotesList from "./components/NotesList";
import NoteEditor from "./components/NoteEditor";
import EmptyState from "./components/EmptyState";
import AuthGate from "./components/AuthGate";
import { createNote, deleteNote, listNotes, updateNote } from "./services/notesService";
import { useToast } from "./components/Toast";

/**
 * PUBLIC_INTERFACE
 * App
 * Main application component. Handles:
 * - Loading notes from Supabase
 * - Creating local drafts with temporary ids and reconciling them to server ids after insert
 * - Saving updates, deleting notes
 * - Theming and toasts
 */
function App() {
  const [theme, setTheme] = useState("light");
  const [notes, setNotes] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const isEmpty = useMemo(() => !loading && notes.length === 0, [loading, notes]);
  const { addToast } = useToast();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    // Initial load of notes
    (async () => {
      try {
        setLoading(true);
        const data = await listNotes();
        setNotes(data);
        setSelected((prev) => {
          if (!prev) return data[0] || null;
          const stillExists = data.find((n) => n.id === prev.id);
          return stillExists || data[0] || null;
        });
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("Failed to load notes", e);
        addToast({ type: "error", message: "Failed to load notes. Please check your connection." });
      } finally {
        setLoading(false);
      }
    })();
  }, [addToast]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  /**
   * PUBLIC_INTERFACE
   * handleCreate
   * Creates a local draft immediately with a temporary id, selects it, then attempts to save to Supabase in the background.
   * On success, reconciles the temporary note with the server note (replacing temp id and updating state).
   * On failure, keeps the local draft marked as unsaved for manual retry.
   */
  const handleCreate = useCallback(async () => {
    // Generate a client id for the local draft
    const tempId = `local-${Math.random().toString(36).slice(2)}`;
    const nowIso = new Date().toISOString();
    const tempNote = {
      id: tempId,
      title: "Untitled",
      content: "",
      created_at: nowIso,
      updated_at: nowIso,
      _localOnly: true, // local draft flag
      _status: "unsaved" // for UI
    };

    // Insert temp note at top, select it immediately (defensive if array empty)
    setNotes((prev) => [tempNote, ...(prev || [])]);
    setSelected(tempNote);

    // Attempt to persist in background
    try {
      const serverNote = await createNote({ title: tempNote.title, content: tempNote.content });
      // Reconcile: replace temp note with server note
      setNotes((prev) => {
        const others = (prev || []).filter((n) => n.id !== tempId);
        return [serverNote, ...others].sort(
          (a, b) => new Date(b.updated_at) - new Date(a.updated_at)
        );
      });
      // If the temp was still selected, move selection to the real one
      setSelected((cur) => {
        if (!cur) return serverNote;
        return cur.id === tempId ? serverNote : cur;
      });
      addToast({ type: "success", message: "New note created." });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Failed to create note", e);
      addToast({
        type: "error",
        message: `Couldn't save new note to server${e?.message ? `: ${e.message}` : ""}. Working on a local draft.`
      });
      // Keep local draft; ensure flags are set
      setNotes((prev) =>
        (prev || []).map((n) =>
          n.id === tempId ? { ...n, _localOnly: true, _status: "unsaved" } : n
        )
      );
      setSelected((cur) => {
        if (!cur) return tempNote;
        return cur.id === tempId ? { ...tempNote, _localOnly: true, _status: "unsaved" } : cur;
        });
    }
  }, [addToast]);

  const handleDelete = async (note) => {
    if (!note?.id) {
      addToast({ type: "error", message: "Cannot delete an unsaved draft." });
      return;
    }
    try {
      await deleteNote(note.id);
      setNotes((n) => n.filter((x) => x.id !== note.id));
      setSelected((current) => {
        if (!current || current.id !== note.id) return current;
        return null;
      });
      addToast({ type: "success", message: "Note deleted." });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Failed to delete note", e);
      addToast({ type: "error", message: "Failed to delete note." });
    }
  };

  const handleSave = async (patch) => {
    if (!selected) return;

    // If selected is a local draft (unsaved), attempt a create to the server first
    if (selected._localOnly || (typeof selected.id === "string" && selected.id.startsWith("local-"))) {
      const tempId = selected.id || `local-${Math.random().toString(36).slice(2)}`;
      const payload = {
        title: (patch?.title ?? selected.title ?? "").trim(),
        content: patch?.content ?? selected.content ?? ""
      };
      try {
        const serverNote = await createNote(payload);
        // Reconcile: replace temp with server note
        setNotes((prev) => {
          const list = (prev || []).filter((n) => n.id !== tempId);
          return [serverNote, ...list].sort(
            (a, b) => new Date(b.updated_at) - new Date(a.updated_at)
          );
        });
        setSelected(serverNote);
        addToast({ type: "success", message: "Draft saved to server." });
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("Failed to save local draft", e);
        addToast({ type: "error", message: `Failed to save draft${e?.message ? `: ${e.message}` : ""}. Please retry.` });
        // Keep it marked as unsaved
        setNotes((prev) =>
          (prev || []).map((n) =>
            n.id === tempId ? { ...n, _localOnly: true, _status: "unsaved" } : n
          )
        );
      }
      return;
    }

    // Regular update for persisted notes
    try {
      const updated = await updateNote(selected.id, {
        title: (patch?.title ?? selected.title ?? "").trim(),
        content: patch?.content ?? selected.content ?? ""
      });
      setNotes((all) => {
        const others = (all || []).filter((n) => n.id !== updated.id);
        return [updated, ...others].sort(
          (a, b) => new Date(b.updated_at) - new Date(a.updated_at)
        );
      });
      setSelected(updated);
      addToast({ type: "success", message: "Note saved." });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Failed to save note", e);
      addToast({ type: "error", message: `Failed to save note${e?.message ? `: ${e.message}` : ""}.` });
    }
  };

  return (
    <AuthGate>
      <div className="app-root">
        <Navbar
          onCreate={handleCreate}
          right={
            <button className="theme-toggle" onClick={toggleTheme}>
              {theme === "light" ? "🌙 Dark" : "☀️ Light"}
            </button>
          }
        />
        <div className="app-layout">
          <Sidebar>
            <div className="sidebar__section">
              <div className="sidebar__title">Navigation</div>
              <div className="sidebar__links">
                <span className="sidebar__link active">All Notes</span>
              </div>
            </div>
          </Sidebar>
          <main className="content">
            <section className="panel">
              {loading ? (
                <div className="loading">Loading notes...</div>
              ) : isEmpty ? (
                <EmptyState action="+ New Note" onAction={handleCreate} />
              ) : (
                <NotesList
                  notes={notes}
                  selectedId={selected?.id}
                  onSelect={setSelected}
                  onCreate={handleCreate}
                  onDelete={handleDelete}
                />
              )}
            </section>
            <section className="panel panel-grow">
              <NoteEditor note={selected} onSave={handleSave} />
            </section>
          </main>
        </div>
      </div>
    </AuthGate>
  );
}

export default App;
