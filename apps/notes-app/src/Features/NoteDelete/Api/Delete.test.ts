import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { deleteNote } from './Delete';

const server = setupServer(
  http.delete('/api/notes/:id', ({ params }) => {
    const { id } = params;

    if (id === 'nonexistent') {
      return HttpResponse.json(
        { error: 'Not Found', message: '노트를 찾을 수 없습니다.', statusCode: 404 },
        { status: 404 },
      );
    }

    return HttpResponse.json({ message: '노트가 삭제되었습니다.' });
  }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('deleteNote', () => {
  it('should send DELETE request and return success message', async () => {
    const result = await deleteNote('note-1');

    expect(result).toEqual({ message: '노트가 삭제되었습니다.' });
  });

  it('should throw error when note not found', async () => {
    await expect(deleteNote('nonexistent')).rejects.toEqual(
      expect.objectContaining({
        error: 'Not Found',
        statusCode: 404,
      }),
    );
  });
});
