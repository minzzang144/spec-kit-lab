import { useQuery } from '@tanstack/react-query';
import { noteQueryOption } from '../../Api/Query';

type UseNoteListParam = {
  readonly categoryId?: string;
  readonly keyword?: string;
  readonly sort?: 'createdAt_desc' | 'createdAt_asc';
};

export function useNoteList(param?: UseNoteListParam) {
  return useQuery(noteQueryOption.list(param));
}
