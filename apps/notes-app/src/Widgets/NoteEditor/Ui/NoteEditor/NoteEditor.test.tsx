import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { NoteEditor } from './NoteEditor';
import { useNoteForm } from '../../Model';

const MOCK_CATEGORY_LIST = [
  { id: 'uncategorized', name: '미분류', isDefault: true },
  { id: 'cat-1', name: '업무', isDefault: false },
  { id: 'cat-2', name: '학습', isDefault: false },
];

const server = setupServer(
  http.get('/api/categories', () =>
    HttpResponse.json({ data: MOCK_CATEGORY_LIST }),
  ),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
}

function NoteEditorTestWrapper({
  onSubmit = vi.fn(),
  onCancel = vi.fn(),
}: {
  onSubmit?: (data: unknown) => void;
  onCancel?: () => void;
}) {
  const form = useNoteForm();
  return (
    <NoteEditor
      form={form}
      onSubmit={onSubmit}
      onCancel={onCancel}
    />
  );
}

function renderWithProvider(ui: React.ReactElement) {
  const queryClient = createQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

describe('NoteEditor', () => {
  it('should render title input, content textarea, and buttons', () => {
    renderWithProvider(<NoteEditorTestWrapper />);

    expect(screen.getByLabelText('제목')).toBeInTheDocument();
    expect(screen.getByLabelText('내용')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '저장' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
  });

  it('should show validation error when title is empty', async () => {
    const user = userEvent.setup();
    renderWithProvider(<NoteEditorTestWrapper />);

    await user.click(screen.getByRole('button', { name: '저장' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('제목을 입력해주세요');
    });
  });

  it('should call onSubmit with form data when valid', async () => {
    const handleSubmit = vi.fn();
    const user = userEvent.setup();
    renderWithProvider(<NoteEditorTestWrapper onSubmit={handleSubmit} />);

    await user.type(screen.getByLabelText('제목'), '테스트 노트');
    await user.type(screen.getByLabelText('내용'), '테스트 내용');
    await user.click(screen.getByRole('button', { name: '저장' }));

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: '테스트 노트',
          content: '테스트 내용',
        }),
        expect.anything(),
      );
    });
  });

  it('should call onCancel when cancel button is clicked', async () => {
    const handleCancel = vi.fn();
    const user = userEvent.setup();
    renderWithProvider(<NoteEditorTestWrapper onCancel={handleCancel} />);

    await user.click(screen.getByRole('button', { name: '취소' }));

    expect(handleCancel).toHaveBeenCalled();
  });

  it('should render category select with options from API', async () => {
    renderWithProvider(<NoteEditorTestWrapper />);

    await waitFor(() => {
      expect(screen.getByLabelText('카테고리 선택')).toBeInTheDocument();
    });
  });
});
