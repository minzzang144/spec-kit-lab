export const ROUTES = {
  HOME: '/',
  NOTE_WRITE: '/notes/new',
  NOTE_VIEW: '/notes/:id',
  CATEGORY_MANAGE: '/categories',
} as const;

export function noteViewPath(id: string): string {
  return `/notes/${id}`;
}
