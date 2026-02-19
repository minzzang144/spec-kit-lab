import { useNavigate } from 'react-router';
import { NoteContentPreview, NoteDate } from '#/Entities/Note';
import type { Note } from '#/Entities/Note';
import { CategoryBadge } from '#/Entities/Category';
import { noteViewPath } from '#/Shared/Config';

type NoteListItemProps = {
  note: Note;
  categoryName: string;
};

export function NoteListItem({ note, categoryName }: NoteListItemProps) {
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
