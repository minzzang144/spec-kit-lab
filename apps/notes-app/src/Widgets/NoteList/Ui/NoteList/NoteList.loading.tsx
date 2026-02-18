const SKELETON_COUNT = 4;

export function NoteListLoading() {
  return (
    <ul className="flex flex-col gap-3">
      {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
        <li
          key={index}
          data-testid="note-card-skeleton"
          className="h-24 animate-pulse rounded-lg border bg-muted"
        />
      ))}
    </ul>
  );
}
