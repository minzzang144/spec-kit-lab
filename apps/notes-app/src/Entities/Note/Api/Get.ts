import { httpClient } from '#/Shared/Api';

import type { Note } from '../Type/Note';

type GetNoteListParam = {
	readonly categoryId?: string;
	readonly keyword?: string;
	readonly sort?: 'createdAt_desc' | 'createdAt_asc';
};

export async function getNoteList(param?: GetNoteListParam): Promise<Note[]> {
	const searchParam = new URLSearchParams();

	if (param?.categoryId) {
		searchParam.set('categoryId', param.categoryId);
	}
	if (param?.keyword) {
		searchParam.set('keyword', param.keyword);
	}
	if (param?.sort) {
		searchParam.set('sort', param.sort);
	}

	const query = searchParam.toString();
	const url = query ? `/notes?${query}` : '/notes';

	return httpClient.get<Note[]>(url);
}

export async function getNote(id: string): Promise<Note> {
	return httpClient.get<Note>(`/notes/${id}`);
}
