import { Link } from 'react-router';
import { NoteContentPreview, NoteDate } from '#/Entities/Note';
import type { Note } from '#/Entities/Note';
import { CategoryBadge } from '#/Entities/Category';
import { noteViewPath } from '#/Shared/Config';

type NoteListItemProps = {
  readonly note: Note;
  readonly categoryName: string;
};

export function NoteListItem({ note, categoryName }: NoteListItemProps) {
  return (
    <li>
      <Link to={noteViewPath(note.id)} aria-label={`노트: ${note.title}`} className="block">
        <article
          role="article"
          className="flex cursor-pointer flex-col gap-2 rounded-lg border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-1 flex-1 font-medium">{note.title}</h3>
            <CategoryBadge name={categoryName} />
          </div>
          <NoteContentPreview content={note.content} />
          <NoteDate isoDate={note.createdAt} />
        </article>
      </Link>
    </li>
  );
}
