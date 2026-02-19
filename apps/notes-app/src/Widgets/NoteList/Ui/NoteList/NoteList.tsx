import { useCategoryList } from '#/Entities/Category';
import { useNoteListFilter } from '../../Model';
import { NoteListLoading } from './NoteList.loading';
import { NoteListEmpty } from '../NoteListEmpty';
import { NoteListItem } from '../NoteListItem';

export function NoteList() {
  const { data: noteList, isLoading } = useNoteListFilter();
  const { data: categoryList } = useCategoryList();

  if (isLoading) {
    return <NoteListLoading />;
  }

  if (!noteList || noteList.length === 0) {
    return <NoteListEmpty />;
  }

  function getCategoryName(categoryId: string): string {
    return categoryList?.find((c) => c.id === categoryId)?.name ?? '미분류';
  }

  return (
    <ul className="flex flex-col gap-3">
      {noteList.map((note) => (
        <NoteListItem
          key={note.id}
          note={note}
          categoryName={getCategoryName(note.categoryId)}
        />
      ))}
    </ul>
  );
}
