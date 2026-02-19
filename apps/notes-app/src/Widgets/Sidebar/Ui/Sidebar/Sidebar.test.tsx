import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { Sidebar } from './Sidebar';

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

function renderSidebar() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <Sidebar />
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

describe('Sidebar', () => {
  test('네비게이션 링크를 렌더링한다', () => {
    renderSidebar();

    expect(screen.getByRole('link', { name: /내 노트/i })).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /카테고리 관리/i }),
    ).toBeInTheDocument();
  });

  test('카테고리 목록을 렌더링한다', async () => {
    renderSidebar();

    await waitFor(() => {
      expect(screen.getByText('업무')).toBeInTheDocument();
      expect(screen.getByText('학습')).toBeInTheDocument();
    });
  });

  test('모바일 사이드바 토글 버튼이 있다', () => {
    renderSidebar();

    expect(
      screen.getByRole('button', { name: /사이드바 열기/i }),
    ).toBeInTheDocument();
  });

  test('사이드바 열기 버튼 클릭 시 닫기 버튼이 표시된다', async () => {
    renderSidebar();

    const openButton = screen.getByRole('button', { name: /사이드바 열기/i });
    fireEvent.click(openButton);

    expect(
      screen.getByRole('button', { name: /사이드바 닫기/i }),
    ).toBeInTheDocument();
  });
});
