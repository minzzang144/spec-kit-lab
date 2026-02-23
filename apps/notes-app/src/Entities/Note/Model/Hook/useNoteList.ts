import { useQuery } from '@tanstack/react-query';

import type { GetNoteListQuery } from '../../Type';

import { noteQueryOption } from '../../Api';

export function useNoteList(param?: GetNoteListQuery) {
	return useQuery(noteQueryOption.list(param));
}
