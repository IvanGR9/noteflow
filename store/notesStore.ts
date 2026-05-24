import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AnyNote, Note, ChecklistNote, IdeaNote, ChecklistItem, NoteType } from '../types';

interface NotesState {
  notes: Note[];
  checklists: ChecklistNote[];
  ideas: IdeaNote[];
  _hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  addNote: (note: AnyNote) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  updateChecklist: (id: string, updates: Partial<ChecklistNote>) => void;
  updateIdea: (id: string, updates: Partial<IdeaNote>) => void;
  deleteNote: (id: string, type: NoteType) => void;
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

export const useNotesStore = create<NotesState>()(
  persist(
    (set) => ({
      notes: [],
      checklists: [],
      ideas: [],
      _hasHydrated: false,

      setHasHydrated: (value) => set({ _hasHydrated: value }),

      addNote: (note) =>
        set((state) => {
          if (note.type === 'note') return { notes: [note, ...state.notes] };
          if (note.type === 'checklist') return { checklists: [note, ...state.checklists] };
          return { ideas: [note, ...state.ideas] };
        }),

      updateNote: (id, updates) =>
        set((state) => ({
          notes: state.notes.map((n) =>
            n.id === id ? { ...n, ...updates, updatedAt: now() } : n
          ),
        })),

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

      deleteNote: (id, type) =>
        set((state) => {
          if (type === 'note') return { notes: state.notes.filter((n) => n.id !== id) };
          if (type === 'checklist') return { checklists: state.checklists.filter((n) => n.id !== id) };
          return { ideas: state.ideas.filter((n) => n.id !== id) };
        }),

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
    }),
    {
      name: 'noteflow-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      // _hasHydrated es estado de runtime, no se persiste
      partialize: ({ notes, checklists, ideas, isDarkMode }) => ({ notes, checklists, ideas, isDarkMode }),
    }
  )
);

export const selectAllNotesSorted = (state: NotesState): AnyNote[] =>
  [...state.notes, ...state.checklists, ...state.ideas].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
