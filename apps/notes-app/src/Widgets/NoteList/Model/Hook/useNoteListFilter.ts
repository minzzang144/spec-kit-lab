import { useNoteList } from '#/Entities/Note';
import { useCategoryStore } from '#/Entities/Category';
import { useNoteStore } from '#/Entities/Note';
import { ALL_CATEGORY_ID } from '#/Entities/Category';

export function useNoteListFilter() {
  const selectedCategoryId = useCategoryStore((s) => s.selectedCategoryId);
  const keyword = useNoteStore((s) => s.keyword);

  const categoryId = selectedCategoryId === ALL_CATEGORY_ID
    ? undefined
    : selectedCategoryId;

  return useNoteList({ categoryId, keyword: keyword || undefined });
}
