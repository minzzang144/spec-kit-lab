import { queryOptions } from '@tanstack/react-query';
import { getNoteList, getNote } from './Get';

export const noteQueryKey = {
  all: ['note'] as const,
  list: (param?: {
    categoryId?: string;
    keyword?: string;
    sort?: string;
  }) => [...noteQueryKey.all, 'list', param] as const,
  detail: (id: string) => [...noteQueryKey.all, 'detail', id] as const,
};

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
