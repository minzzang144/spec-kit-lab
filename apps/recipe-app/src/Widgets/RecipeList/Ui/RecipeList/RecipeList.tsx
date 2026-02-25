import { useCategoryList } from '#/Entities/Category';
import { useRecipeList } from '#/Entities/Recipe';

import { useCategoryFilter } from '#/Features/CategoryFilter';

import { RecipeListCard } from '../RecipeListCard';
import { RecipeListEmpty } from '../RecipeListEmpty';
import { RecipeListLoading } from './RecipeList.loading';

export function RecipeList() {
	const { selectedCategoryId } = useCategoryFilter();
	const { data: categoryList } = useCategoryList();

	const query = selectedCategoryId
		? { categoryId: selectedCategoryId }
		: undefined;
	const { data: recipeList, isLoading, isError } = useRecipeList(query);

	if (isLoading) return <RecipeListLoading />;
	if (isError) return <p className="py-8 text-center text-destructive">레시피를 불러오지 못했습니다.</p>;
	if (!recipeList || recipeList.length === 0) return <RecipeListEmpty />;

	const categoryMap = new Map(
		categoryList?.map((c) => [c.id, c]) ?? [],
	);

	return (
		<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{recipeList.map((recipe) => (
				<RecipeListCard
					key={recipe.id}
					recipe={recipe}
					category={categoryMap.get(recipe.categoryId)}
				/>
			))}
		</div>
	);
}
