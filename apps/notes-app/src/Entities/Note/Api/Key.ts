import type { GetNoteListQuery } from '../Type';

export const noteQueryKey = {
	all: ['note'] as const,
	list: (param?: GetNoteListQuery) =>
		[...noteQueryKey.all, 'list', param] as const,
	detail: (id: string) => [...noteQueryKey.all, 'detail', id] as const,
};
