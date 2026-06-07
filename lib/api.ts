import auth from '@react-native-firebase/auth';
import type { AnyNote, ChecklistItem, NoteType } from '../types';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api';

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await auth().currentUser?.getIdToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
    ...init,
  });
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

// Notes

export function getNotes(): Promise<AnyNote[]> {
  return apiFetch<AnyNote[]>('/notes');
}

export function getNoteById(id: string): Promise<AnyNote> {
  return apiFetch<AnyNote>(`/notes/${id}`);
}

export interface CreateNoteData {
  title: string;
  type: NoteType;
  content?: string;
  color?: string;
}

export function createNote(data: CreateNoteData): Promise<AnyNote> {
  return apiFetch<AnyNote>('/notes', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export interface UpdateNoteData {
  title?: string;
  content?: string;
  color?: string;
}

export function updateNote(id: string, data: UpdateNoteData): Promise<AnyNote> {
  return apiFetch<AnyNote>(`/notes/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function deleteNote(id: string): Promise<void> {
  return apiFetch<void>(`/notes/${id}`, { method: 'DELETE' });
}

// Checklist items

export function getChecklistItems(noteId: string): Promise<ChecklistItem[]> {
  return apiFetch<ChecklistItem[]>(`/notes/${noteId}/checklist-items`);
}

export function createChecklistItem(noteId: string, text: string): Promise<ChecklistItem> {
  return apiFetch<ChecklistItem>(`/notes/${noteId}/checklist-items`, {
    method: 'POST',
    body: JSON.stringify({ text }),
  });
}

export interface UpdateChecklistItemData {
  text?: string;
  is_completed?: boolean;
}

export function updateChecklistItem(
  itemId: string,
  data: UpdateChecklistItemData,
): Promise<ChecklistItem> {
  return apiFetch<ChecklistItem>(`/checklist-items/${itemId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function deleteChecklistItem(itemId: string): Promise<void> {
  return apiFetch<void>(`/checklist-items/${itemId}`, { method: 'DELETE' });
}
