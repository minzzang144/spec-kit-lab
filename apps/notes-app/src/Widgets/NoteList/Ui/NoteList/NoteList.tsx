import { useNavigate } from 'react-router';
import { useNoteList, NoteCard, EmptyNoteState } from '#/Entities/Note';
import type { Note } from '#/Entities/Note';
import { useCategoryList } from '#/Entities/Category';
import { noteViewPath } from '#/Shared/Config';
import { NoteListLoading } from './NoteList.loading';

export function NoteList() {
  const { data: noteList, isLoading } = useNoteList();
  const { data: categoryList } = useCategoryList();

  if (isLoading) {
    return <NoteListLoading />;
  }

  if (!noteList || noteList.length === 0) {
    return <EmptyNoteState />;
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

function NoteListItem({
  note,
  categoryName,
}: {
  note: Note;
  categoryName: string;
}) {
  const navigate = useNavigate();

  return (
    <li>
      <NoteCard
        note={note}
        categoryName={categoryName}
        onClick={() => navigate(noteViewPath(note.id))}
      />
    </li>
  );
}
