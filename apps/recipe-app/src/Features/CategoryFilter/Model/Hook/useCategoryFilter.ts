import { useCategoryFilterStore } from '../Store';

const ALL_CATEGORY_ID = null;

export function useCategoryFilter() {
	const selectedCategoryId = useCategoryFilterStore(
		(s) => s.selectedCategoryId,
	);
	const setSelectedCategoryId = useCategoryFilterStore(
		(s) => s.setSelectedCategoryId,
	);
	const isAllSelected = selectedCategoryId === ALL_CATEGORY_ID;

	return { selectedCategoryId, setSelectedCategoryId, isAllSelected };
}
