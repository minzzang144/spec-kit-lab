import { useQuery } from '@tanstack/react-query';

import { noteQueryOption } from '../../Api/Query';

export function useNote(id: string) {
	return useQuery(noteQueryOption.detail(id));
}
