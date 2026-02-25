import { useQuery } from '@tanstack/react-query';

import { recipeQueryOption } from '../../Api';

export function useRecipe(id: string) {
	return useQuery(recipeQueryOption.detail(id));
}
