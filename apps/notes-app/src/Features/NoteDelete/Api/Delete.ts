import { httpClient } from '#/Shared/Api';

export async function deleteNote(id: string): Promise<void> {
	await httpClient.delete<void>(`/notes/${id}`);
}
