import { http, HttpResponse } from 'msw';
import {
  getNoteList,
  addNote,
  updateNote,
  deleteNote,
} from './mockStore';

export const noteReadHandler = [
  http.get('/api/notes', ({ request }) => {
    const url = new URL(request.url);
    const categoryId = url.searchParams.get('categoryId');
    const keyword = url.searchParams.get('keyword');
    const sort = url.searchParams.get('sort') ?? 'createdAt_desc';

    let result = [...getNoteList()];

    if (categoryId && categoryId !== 'all') {
      result = result.filter((note) => note.categoryId === categoryId);
    }

    if (keyword) {
      const lowerKeyword = keyword.toLowerCase();
      result = result.filter(
        (note) =>
          note.title.toLowerCase().includes(lowerKeyword) ||
          note.content.toLowerCase().includes(lowerKeyword),
      );
    }

    if (sort === 'createdAt_desc') {
      result.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    } else {
      result.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    }

    return HttpResponse.json({ data: result });
  }),

  http.get('/api/notes/:id', ({ params }) => {
    const { id } = params;
    const note = getNoteList().find((n) => n.id === id);

    if (!note) {
      return HttpResponse.json(
        { error: 'Not Found', message: '노트를 찾을 수 없습니다.', statusCode: 404 },
        { status: 404 },
      );
    }

    return HttpResponse.json({ data: note });
  }),
];

export const noteWriteHandler = [
  http.post('/api/notes', async ({ request }) => {
    const body = (await request.json()) as {
      title?: string;
      content?: string;
      categoryId?: string;
    };

    if (!body.title || body.title.trim().length === 0) {
      return HttpResponse.json(
        { error: 'Bad Request', message: '제목을 입력해주세요.', statusCode: 400 },
        { status: 400 },
      );
    }

    const newNote = addNote({
      title: body.title.trim(),
      content: body.content ?? '',
      categoryId: body.categoryId ?? 'uncategorized',
    });

    return HttpResponse.json({ data: newNote }, { status: 201 });
  }),

  http.put('/api/notes/:id', async ({ params, request }) => {
    const { id } = params;
    const body = (await request.json()) as {
      title?: string;
      content?: string;
      categoryId?: string;
    };

    if (body.title !== undefined && body.title.trim().length === 0) {
      return HttpResponse.json(
        { error: 'Bad Request', message: '제목을 입력해주세요.', statusCode: 400 },
        { status: 400 },
      );
    }

    const patch: Record<string, string> = {};
    if (body.title !== undefined) patch.title = body.title.trim();
    if (body.content !== undefined) patch.content = body.content;
    if (body.categoryId !== undefined) patch.categoryId = body.categoryId;

    const updated = updateNote(id as string, patch);

    if (!updated) {
      return HttpResponse.json(
        { error: 'Not Found', message: '노트를 찾을 수 없습니다.', statusCode: 404 },
        { status: 404 },
      );
    }

    return HttpResponse.json({ data: updated });
  }),

  http.delete('/api/notes/:id', ({ params }) => {
    const { id } = params;
    const deleted = deleteNote(id as string);

    if (!deleted) {
      return HttpResponse.json(
        { error: 'Not Found', message: '노트를 찾을 수 없습니다.', statusCode: 404 },
        { status: 404 },
      );
    }

    return HttpResponse.json({ message: '노트가 삭제되었습니다.' });
  }),
];
