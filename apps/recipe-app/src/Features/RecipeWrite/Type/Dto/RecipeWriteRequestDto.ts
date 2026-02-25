export type CreateRecipeRequestDto = {
	readonly title: string;
	readonly description: string;
	readonly category_id: string;
	readonly cooking_time: number;
	readonly difficulty: string;
	readonly ingredients: ReadonlyArray<{
		readonly name: string;
		readonly amount: number;
		readonly unit: string;
	}>;
};

export type UpdateRecipeRequestDto = CreateRecipeRequestDto;
