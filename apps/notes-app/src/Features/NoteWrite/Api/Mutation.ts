import type { CreateNoteRequest, UpdateNoteRequest } from '../Type';

import { noteWriteMutationKey } from './Key';
import { postNote } from './Post';
import { putNote } from './Put';

export const noteWriteMutationOption = {
	create: () => ({
		mutationKey: noteWriteMutationKey.create,
		mutationFn: (payload: CreateNoteRequest) => postNote(payload),
	}),
	update: (id: string) => ({
		mutationKey: noteWriteMutationKey.update(id),
		mutationFn: (payload: UpdateNoteRequest) => putNote(id, payload),
	}),
};
