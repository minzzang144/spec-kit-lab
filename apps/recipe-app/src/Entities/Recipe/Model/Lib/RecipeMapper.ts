import type { Ingredient, Recipe } from '../../Type';
import type { IngredientDto, RecipeDto } from '../../Type';

export function toIngredient(dto: IngredientDto): Ingredient {
	return {
		name: dto.name,
		amount: dto.amount,
		unit: dto.unit,
	};
}

export function toIngredientList(dtoList: readonly IngredientDto[]): Ingredient[] {
	return dtoList.map(toIngredient);
}

export function toRecipe(dto: RecipeDto): Recipe {
	return {
		id: dto._id,
		title: dto.title,
		description: dto.description,
		categoryId: dto.category_id,
		cookingTime: dto.cooking_time,
		difficulty: dto.difficulty as Recipe['difficulty'],
		ingredientList: toIngredientList(dto.ingredients),
		createdAt: dto.created_at,
		updatedAt: dto.updated_at,
	};
}

export function toRecipeList(dtoList: readonly RecipeDto[]): Recipe[] {
	return dtoList.map(toRecipe);
}
