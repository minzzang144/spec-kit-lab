import { Link, useNavigate, useParams } from 'react-router';

import { useRecipe } from '#/Entities/Recipe';
import { useCreateRecipe, useUpdateRecipe } from '#/Features/RecipeWrite';
import { recipeDetailPath, ROUTES } from '#/Shared/Config';

import type { RecipeFormValue } from '#/Widgets/RecipeWrite';
import { RecipeWriteForm } from '#/Widgets/RecipeWrite';

import type { CreateRecipeRequestDto } from '#/Features/RecipeWrite';

export function RecipeWritePage() {
	const { id } = useParams<{ id: string }>();
	const isEditMode = Boolean(id);
	const navigate = useNavigate();

	const { data: existingRecipe, isLoading } = useRecipe(id ?? '');
	const createMutation = useCreateRecipe();
	const updateMutation = useUpdateRecipe(id ?? '');

	function toRequestDto(data: RecipeFormValue): CreateRecipeRequestDto {
		return {
			title: data.title,
			description: data.description,
			category_id: data.categoryId,
			cooking_time: data.cookingTime,
			difficulty: data.difficulty,
			ingredients: data.ingredientList.map((ing) => ({
				name: ing.name,
				amount: ing.amount,
				unit: ing.unit,
			})),
		};
	}

	function handleSubmit(data: RecipeFormValue) {
		const dto = toRequestDto(data);

		if (isEditMode && id) {
			updateMutation.mutate(dto, {
				onSuccess: () => navigate(recipeDetailPath(id)),
			});
		} else {
			createMutation.mutate(dto, {
				onSuccess: (created) =>
					navigate(recipeDetailPath(created._id)),
			});
		}
	}

	if (isEditMode && isLoading) {
		return (
			<div className="mx-auto max-w-3xl px-4 py-8">
				<div className="h-8 w-48 animate-pulse rounded bg-muted" />
			</div>
		);
	}

	const defaultValue: Partial<RecipeFormValue> | undefined =
		isEditMode && existingRecipe
			? {
					title: existingRecipe.title,
					description: existingRecipe.description,
					categoryId: existingRecipe.categoryId,
					cookingTime: existingRecipe.cookingTime,
					difficulty: existingRecipe.difficulty,
					ingredientList: existingRecipe.ingredientList,
				}
			: undefined;

	return (
		<div className="mx-auto max-w-3xl px-4 py-8">
			<Link
				to={ROUTES.RECIPE_LIST}
				className="mb-4 inline-block text-sm text-muted-foreground hover:text-foreground"
			>
				← 목록으로
			</Link>
			<h1 className="mb-6 text-2xl font-bold">
				{isEditMode ? '레시피 수정' : '새 레시피'}
			</h1>
			<RecipeWriteForm
				defaultValue={defaultValue}
				onSubmit={handleSubmit}
				isSubmitting={
					createMutation.isPending || updateMutation.isPending
				}
				submitLabel={isEditMode ? '수정' : '생성'}
			/>
		</div>
	);
}
