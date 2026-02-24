import { useCategoryStore } from '#/Entities/Category';

const ALL_CATEGORY_ID = null;

export function useCategoryFilter() {
	const selectedCategoryId = useCategoryStore((s) => s.selectedCategoryId);
	const setSelectedCategoryId = useCategoryStore(
		(s) => s.setSelectedCategoryId,
	);
	const isAllSelected = selectedCategoryId === ALL_CATEGORY_ID;

	return { selectedCategoryId, setSelectedCategoryId, isAllSelected };
}
