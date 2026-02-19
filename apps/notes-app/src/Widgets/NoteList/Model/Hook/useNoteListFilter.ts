import { useNoteList } from '#/Entities/Note';
import { useCategoryFilterStore } from '#/Features/CategoryFilter';
import { useNoteSearchStore } from '#/Features/NoteSearch';
import { ALL_CATEGORY_ID } from '#/Entities/Category';

export function useNoteListFilter() {
  const selectedCategoryId = useCategoryFilterStore((s) => s.selectedCategoryId);
  const keyword = useNoteSearchStore((s) => s.keyword);

  const categoryId = selectedCategoryId === ALL_CATEGORY_ID
    ? undefined
    : selectedCategoryId;

  return useNoteList({ categoryId, keyword: keyword || undefined });
}
