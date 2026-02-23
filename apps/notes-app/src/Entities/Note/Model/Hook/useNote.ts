import { useQuery } from '@tanstack/react-query';

import { noteQueryOption } from '../../Api';

export function useNote(id: string) {
	return useQuery(noteQueryOption.detail(id));
}
