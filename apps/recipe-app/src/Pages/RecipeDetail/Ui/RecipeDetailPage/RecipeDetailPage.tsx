import { Link, useParams } from 'react-router';

import { RecipeDetail } from '#/Widgets/RecipeDetail';

import { useCategoryList } from '#/Entities/Category';
import { useRecipe } from '#/Entities/Recipe';

import { ROUTES } from '#/Shared/Config';

import { RecipeDetailLoading } from './RecipeDetailPage.loading';

export function RecipeDetailPage() {
	const { id } = useParams<{ id: string }>();
	const { data: recipe, isLoading, isError } = useRecipe(id ?? '');
	const { data: categoryList } = useCategoryList();

	if (isLoading) return <RecipeDetailLoading />;

	if (isError || !recipe) {
		return (
			<div className="mx-auto max-w-3xl px-4 py-8 text-center">
				<h2 className="text-xl font-semibold">
					레시피를 찾을 수 없습니다
				</h2>
				<p className="mt-2 text-muted-foreground">
					요청한 레시피가 존재하지 않거나 삭제되었습니다.
				</p>
				<Link
					to={ROUTES.RECIPE_LIST}
					className="mt-4 inline-block text-sm text-primary underline"
				>
					목록으로 돌아가기
				</Link>
			</div>
		);
	}

	const category = categoryList?.find((c) => c.id === recipe.categoryId);

	return (
		<div className="mx-auto max-w-3xl px-4 py-8">
			<Link
				to={ROUTES.RECIPE_LIST}
				className="mb-4 inline-block text-sm text-muted-foreground hover:text-foreground"
			>
				← 목록으로
			</Link>
			<RecipeDetail recipe={recipe} category={category} />
		</div>
	);
}
