import type { CreateCategoryRequest } from '../Type';

import { deleteCategory } from './Delete';
import { categoryWriteMutationKey } from './Key';
import { postCategory } from './Post';

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
