import type { Note } from '#/Entities/Note';
import type { Category } from '#/Entities/Category';
import { INITIAL_NOTE_LIST } from '#/Entities/Note/__Mock__/noteMockData';
import { INITIAL_CATEGORY_LIST } from '#/Entities/Category/__Mock__/categoryMockData';

let noteList: Note[] = [...INITIAL_NOTE_LIST];
let categoryList: Category[] = [...INITIAL_CATEGORY_LIST];
let nextNoteId = INITIAL_NOTE_LIST.length + 1;
let nextCategoryId = 1;

export function getNoteList(): Note[] {
  return noteList;
}

export function setNoteList(list: Note[]): void {
  noteList = list;
}

export function addNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Note {
  const now = new Date().toISOString();
  const newNote: Note = {
    id: String(nextNoteId++),
    createdAt: now,
    updatedAt: now,
    ...note,
  };
  noteList.unshift(newNote);
  return newNote;
}

export function updateNote(
  id: string,
  patch: Partial<Pick<Note, 'title' | 'content' | 'categoryId'>>,
): Note | null {
  const index = noteList.findIndex((n) => n.id === id);
  if (index === -1) return null;

  const updated: Note = {
    ...noteList[index],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  noteList[index] = updated;
  return updated;
}

export function deleteNote(id: string): boolean {
  const index = noteList.findIndex((n) => n.id === id);
  if (index === -1) return false;
  noteList.splice(index, 1);
  return true;
}

export function getCategoryList(): Category[] {
  return categoryList;
}

export function addCategory(name: string): Category {
  const newCategory: Category = {
    id: `cat-custom-${nextCategoryId++}`,
    name,
    isDefault: false,
  };
  categoryList.push(newCategory);
  return newCategory;
}

export function deleteCategory(id: string): { deleted: boolean; movedCount: number } {
  const category = categoryList.find((c) => c.id === id);
  if (!category) return { deleted: false, movedCount: 0 };

  let movedCount = 0;
  for (let i = 0; i < noteList.length; i++) {
    if (noteList[i].categoryId === id) {
      noteList[i] = { ...noteList[i], categoryId: 'uncategorized' };
      movedCount++;
    }
  }

  categoryList = categoryList.filter((c) => c.id !== id);
  return { deleted: true, movedCount };
}

export function resetMockStore(): void {
  noteList = [...INITIAL_NOTE_LIST];
  categoryList = [...INITIAL_CATEGORY_LIST];
  nextNoteId = INITIAL_NOTE_LIST.length + 1;
  nextCategoryId = 1;
}
