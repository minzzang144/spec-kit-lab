export const INGREDIENT_UNIT_LIST = [
	'g',
	'kg',
	'ml',
	'L',
	'tsp',
	'tbsp',
	'cup',
	'pieces',
	'cloves',
	'slices',
	'pinch',
] as const;

export type IngredientUnit = (typeof INGREDIENT_UNIT_LIST)[number];
