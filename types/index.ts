export type NoteType = 'note' | 'checklist' | 'idea';

export interface BaseNote {
  id: string;
  title: string;
  type: NoteType;
  createdAt: string;
  updatedAt: string;
  pinned: boolean;
  tags: string[];
}

export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

export interface Note extends BaseNote {
  type: 'note';
  content: string;
}

export interface ChecklistNote extends BaseNote {
  type: 'checklist';
  items: ChecklistItem[];
}

export interface IdeaNote extends BaseNote {
  type: 'idea';
  content: string;
  status: 'raw' | 'developing' | 'ready' | 'discarded';
}

export type AnyNote = Note | ChecklistNote | IdeaNote;

// Type guards
export function isNote(note: AnyNote): note is Note {
  return note.type === 'note';
}

export function isChecklistNote(note: AnyNote): note is ChecklistNote {
  return note.type === 'checklist';
}

export function isIdeaNote(note: AnyNote): note is IdeaNote {
  return note.type === 'idea';
}
