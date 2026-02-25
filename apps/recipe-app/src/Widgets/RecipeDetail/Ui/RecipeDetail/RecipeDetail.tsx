import type { ReactNode } from 'react';

import type { Category } from '#/Entities/Category';
import { CategoryBadge } from '#/Entities/Category';
import type { Recipe } from '#/Entities/Recipe';
import { RecipeCookingTime, RecipeDifficulty } from '#/Entities/Recipe';

import { RecipeIngredientList } from '../RecipeIngredientList';

type RecipeDetailProps = {
	readonly recipe: Recipe;
	readonly category: Category | undefined;
	readonly actionSlot?: ReactNode;
};

export function RecipeDetail({
	recipe,
	category,
	actionSlot,
}: RecipeDetailProps) {
	return (
		<div className="space-y-6">
			<div>
				<div className="flex items-start justify-between gap-4">
					<h1 className="text-2xl font-bold">{recipe.title}</h1>
					{actionSlot && <div className="flex gap-2">{actionSlot}</div>}
				</div>
				<div className="mt-2 flex items-center gap-3">
					{category && (
						<CategoryBadge
							name={category.name}
							color={category.color}
						/>
					)}
					<RecipeDifficulty difficulty={recipe.difficulty} />
					<RecipeCookingTime minutes={recipe.cookingTime} />
				</div>
			</div>

			<p className="text-muted-foreground">{recipe.description}</p>

			<RecipeIngredientList ingredientList={recipe.ingredientList} />
		</div>
	);
}
