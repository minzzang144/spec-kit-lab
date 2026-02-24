import { Link } from 'react-router';

import type { Category } from '#/Entities/Category';
import { CategoryBadge } from '#/Entities/Category';
import type { Recipe } from '#/Entities/Recipe';
import { RecipeCookingTime, RecipeDifficulty } from '#/Entities/Recipe';

import { recipeDetailPath } from '#/Shared/Config';

type RecipeListCardProps = {
	readonly recipe: Recipe;
	readonly category: Category | undefined;
};

export function RecipeListCard({ recipe, category }: RecipeListCardProps) {
	return (
		<Link
			to={recipeDetailPath(recipe.id)}
			className="block rounded-lg border bg-card p-4 transition-colors hover:bg-accent"
		>
			<div className="flex items-start justify-between gap-2">
				<h3 className="font-semibold">{recipe.title}</h3>
				{category && (
					<CategoryBadge
						name={category.name}
						color={category.color}
					/>
				)}
			</div>
			<p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
				{recipe.description}
			</p>
			<div className="mt-3 flex items-center gap-3">
				<RecipeDifficulty difficulty={recipe.difficulty} />
				<RecipeCookingTime minutes={recipe.cookingTime} />
				<span className="text-sm text-muted-foreground">
					재료 {recipe.ingredientList.length}개
				</span>
			</div>
		</Link>
	);
}
