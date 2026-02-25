import { queryOptions } from '@tanstack/react-query';

import type { GetRecipeListQuery } from '../Type';

import { getRecipe, getRecipeList } from './Get';
import { recipeQueryKey } from './Key';

export const recipeQueryOption = {
	list: (query?: GetRecipeListQuery) =>
		queryOptions({
			queryKey: recipeQueryKey.list(query),
			queryFn: () => getRecipeList(query),
		}),
	detail: (id: string) =>
		queryOptions({
			queryKey: recipeQueryKey.detail(id),
			queryFn: () => getRecipe(id),
		}),
};
