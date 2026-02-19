import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { NoteDetail } from './NoteDetail';

const MOCK_NOTE = {
  id: '1',
  title: '테스트 노트 제목',
  content: '테스트 노트 본문 내용입니다. 충분히 긴 내용.',
  categoryId: 'cat-1',
  createdAt: '2026-02-10T09:00:00.000Z',
  updatedAt: '2026-02-12T15:00:00.000Z',
};

describe('NoteDetail', () => {
  it('should render note title', () => {
    render(<NoteDetail note={MOCK_NOTE} categoryName="업무" />);

    expect(screen.getByRole('heading', { name: '테스트 노트 제목' })).toBeInTheDocument();
  });

  it('should render note content', () => {
    render(<NoteDetail note={MOCK_NOTE} categoryName="업무" />);

    expect(screen.getByText('테스트 노트 본문 내용입니다. 충분히 긴 내용.')).toBeInTheDocument();
  });

  it('should render category badge', () => {
    render(<NoteDetail note={MOCK_NOTE} categoryName="업무" />);

    expect(screen.getByText('업무')).toBeInTheDocument();
  });

  it('should render createdAt date', () => {
    render(<NoteDetail note={MOCK_NOTE} categoryName="업무" />);

    expect(screen.getAllByText(/2026/).length).toBeGreaterThan(0);
  });

  it('should render updatedAt label when different from createdAt', () => {
    render(<NoteDetail note={MOCK_NOTE} categoryName="업무" />);

    expect(screen.getByText(/수정/)).toBeInTheDocument();
  });
});
