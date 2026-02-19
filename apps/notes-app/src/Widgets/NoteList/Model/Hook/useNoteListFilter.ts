import { useNoteList } from '#/Entities/Note';
import { useCategoryFilterStore } from '#/Features/CategoryFilter';
import { ALL_CATEGORY_ID } from '#/Entities/Category';

export function useNoteListFilter() {
  const selectedCategoryId = useCategoryFilterStore((s) => s.selectedCategoryId);

  const categoryId = selectedCategoryId === ALL_CATEGORY_ID
    ? undefined
    : selectedCategoryId;

  return useNoteList({ categoryId });
}
