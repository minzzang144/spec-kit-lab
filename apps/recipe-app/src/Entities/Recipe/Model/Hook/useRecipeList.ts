import { useQuery } from '@tanstack/react-query';

import type { GetRecipeListQuery } from '../../Type';
import { recipeQueryOption } from '../../Api';

export function useRecipeList(query?: GetRecipeListQuery) {
	return useQuery(recipeQueryOption.list(query));
}
