import { useCategoryList, ALL_CATEGORY_ID } from '#/Entities/Category';
import { useFilterStore } from '../Store';

export function useCategoryFilter() {
  const { data: categoryList } = useCategoryList();
  const selectedCategoryId = useFilterStore((s) => s.selectedCategoryId);
  const setSelectedCategoryId = useFilterStore((s) => s.setSelectedCategoryId);

  return {
    categoryList,
    selectedCategoryId,
    setSelectedCategoryId,
    isAllSelected: selectedCategoryId === ALL_CATEGORY_ID,
  };
}
