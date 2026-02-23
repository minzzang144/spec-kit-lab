import { queryOptions } from '@tanstack/react-query';

import type { GetNoteListQuery } from '../Type';

import { getNote, getNoteList } from './Get';
import { noteQueryKey } from './Key';

export const noteQueryOption = {
	list: (param?: GetNoteListQuery) =>
		queryOptions({
			queryKey: noteQueryKey.list(param),
			queryFn: () => getNoteList(param),
		}),

	detail: (id: string) =>
		queryOptions({
			queryKey: noteQueryKey.detail(id),
			queryFn: () => getNote(id),
		}),
};
