import type { Ingredient } from '#/Entities/Recipe';

type RecipeIngredientListProps = {
	readonly ingredientList: readonly Ingredient[];
};

export function RecipeIngredientList({
	ingredientList,
}: RecipeIngredientListProps) {
	return (
		<div>
			<h3 className="mb-3 text-lg font-semibold">재료</h3>
			<ul className="space-y-2">
				{ingredientList.map((ingredient, index) => (
					<li
						key={index}
						className="flex items-center justify-between rounded-md border px-3 py-2"
					>
						<span className="font-medium">{ingredient.name}</span>
						<span className="text-sm text-muted-foreground">
							{ingredient.amount} {ingredient.unit}
						</span>
					</li>
				))}
			</ul>
		</div>
	);
}
