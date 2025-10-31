import { getSupabaseClient } from "../lib/supabaseClient";

/**
 * PUBLIC_INTERFACE
 * listNotes
 * Fetch all notes ordered by updated_at desc.
 * Returns an array of note objects.
 */
export async function listNotes() {
  const supabase = getSupabaseClient();
  try {
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .order("updated_at", { ascending: false });
    if (error) {
      // eslint-disable-next-line no-console
      console.error("[notesService.listNotes] Supabase error:", error);
      throw new Error(error.message || "Failed to list notes");
    }
    return data || [];
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[notesService.listNotes] Unexpected error:", err);
    throw err;
  }
}

/**
 * PUBLIC_INTERFACE
 * createNote
 * Create a new note with title and content.
 * If RLS requires a user_id, and a session exists, includes user_id.
 */
export async function createNote({ title, content }) {
  const supabase = getSupabaseClient();
  const now = new Date().toISOString();

  // Try to fetch session for potential RLS user_id requirement
  let userId;
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (!sessionError && sessionData?.session?.user?.id) {
      userId = sessionData.session.user.id;
    }
  } catch {
    // ignore session fetch failures; app supports anon mode too
  }

  const insertPayload = {
    title,
    content,
    created_at: now,
    updated_at: now,
    ...(userId ? { user_id: userId } : {}),
  };

  try {
    const { data, error } = await supabase
      .from("notes")
      .insert([insertPayload])
      .select()
      .single();
    if (error) {
      // eslint-disable-next-line no-console
      console.error("[notesService.createNote] Supabase error:", error, { insertPayload });
      throw new Error(error.message || "Failed to create note");
    }
    // Normalize to ensure fields present
    return {
      id: data.id,
      title: data.title ?? "",
      content: data.content ?? "",
      created_at: data.created_at || now,
      updated_at: data.updated_at || now,
    };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[notesService.createNote] Unexpected error:", err);
    throw err;
  }
}

/**
 * PUBLIC_INTERFACE
 * updateNote
 * Update an existing note by id.
 * Returns the updated note object.
 */
export async function updateNote(id, { title, content }) {
  const supabase = getSupabaseClient();
  const patch = { title, content, updated_at: new Date().toISOString() };
  try {
    const { data, error } = await supabase
      .from("notes")
      .update(patch)
      .eq("id", id)
      .select()
      .single();
    if (error) {
      // eslint-disable-next-line no-console
      console.error("[notesService.updateNote] Supabase error:", error, { id, patch });
      throw new Error(error.message || "Failed to update note");
    }
    return data;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[notesService.updateNote] Unexpected error:", err);
    throw err;
  }
}

/**
 * PUBLIC_INTERFACE
 * deleteNote
 * Delete note by id.
 * Returns true on success.
 */
export async function deleteNote(id) {
  const supabase = getSupabaseClient();
  try {
    const { error } = await supabase.from("notes").delete().eq("id", id);
    if (error) {
      // eslint-disable-next-line no-console
      console.error("[notesService.deleteNote] Supabase error:", error, { id });
      throw new Error(error.message || "Failed to delete note");
    }
    return true;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[notesService.deleteNote] Unexpected error:", err);
    throw err;
  }
}
