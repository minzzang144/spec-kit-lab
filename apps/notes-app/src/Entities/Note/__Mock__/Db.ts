import type { Note } from '../Type';

import { INITIAL_NOTE_LIST } from './Seed';

let noteList: Note[] = [...INITIAL_NOTE_LIST];
let nextNoteId = INITIAL_NOTE_LIST.length + 1;

export function getNoteList(): Note[] {
	return noteList;
}

export function setNoteList(list: Note[]): void {
	noteList = list;
}

export function addNote(
	note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>,
): Note {
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

export function resetNoteDb(): void {
	noteList = [...INITIAL_NOTE_LIST];
	nextNoteId = INITIAL_NOTE_LIST.length + 1;
}
