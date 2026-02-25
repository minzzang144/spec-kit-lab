export const ROUTES = {
	HOME: '/',
	RECIPE_LIST: '/recipes',
	RECIPE_DETAIL: '/recipes/:id',
	RECIPE_NEW: '/recipes/new',
	RECIPE_EDIT: '/recipes/:id/edit',
} as const;

export function recipeDetailPath(id: string): string {
	return `/recipes/${id}`;
}

export function recipeEditPath(id: string): string {
	return `/recipes/${id}/edit`;
}
