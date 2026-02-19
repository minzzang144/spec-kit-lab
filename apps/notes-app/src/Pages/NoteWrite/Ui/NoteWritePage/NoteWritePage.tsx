import { useNavigate } from 'react-router';
import { useCreateNote } from '#/Features/NoteWrite';
import { NoteWrite } from '#/Widgets/NoteWrite';
import type { NoteFormData } from '#/Widgets/NoteWrite';
import { ROUTES } from '#/Shared/Config';

export function NoteWritePage() {
  const navigate = useNavigate();
  const createNote = useCreateNote();

  function handleSubmit(data: NoteFormData) {
    createNote.mutate({
      title: data.title,
      content: data.content,
      categoryId: data.categoryId,
    });
  }

  function handleCancel() {
    navigate(ROUTES.HOME);
  }

  return (
    <div className="mx-auto max-w-2xl p-8">
      <h1 className="mb-6 text-2xl font-bold">새 노트 작성</h1>
      <NoteWrite
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={createNote.isPending}
        submitLabel="작성"
      />
    </div>
  );
}
