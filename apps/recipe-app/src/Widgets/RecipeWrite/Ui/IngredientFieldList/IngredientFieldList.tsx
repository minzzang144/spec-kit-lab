import type { UseFieldArrayReturn, UseFormRegister } from 'react-hook-form';

import { INGREDIENT_UNIT_LIST } from '#/Shared/Config';

import type { RecipeFormValue } from '../RecipeWriteForm/RecipeWriteForm.hook';

type IngredientFieldListProps = {
	readonly fieldArray: UseFieldArrayReturn<RecipeFormValue, 'ingredientList'>;
	readonly register: UseFormRegister<RecipeFormValue>;
};

export function IngredientFieldList({
	fieldArray,
	register,
}: IngredientFieldListProps) {
	const { fields, append, remove } = fieldArray;

	return (
		<div>
			<div className="mb-2 flex items-center justify-between">
				<label className="text-sm font-medium">재료</label>
				<button
					type="button"
					onClick={() => append({ name: '', amount: 0, unit: 'g' })}
					className="text-sm text-primary hover:underline"
				>
					+ 재료 추가
				</button>
			</div>
			<div className="space-y-2">
				{fields.map((field, index) => (
					<div key={field.id} className="flex items-center gap-2">
						<input
							{...register(`ingredientList.${index}.name`)}
							placeholder="재료명"
							className="flex-1 rounded-md border px-3 py-2 text-sm"
						/>
						<input
							{...register(`ingredientList.${index}.amount`, {
								valueAsNumber: true,
							})}
							type="number"
							placeholder="양"
							className="w-20 rounded-md border px-3 py-2 text-sm"
						/>
						<select
							{...register(`ingredientList.${index}.unit`)}
							className="w-24 rounded-md border px-3 py-2 text-sm"
						>
							{INGREDIENT_UNIT_LIST.map((unit) => (
								<option key={unit} value={unit}>
									{unit}
								</option>
							))}
						</select>
						{fields.length > 1 && (
							<button
								type="button"
								onClick={() => remove(index)}
								className="text-sm text-destructive hover:underline"
							>
								삭제
							</button>
						)}
					</div>
				))}
			</div>
		</div>
	);
}
