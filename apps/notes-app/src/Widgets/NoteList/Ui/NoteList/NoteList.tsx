import { useNavigate } from 'react-router';
import { useNoteList, NoteContentPreview, NoteDate } from '#/Entities/Note';
import type { Note } from '#/Entities/Note';
import { useCategoryList, CategoryBadge } from '#/Entities/Category';
import { noteViewPath } from '#/Shared/Config';
import { NoteListLoading } from './NoteList.loading';
import { NoteListEmpty } from './NoteListEmpty';

export function NoteList() {
  const { data: noteList, isLoading } = useNoteList();
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
      <article
        role="article"
        onClick={() => navigate(noteViewPath(note.id))}
        className="flex cursor-pointer flex-col gap-2 rounded-lg border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
      >
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 flex-1 font-medium">{note.title}</h3>
          <CategoryBadge name={categoryName} />
        </div>
        <NoteContentPreview content={note.content} />
        <NoteDate isoDate={note.createdAt} />
      </article>
    </li>
  );
}
