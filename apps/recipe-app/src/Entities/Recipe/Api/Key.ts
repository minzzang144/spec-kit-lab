import type { GetRecipeListQuery } from '../Type';

export const recipeQueryKey = {
	all: ['recipe'] as const,
	list: (query?: GetRecipeListQuery) =>
		[...recipeQueryKey.all, 'list', query] as const,
	detail: (id: string) => [...recipeQueryKey.all, 'detail', id] as const,
};
