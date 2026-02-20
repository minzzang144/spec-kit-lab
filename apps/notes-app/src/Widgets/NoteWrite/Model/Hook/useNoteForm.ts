import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import type { Note } from '#/Entities/Note';
import {
	NOTE_CONTENT_MAX_LENGTH,
	NOTE_TITLE_MAX_LENGTH,
} from '#/Entities/Note';

export const noteFormSchema = z.object({
	title: z
		.string()
		.min(1, '제목을 입력해주세요')
		.max(
			NOTE_TITLE_MAX_LENGTH,
			`제목은 최대 ${NOTE_TITLE_MAX_LENGTH}자까지 입력 가능합니다`,
		),
	content: z
		.string()
		.max(
			NOTE_CONTENT_MAX_LENGTH,
			`본문은 최대 ${NOTE_CONTENT_MAX_LENGTH}자까지 입력 가능합니다`,
		)
		.default(''),
	categoryId: z.string().optional(),
});

export type NoteFormData = z.infer<typeof noteFormSchema>;

type UseNoteFormParam = {
	defaultValue?: Partial<NoteFormData>;
	existingNote?: Note;
};

export function useNoteForm(param?: UseNoteFormParam) {
	const { defaultValue, existingNote } = param ?? {};

	return useForm<NoteFormData>({
		resolver: zodResolver(noteFormSchema),
		defaultValues: {
			title: existingNote?.title ?? defaultValue?.title ?? '',
			content: existingNote?.content ?? defaultValue?.content ?? '',
			categoryId:
				existingNote?.categoryId ??
				defaultValue?.categoryId ??
				undefined,
		},
	});
}
