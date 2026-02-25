// EXCEPTION (gem-fsd-architecture §7): cross-entity import type
// BE response embeds Category in Recipe (NoSQL pattern). No runtime dependency.
import type { Category } from '#/Entities/Category';

export type IngredientDto = {
	readonly name: string;
	readonly amount: number;
	readonly unit: string;
};

export type RecipeDto = {
	readonly _id: string;
	readonly title: string;
	readonly description: string;
	readonly category_id: string;
	readonly category: Category;
	readonly cooking_time: number;
	readonly difficulty: string;
	readonly ingredients: IngredientDto[];
	readonly created_at: string;
	readonly updated_at: string;
};
