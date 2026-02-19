import { deleteNote } from './Delete';
import { noteDeleteMutationKey } from './Key';

export const noteDeleteMutationOption = {
  delete: (id: string) => ({
    mutationKey: noteDeleteMutationKey.delete(id),
    mutationFn: () => deleteNote(id),
  }),
};
