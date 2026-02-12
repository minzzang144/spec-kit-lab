import type { CreateNoteRequest } from '../Type';
import { postNote } from './Post';
import { noteWriteMutationKey } from './Key';

export const noteWriteMutationOption = {
  create: () => ({
    mutationKey: noteWriteMutationKey.create,
    mutationFn: (payload: CreateNoteRequest) => postNote(payload),
  }),
};
