import { useCategoryStore } from '#/Entities/Category';

import { useCategoryFilterLogic } from '../Logic';

const ALL_CATEGORY_ID = null;

export function useCategoryFilter() {
	const selectedCategoryId = useCategoryStore(
		(s) => s.selectedCategoryId,
	);
	const { setSelectedCategoryId } = useCategoryFilterLogic();
	const isAllSelected = selectedCategoryId === ALL_CATEGORY_ID;

	return { selectedCategoryId, setSelectedCategoryId, isAllSelected };
}
