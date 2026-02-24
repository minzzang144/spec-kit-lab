import { useCategoryList } from '#/Entities/Category';

import { IngredientFieldList } from '../IngredientFieldList';
import type { RecipeFormValue } from './RecipeWriteForm.hook';
import { useRecipeWriteForm } from './RecipeWriteForm.hook';

type RecipeWriteFormProps = {
	readonly defaultValue?: Partial<RecipeFormValue>;
	readonly onSubmit: (data: RecipeFormValue) => void;
	readonly isSubmitting?: boolean;
	readonly submitLabel?: string;
};

export function RecipeWriteForm({
	defaultValue,
	onSubmit,
	isSubmitting = false,
	submitLabel = '저장',
}: RecipeWriteFormProps) {
	const { form, ingredientFieldArray } = useRecipeWriteForm(defaultValue);
	const { data: categoryList } = useCategoryList();

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = form;

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
			<div>
				<label htmlFor="title" className="mb-1 block text-sm font-medium">
					제목
				</label>
				<input
					id="title"
					{...register('title')}
					className="w-full rounded-md border px-3 py-2"
					placeholder="레시피 제목"
				/>
				{errors.title && (
					<p className="mt-1 text-sm text-destructive">
						{errors.title.message}
					</p>
				)}
			</div>

			<div>
				<label
					htmlFor="description"
					className="mb-1 block text-sm font-medium"
				>
					설명
				</label>
				<textarea
					id="description"
					{...register('description')}
					rows={4}
					className="w-full rounded-md border px-3 py-2"
					placeholder="레시피에 대한 설명"
				/>
				{errors.description && (
					<p className="mt-1 text-sm text-destructive">
						{errors.description.message}
					</p>
				)}
			</div>

			<div className="grid gap-4 sm:grid-cols-3">
				<div>
					<label
						htmlFor="categoryId"
						className="mb-1 block text-sm font-medium"
					>
						카테고리
					</label>
					<select
						id="categoryId"
						{...register('categoryId')}
						className="w-full rounded-md border px-3 py-2"
					>
						<option value="">선택하세요</option>
						{categoryList?.map((cat) => (
							<option key={cat.id} value={cat.id}>
								{cat.name}
							</option>
						))}
					</select>
					{errors.categoryId && (
						<p className="mt-1 text-sm text-destructive">
							{errors.categoryId.message}
						</p>
					)}
				</div>

				<div>
					<label
						htmlFor="cookingTime"
						className="mb-1 block text-sm font-medium"
					>
						조리 시간 (분)
					</label>
					<input
						id="cookingTime"
						type="number"
						{...register('cookingTime', { valueAsNumber: true })}
						className="w-full rounded-md border px-3 py-2"
						placeholder="30"
					/>
					{errors.cookingTime && (
						<p className="mt-1 text-sm text-destructive">
							{errors.cookingTime.message}
						</p>
					)}
				</div>

				<div>
					<label
						htmlFor="difficulty"
						className="mb-1 block text-sm font-medium"
					>
						난이도
					</label>
					<select
						id="difficulty"
						{...register('difficulty')}
						className="w-full rounded-md border px-3 py-2"
					>
						<option value="Easy">Easy</option>
						<option value="Medium">Medium</option>
						<option value="Hard">Hard</option>
					</select>
				</div>
			</div>

			<IngredientFieldList
				fieldArray={ingredientFieldArray}
				register={register}
			/>
			{errors.ingredientList?.message && (
				<p className="text-sm text-destructive">
					{errors.ingredientList.message}
				</p>
			)}

			<button
				type="submit"
				disabled={isSubmitting}
				className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
			>
				{isSubmitting ? '저장 중...' : submitLabel}
			</button>
		</form>
	);
}
