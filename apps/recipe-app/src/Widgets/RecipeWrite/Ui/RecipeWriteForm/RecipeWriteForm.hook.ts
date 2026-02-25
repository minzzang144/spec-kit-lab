import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';

const ingredientSchema = z.object({
	name: z.string().min(1, '재료명을 입력하세요'),
	amount: z.number().positive('양은 0보다 커야 합니다'),
	unit: z.string().min(1, '단위를 선택하세요'),
});

const recipeFormSchema = z.object({
	title: z
		.string()
		.min(1, '제목을 입력하세요')
		.max(100, '제목은 100자 이내로 입력하세요'),
	description: z
		.string()
		.min(1, '설명을 입력하세요')
		.max(2000, '설명은 2000자 이내로 입력하세요'),
	categoryId: z.string().min(1, '카테고리를 선택하세요'),
	cookingTime: z.number().int().positive('조리 시간은 1분 이상이어야 합니다'),
	difficulty: z.enum(['Easy', 'Medium', 'Hard'], {
		errorMap: () => ({ message: '난이도를 선택하세요' }),
	}),
	ingredientList: z
		.array(ingredientSchema)
		.min(1, '재료를 1개 이상 추가하세요')
		.max(50, '재료는 50개까지만 추가할 수 있습니다'),
});

export type RecipeFormValue = z.infer<typeof recipeFormSchema>;

const DEFAULT_FORM_VALUE: RecipeFormValue = {
	title: '',
	description: '',
	categoryId: '',
	cookingTime: 0,
	difficulty: 'Easy',
	ingredientList: [{ name: '', amount: 0, unit: 'g' }],
};

export function useRecipeWriteForm(defaultValue?: Partial<RecipeFormValue>) {
	const form = useForm<RecipeFormValue>({
		resolver: zodResolver(recipeFormSchema),
		defaultValues: { ...DEFAULT_FORM_VALUE, ...defaultValue },
	});

	const ingredientFieldArray = useFieldArray({
		control: form.control,
		name: 'ingredientList',
	});

	return { form, ingredientFieldArray };
}
