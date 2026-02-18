import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { NoteCard } from './NoteCard';

const MOCK_NOTE = {
  id: '1',
  title: '테스트 노트 제목',
  content: '테스트 노트 내용',
  categoryId: 'cat-1',
  createdAt: '2026-02-10T09:00:00.000Z',
  updatedAt: '2026-02-10T09:00:00.000Z',
};

describe('NoteCard', () => {
  it('should render note title', () => {
    render(<NoteCard note={MOCK_NOTE} categoryName="업무" onClick={vi.fn()} />);

    expect(screen.getByText('테스트 노트 제목')).toBeInTheDocument();
  });

  it('should render category badge', () => {
    render(<NoteCard note={MOCK_NOTE} categoryName="업무" onClick={vi.fn()} />);

    expect(screen.getByText('업무')).toBeInTheDocument();
  });

  it('should render formatted createdAt date', () => {
    render(<NoteCard note={MOCK_NOTE} categoryName="업무" onClick={vi.fn()} />);

    expect(screen.getByText(/2026/)).toBeInTheDocument();
  });

  it('should call onClick when card is clicked', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(<NoteCard note={MOCK_NOTE} categoryName="업무" onClick={handleClick} />);

    await user.click(screen.getByRole('article'));

    expect(handleClick).toHaveBeenCalled();
  });
});
