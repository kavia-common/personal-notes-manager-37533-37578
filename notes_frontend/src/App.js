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

// PUBLIC_INTERFACE
function App() {
  const [theme, setTheme] = useState("light");
  const [notes, setNotes] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const isEmpty = useMemo(() => !loading && notes.length === 0, [loading, notes]);

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
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  const handleCreate = async () => {
    try {
      const newNote = await createNote({ title: "New Note", content: "" });
      setNotes((n) => [newNote, ...n]);
      setSelected(newNote);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Failed to create note", e);
    }
  };

  const handleDelete = async (note) => {
    if (!note?.id) return;
    try {
      await deleteNote(note.id);
      setNotes((n) => n.filter((x) => x.id !== note.id));
      setSelected((current) => {
        if (!current || current.id !== note.id) return current;
        return null;
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Failed to delete note", e);
    }
  };

  const handleSave = async (patch) => {
    if (!selected) return;
    try {
      const updated = await updateNote(selected.id, patch);
      setNotes((all) => {
        const others = all.filter((n) => n.id !== updated.id);
        return [updated, ...others].sort(
          (a, b) => new Date(b.updated_at) - new Date(a.updated_at)
        );
      });
      setSelected(updated);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Failed to save note", e);
    }
  };

  return (
    <AuthGate>
      <div className="app-root">
        <Navbar
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
