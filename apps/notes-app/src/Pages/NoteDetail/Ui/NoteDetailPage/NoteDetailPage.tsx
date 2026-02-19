import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useNote } from '#/Entities/Note';
import type { Note } from '#/Entities/Note';
import { useCategoryList } from '#/Entities/Category';
import { useUpdateNote } from '#/Features/NoteWrite';
import { DeleteNoteAction } from '#/Features/NoteDelete';
import { NoteDetail } from '#/Widgets/NoteDetail';
import { NoteWrite, useNoteForm } from '#/Widgets/NoteWrite';
import type { NoteFormData } from '#/Widgets/NoteWrite';
import { ROUTES } from '#/Shared/Config';
import { Button } from '#/Shared/Ui';

type NoteEditSectionProps = {
  readonly note: Note;
  readonly onSave: (data: NoteFormData) => void;
  readonly onCancel: () => void;
  readonly isSubmitting: boolean;
};

// note가 확실히 로드된 후에만 마운트 → useNoteForm defaultValues 정상 동작
function NoteEditSection({ note, onSave, onCancel, isSubmitting }: NoteEditSectionProps) {
  const form = useNoteForm({ existingNote: note });
  return (
    <NoteWrite
      form={form}
      onSubmit={onSave}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
      submitLabel="저장"
    />
  );
}

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
        <p className="mb-4 text-muted-foreground">노트를 찾을 수 없습니다.</p>
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
        <Button variant="ghost" size="sm" onClick={() => navigate(ROUTES.HOME)}>
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
        <NoteEditSection
          note={note}
          onSave={handleSave}
          onCancel={() => setIsEditMode(false)}
          isSubmitting={updateNote.isPending}
        />
      ) : (
        <NoteDetail note={note} categoryName={categoryName} />
      )}
    </div>
  );
}
