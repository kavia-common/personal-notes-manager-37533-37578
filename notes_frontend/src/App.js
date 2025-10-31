import React, { useEffect, useMemo, useState } from "react";
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

// PUBLIC_INTERFACE
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
   * Creates a new note with default title "Untitled", persists it, selects it, and updates the list.
   */
  const handleCreate = async () => {
    try {
      const newNote = await createNote({ title: "Untitled", content: "" });
      setNotes((n) => [newNote, ...n]);
      setSelected(newNote);
      addToast({ type: "success", message: "New note created." });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Failed to create note", e);
      addToast({
        type: "error",
        message: "Couldn't create note on server. Opening a local draft."
      });
      // Fallback: open an empty editor to avoid dead-end UX
      const localDraft = {
        id: undefined,
        title: "Untitled",
        content: "",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        // Mark as transient so future logic could handle this differently if needed
        _transient: true
      };
      setSelected(localDraft);
      // Don't add to notes list since it wasn't created server-side
    }
  };

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
    if (!selected.id) {
      addToast({
        type: "error",
        message: "This is a local draft. Create a new note first to save to server."
      });
      return;
    }
    try {
      const updated = await updateNote(selected.id, patch);
      setNotes((all) => {
        const others = all.filter((n) => n.id !== updated.id);
        return [updated, ...others].sort(
          (a, b) => new Date(b.updated_at) - new Date(a.updated_at)
        );
      });
      setSelected(updated);
      addToast({ type: "success", message: "Note saved." });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Failed to save note", e);
      addToast({ type: "error", message: "Failed to save note." });
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
