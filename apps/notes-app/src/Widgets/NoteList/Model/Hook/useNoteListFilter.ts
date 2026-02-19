import { useNoteList } from '#/Entities/Note';
import { useFilterStore } from '#/Features/CategoryFilter';
import { ALL_CATEGORY_ID } from '#/Entities/Category';

export function useNoteListFilter() {
  const selectedCategoryId = useFilterStore((s) => s.selectedCategoryId);

  const categoryId = selectedCategoryId === ALL_CATEGORY_ID
    ? undefined
    : selectedCategoryId;

  return useNoteList({ categoryId });
}
