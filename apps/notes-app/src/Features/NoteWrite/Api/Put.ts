import type { Note } from '#/Entities/Note';

import { httpClient } from '#/Shared/Api';

import type { UpdateNoteRequest } from '../Type/NoteWrite';

export async function putNote(
	id: string,
	payload: UpdateNoteRequest,
): Promise<Note> {
	return httpClient.put<Note>(`/notes/${id}`, payload);
}
