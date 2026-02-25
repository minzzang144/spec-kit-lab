export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type Ingredient = {
	readonly name: string;
	readonly amount: number;
	readonly unit: string;
};

export type Recipe = {
	readonly id: string;
	readonly title: string;
	readonly description: string;
	readonly categoryId: string;
	readonly cookingTime: number;
	readonly difficulty: Difficulty;
	readonly ingredientList: Ingredient[];
	readonly createdAt: string;
	readonly updatedAt: string;
};
