import { httpClient } from '#/Shared/Api';
import type { Note } from '#/Entities/Note';
import type { UpdateNoteRequest } from '../Type';

export async function putNote(id: string, payload: UpdateNoteRequest): Promise<Note> {
  return httpClient.put<Note>(`/notes/${id}`, payload);
}
