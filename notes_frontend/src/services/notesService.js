import { getSupabaseClient } from "../lib/supabaseClient";

/**
 * PUBLIC_INTERFACE
 * listNotes
 * Fetch all notes ordered by updated_at desc.
 */
export async function listNotes() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

/**
 * PUBLIC_INTERFACE
 * createNote
 * Create a new note with title and content.
 */
export async function createNote({ title, content }) {
  const supabase = getSupabaseClient();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("notes")
    .insert([{ title, content, created_at: now, updated_at: now }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * PUBLIC_INTERFACE
 * updateNote
 * Update an existing note by id.
 */
export async function updateNote(id, { title, content }) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("notes")
    .update({ title, content, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * PUBLIC_INTERFACE
 * deleteNote
 * Delete note by id.
 */
export async function deleteNote(id) {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("notes").delete().eq("id", id);
  if (error) throw error;
  return true;
}
