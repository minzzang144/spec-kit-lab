import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test } from 'vitest';

import { useNoteStore } from '#/Entities/Note';

import { NoteSearch } from './NoteSearch';

describe('NoteSearch', () => {
	beforeEach(() => {
		useNoteStore.setState({ keyword: '' });
	});

	test('검색 입력창을 렌더링한다', () => {
		render(<NoteSearch />);
		expect(screen.getByPlaceholderText(/노트 검색/i)).toBeInTheDocument();
	});

	test('키워드 입력 시 clear 버튼이 표시된다', () => {
		render(<NoteSearch />);
		const input = screen.getByPlaceholderText(/노트 검색/i);

		fireEvent.change(input, { target: { value: '회의' } });

		expect(
			screen.getByRole('button', { name: /지우기/i }),
		).toBeInTheDocument();
	});

	test('키워드 없을 때 clear 버튼이 없다', () => {
		render(<NoteSearch />);

		expect(
			screen.queryByRole('button', { name: /지우기/i }),
		).not.toBeInTheDocument();
	});

	test('clear 버튼 클릭 시 입력값이 초기화된다', () => {
		render(<NoteSearch />);
		const input = screen.getByPlaceholderText(/노트 검색/i);

		fireEvent.change(input, { target: { value: '회의' } });
		expect(input).toHaveValue('회의');

		const clearButton = screen.getByRole('button', { name: /지우기/i });
		fireEvent.click(clearButton);

		expect(input).toHaveValue('');
		expect(
			screen.queryByRole('button', { name: /지우기/i }),
		).not.toBeInTheDocument();
	});
});
