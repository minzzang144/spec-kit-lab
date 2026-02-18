import type { Note } from '../../Type';
import { formatDate } from '#/Shared/Model';

type NoteCardProps = {
  note: Note;
  categoryName: string;
  onClick: () => void;
};

export function NoteCard({ note, categoryName, onClick }: NoteCardProps) {
  return (
    <article
      role="article"
      onClick={onClick}
      className="flex cursor-pointer flex-col gap-2 rounded-lg border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="line-clamp-1 flex-1 font-medium">{note.title}</h3>
        <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
          {categoryName}
        </span>
      </div>
      {note.content && (
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {note.content}
        </p>
      )}
      <time
        dateTime={note.createdAt}
        className="text-xs text-muted-foreground"
      >
        {formatDate(note.createdAt)}
      </time>
    </article>
  );
}
