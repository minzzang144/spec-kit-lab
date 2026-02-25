import { getCategoryById } from '#/Entities/Category/__Mock__';

import type { RecipeDto } from '../Type';

import { RECIPE_SEED_DATA } from './Seed';

let recipeList: RecipeDto[] = [...RECIPE_SEED_DATA];
let nextId = recipeList.length + 1;

export function getRecipeList(categoryId?: string): RecipeDto[] {
	if (categoryId) {
		return recipeList.filter(
			(recipe) => recipe.category_id === categoryId,
		);
	}
	return [...recipeList];
}

export function getRecipeById(id: string): RecipeDto | undefined {
	return recipeList.find((recipe) => recipe._id === id);
}

export function createRecipe(
	data: Omit<
		RecipeDto,
		'_id' | 'category' | 'created_at' | 'updated_at'
	>,
): RecipeDto {
	const category = getCategoryById(data.category_id);
	const now = new Date().toISOString();
	const newRecipe: RecipeDto = {
		...data,
		_id: `recipe-${nextId++}`,
		category: category ?? {
			id: data.category_id,
			name: 'Unknown',
			color: '#888888',
		},
		created_at: now,
		updated_at: now,
	};
	recipeList = [...recipeList, newRecipe];
	return newRecipe;
}

export function updateRecipe(
	id: string,
	data: Omit<
		RecipeDto,
		'_id' | 'category' | 'created_at' | 'updated_at'
	>,
): RecipeDto | undefined {
	const index = recipeList.findIndex((recipe) => recipe._id === id);
	if (index === -1) return undefined;

	const category = getCategoryById(data.category_id);
	const existing = recipeList[index];
	if (!existing) return undefined;

	const updated: RecipeDto = {
		...existing,
		...data,
		category: category ?? existing.category,
		updated_at: new Date().toISOString(),
	};
	recipeList = recipeList.map((recipe, i) =>
		i === index ? updated : recipe,
	);
	return updated;
}

export function deleteRecipe(id: string): boolean {
	const initialLength = recipeList.length;
	recipeList = recipeList.filter((recipe) => recipe._id !== id);
	return recipeList.length < initialLength;
}

export function resetRecipeDb(): void {
	recipeList = [...RECIPE_SEED_DATA];
	nextId = recipeList.length + 1;
}
