import { describe, expect, it } from 'vitest';

import type { RecipeDto } from '../../Type';

import { toRecipe, toRecipeList } from './RecipeMapper';

const MOCK_RECIPE_DTO: RecipeDto = {
	_id: 'recipe-1',
	title: 'Test Recipe',
	description: 'A test recipe description',
	category_id: 'cat-breakfast',
	category: { id: 'cat-breakfast', name: 'Breakfast', color: '#F59E0B' },
	cooking_time: 30,
	difficulty: 'Medium',
	ingredients: [
		{ name: 'Flour', amount: 200, unit: 'g' },
		{ name: 'Milk', amount: 300, unit: 'ml' },
	],
	created_at: '2026-02-01T09:00:00.000Z',
	updated_at: '2026-02-02T10:00:00.000Z',
};

describe('RecipeMapper', () => {
	describe('toRecipe', () => {
		it('should map _id to id', () => {
			const result = toRecipe(MOCK_RECIPE_DTO);
			expect(result.id).toBe('recipe-1');
		});

		it('should map category_id to categoryId', () => {
			const result = toRecipe(MOCK_RECIPE_DTO);
			expect(result.categoryId).toBe('cat-breakfast');
		});

		it('should map cooking_time to cookingTime', () => {
			const result = toRecipe(MOCK_RECIPE_DTO);
			expect(result.cookingTime).toBe(30);
		});

		it('should map ingredients to ingredientList', () => {
			const result = toRecipe(MOCK_RECIPE_DTO);
			expect(result.ingredientList).toHaveLength(2);
			expect(result.ingredientList[0]).toEqual({
				name: 'Flour',
				amount: 200,
				unit: 'g',
			});
		});

		it('should map created_at to createdAt', () => {
			const result = toRecipe(MOCK_RECIPE_DTO);
			expect(result.createdAt).toBe('2026-02-01T09:00:00.000Z');
		});

		it('should map updated_at to updatedAt', () => {
			const result = toRecipe(MOCK_RECIPE_DTO);
			expect(result.updatedAt).toBe('2026-02-02T10:00:00.000Z');
		});

		it('should preserve title, description, and difficulty', () => {
			const result = toRecipe(MOCK_RECIPE_DTO);
			expect(result.title).toBe('Test Recipe');
			expect(result.description).toBe('A test recipe description');
			expect(result.difficulty).toBe('Medium');
		});
	});

	describe('toRecipeList', () => {
		it('should map an array of RecipeDto to Recipe array', () => {
			const secondDto: RecipeDto = {
				...MOCK_RECIPE_DTO,
				_id: 'recipe-2',
				title: 'Second Recipe',
			};
			const result = toRecipeList([MOCK_RECIPE_DTO, secondDto]);
			expect(result).toHaveLength(2);
			expect(result[0]?.id).toBe('recipe-1');
			expect(result[1]?.id).toBe('recipe-2');
		});

		it('should return empty array for empty input', () => {
			const result = toRecipeList([]);
			expect(result).toEqual([]);
		});
	});
});
