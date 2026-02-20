import { queryOptions } from '@tanstack/react-query';

import { getNote, getNoteList } from './Get';
import { noteQueryKey } from './Key';

export const noteQueryOption = {
	list: (param?: {
		categoryId?: string;
		keyword?: string;
		sort?: 'createdAt_desc' | 'createdAt_asc';
	}) =>
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
