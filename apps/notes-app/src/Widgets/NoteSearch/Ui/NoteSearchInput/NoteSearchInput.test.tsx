import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, beforeEach } from 'vitest';
import { NoteSearchInput } from './NoteSearchInput';
import { useNoteStore } from '#/Entities/Note';

describe('NoteSearchInput', () => {
  beforeEach(() => {
    useNoteStore.setState({ keyword: '' });
  });

  test('검색 입력창을 렌더링한다', () => {
    render(<NoteSearchInput />);
    expect(screen.getByPlaceholderText(/노트 검색/i)).toBeInTheDocument();
  });

  test('키워드 입력 시 clear 버튼이 표시된다', () => {
    render(<NoteSearchInput />);
    const input = screen.getByPlaceholderText(/노트 검색/i);

    fireEvent.change(input, { target: { value: '회의' } });

    expect(screen.getByRole('button', { name: /지우기/i })).toBeInTheDocument();
  });

  test('키워드 없을 때 clear 버튼이 없다', () => {
    render(<NoteSearchInput />);

    expect(screen.queryByRole('button', { name: /지우기/i })).not.toBeInTheDocument();
  });

  test('clear 버튼 클릭 시 입력값이 초기화된다', () => {
    render(<NoteSearchInput />);
    const input = screen.getByPlaceholderText(/노트 검색/i);

    fireEvent.change(input, { target: { value: '회의' } });
    expect(input).toHaveValue('회의');

    const clearButton = screen.getByRole('button', { name: /지우기/i });
    fireEvent.click(clearButton);

    expect(input).toHaveValue('');
    expect(screen.queryByRole('button', { name: /지우기/i })).not.toBeInTheDocument();
  });
});
