import { create } from 'zustand';
import type { AnyNote, Note, ChecklistNote, IdeaNote, ChecklistItem, NoteType } from '../types';
import * as api from '../lib/api';

interface NotesState {
  notes: Note[];
  checklists: ChecklistNote[];
  ideas: IdeaNote[];
  isLoading: boolean;
  error: string | null;
  fetchNotes: () => Promise<void>;
  addNote: (data: api.CreateNoteData) => Promise<void>;
  updateNote: (id: string, data: api.UpdateNoteData) => Promise<void>;
  updateChecklist: (id: string, updates: Partial<ChecklistNote>) => void;
  updateIdea: (id: string, updates: Partial<IdeaNote>) => void;
  deleteNote: (id: string, type: NoteType) => Promise<void>;
  toggleChecklistItem: (noteId: string, itemId: string) => void;
  addChecklistItem: (noteId: string, item: ChecklistItem) => void;
  deleteChecklistItem: (noteId: string, itemId: string) => void;
  archiveNote: (id: string) => void;
  archiveChecklist: (id: string) => void;
  archiveIdea: (id: string) => void;
  unarchiveNote: (id: string) => void;
  unarchiveChecklist: (id: string) => void;
  unarchiveIdea: (id: string) => void;
  clearAllNotes: () => void;
  clearAllChecklists: () => void;
  clearAllIdeas: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const now = () => new Date().toISOString();

function distribute(all: AnyNote[]) {
  return {
    notes: all.filter((n): n is Note => n.type === 'note'),
    checklists: all.filter((n): n is ChecklistNote => n.type === 'checklist'),
    ideas: all.filter((n): n is IdeaNote => n.type === 'idea'),
  };
}

export const useNotesStore = create<NotesState>()((set) => ({
  notes: [],
  checklists: [],
  ideas: [],
  isLoading: false,
  error: null,

  fetchNotes: async () => {
    set({ isLoading: true, error: null });
    try {
      const all = await api.getNotes();
      set({ ...distribute(all), isLoading: false });
    } catch (e) {
      set({ isLoading: false, error: (e as Error).message });
    }
  },

  addNote: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const note = await api.createNote(data);
      set((state) => {
        if (note.type === 'note')
          return { notes: [note as Note, ...state.notes], isLoading: false };
        if (note.type === 'checklist')
          return { checklists: [note as ChecklistNote, ...state.checklists], isLoading: false };
        return { ideas: [note as IdeaNote, ...state.ideas], isLoading: false };
      });
    } catch (e) {
      set({ isLoading: false, error: (e as Error).message });
    }
  },

  updateNote: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await api.updateNote(id, data);
      set((state) => {
        if (updated.type === 'note')
          return { notes: state.notes.map((n) => (n.id === id ? (updated as Note) : n)), isLoading: false };
        if (updated.type === 'checklist')
          return { checklists: state.checklists.map((n) => (n.id === id ? (updated as ChecklistNote) : n)), isLoading: false };
        return { ideas: state.ideas.map((n) => (n.id === id ? (updated as IdeaNote) : n)), isLoading: false };
      });
    } catch (e) {
      set({ isLoading: false, error: (e as Error).message });
    }
  },

  updateChecklist: (id, updates) =>
    set((state) => ({
      checklists: state.checklists.map((n) =>
        n.id === id ? { ...n, ...updates, updatedAt: now() } : n
      ),
    })),

  updateIdea: (id, updates) =>
    set((state) => ({
      ideas: state.ideas.map((n) =>
        n.id === id ? { ...n, ...updates, updatedAt: now() } : n
      ),
    })),

  deleteNote: async (id, type) => {
    set({ isLoading: true, error: null });
    try {
      await api.deleteNote(id);
      set((state) => {
        if (type === 'note')
          return { notes: state.notes.filter((n) => n.id !== id), isLoading: false };
        if (type === 'checklist')
          return { checklists: state.checklists.filter((n) => n.id !== id), isLoading: false };
        return { ideas: state.ideas.filter((n) => n.id !== id), isLoading: false };
      });
    } catch (e) {
      set({ isLoading: false, error: (e as Error).message });
    }
  },

  toggleChecklistItem: (noteId, itemId) =>
    set((state) => ({
      checklists: state.checklists.map((n) =>
        n.id === noteId
          ? {
              ...n,
              updatedAt: now(),
              items: n.items.map((item) =>
                item.id === itemId ? { ...item, checked: !item.checked } : item
              ),
            }
          : n
      ),
    })),

  addChecklistItem: (noteId, item) =>
    set((state) => ({
      checklists: state.checklists.map((n) =>
        n.id === noteId ? { ...n, updatedAt: now(), items: [...n.items, item] } : n
      ),
    })),

  deleteChecklistItem: (noteId, itemId) =>
    set((state) => ({
      checklists: state.checklists.map((n) =>
        n.id === noteId
          ? { ...n, updatedAt: now(), items: n.items.filter((item) => item.id !== itemId) }
          : n
      ),
    })),

  archiveNote: (id) =>
    set((state) => ({
      notes: state.notes.map((n) => (n.id === id ? { ...n, archived: true } : n)),
    })),
  archiveChecklist: (id) =>
    set((state) => ({
      checklists: state.checklists.map((n) => (n.id === id ? { ...n, archived: true } : n)),
    })),
  archiveIdea: (id) =>
    set((state) => ({
      ideas: state.ideas.map((n) => (n.id === id ? { ...n, archived: true } : n)),
    })),

  unarchiveNote: (id) =>
    set((state) => ({
      notes: state.notes.map((n) => (n.id === id ? { ...n, archived: false } : n)),
    })),
  unarchiveChecklist: (id) =>
    set((state) => ({
      checklists: state.checklists.map((n) => (n.id === id ? { ...n, archived: false } : n)),
    })),
  unarchiveIdea: (id) =>
    set((state) => ({
      ideas: state.ideas.map((n) => (n.id === id ? { ...n, archived: false } : n)),
    })),

  clearAllNotes: () => set({ notes: [] }),
  clearAllChecklists: () => set({ checklists: [] }),
  clearAllIdeas: () => set({ ideas: [] }),

  isDarkMode: true,
  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
}));

export const selectAllNotesSorted = (state: NotesState): AnyNote[] =>
  [...state.notes, ...state.checklists, ...state.ideas].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
