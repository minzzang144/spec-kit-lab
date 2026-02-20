import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import { NoteDetail } from '#/Widgets/NoteDetail';
import { NoteWrite } from '#/Widgets/NoteWrite';
import type { NoteFormData } from '#/Widgets/NoteWrite';

import { DeleteNoteAction } from '#/Features/NoteDelete';
import { useUpdateNote } from '#/Features/NoteWrite';

import { useCategoryList } from '#/Entities/Category';
import { useNote } from '#/Entities/Note';

import { ROUTES } from '#/Shared/Config';
import { Button } from '#/Shared/Ui';

export function NoteDetailPage() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const [isEditMode, setIsEditMode] = useState(false);

	const { data: note, isLoading, isError } = useNote(id ?? '');
	const { data: categoryList } = useCategoryList();
	const updateNote = useUpdateNote(id ?? '');

	if (isLoading) {
		return (
			<div className="mx-auto max-w-2xl p-8">
				<div className="h-8 w-48 animate-pulse rounded bg-muted" />
			</div>
		);
	}

	if (isError || !note) {
		return (
			<div className="mx-auto max-w-2xl p-8 text-center">
				<p className="mb-4 text-muted-foreground">
					노트를 찾을 수 없습니다.
				</p>
				<Button variant="outline" onClick={() => navigate(ROUTES.HOME)}>
					목록으로 돌아가기
				</Button>
			</div>
		);
	}

	const categoryName =
		categoryList?.find((c) => c.id === note.categoryId)?.name ?? '미분류';

	function handleSave(data: NoteFormData) {
		updateNote.mutate(data, {
			onSuccess: () => setIsEditMode(false),
		});
	}

	return (
		<div className="mx-auto max-w-2xl p-6">
			<div className="mb-6 flex items-center justify-between">
				<Button
					variant="ghost"
					size="sm"
					onClick={() => navigate(ROUTES.HOME)}
				>
					← 목록으로
				</Button>
				{!isEditMode && (
					<div className="flex gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => setIsEditMode(true)}
						>
							편집
						</Button>
						<DeleteNoteAction noteId={id ?? ''} />
					</div>
				)}
			</div>

			{isEditMode ? (
				<NoteWrite
					existingNote={note}
					onSubmit={handleSave}
					onCancel={() => setIsEditMode(false)}
					isSubmitting={updateNote.isPending}
					submitLabel="저장"
				/>
			) : (
				<NoteDetail note={note} categoryName={categoryName} />
			)}
		</div>
	);
}
