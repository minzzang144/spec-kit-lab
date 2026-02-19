import { ALL_CATEGORY_ID } from '#/Entities/Category';
import { useCategoryFilterStore } from '../Store';

export function useCategoryFilter() {
  const selectedCategoryId = useCategoryFilterStore((s) => s.selectedCategoryId);
  const setSelectedCategoryId = useCategoryFilterStore((s) => s.setSelectedCategoryId);
  const isAllSelected = selectedCategoryId === ALL_CATEGORY_ID;

  return { selectedCategoryId, setSelectedCategoryId, isAllSelected };
}
