import { Link } from 'react-router';
import { ROUTES } from '#/Shared/Config';

export function NoteListEmpty() {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center text-muted-foreground">
      <p className="text-lg">아직 작성된 노트가 없습니다</p>
      <Link
        to={ROUTES.NOTE_WRITE}
        className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
      >
        첫 노트 작성하기
      </Link>
    </div>
  );
}
