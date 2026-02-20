import type { Note } from '#/Entities/Note';

import { httpClient } from '#/Shared/Api';

import type { CreateNoteRequest } from '../Type';

export async function postNote(payload: CreateNoteRequest): Promise<Note> {
	return httpClient.post<Note>('/notes', payload);
}
