import type { CreateCategoryRequest } from '../Type';
import { postCategory } from './Post';
import { deleteCategory } from './Delete';
import { categoryWriteMutationKey } from './Key';

export const categoryWriteMutationOption = {
  create: () => ({
    mutationKey: categoryWriteMutationKey.create,
    mutationFn: (payload: CreateCategoryRequest) => postCategory(payload),
  }),
  delete: (id: string) => ({
    mutationKey: categoryWriteMutationKey.delete(id),
    mutationFn: () => deleteCategory(id),
  }),
};
