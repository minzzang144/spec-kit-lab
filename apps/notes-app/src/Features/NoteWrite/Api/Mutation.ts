import type { CreateNoteRequest, UpdateNoteRequest } from '../Type';
import { postNote } from './Post';
import { putNote } from './Put';
import { noteWriteMutationKey } from './Key';

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
