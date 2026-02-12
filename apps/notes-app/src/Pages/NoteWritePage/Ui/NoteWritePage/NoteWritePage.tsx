import { useNavigate } from 'react-router';
import { useCreateNote } from '#/Features/NoteWrite';
import { NoteEditor, useNoteForm } from '#/Widgets/NoteEditor';
import type { NoteFormData } from '#/Widgets/NoteEditor';
import { ROUTES } from '#/Shared/Config';

export function NoteWritePage() {
  const navigate = useNavigate();
  const createNote = useCreateNote();
  const form = useNoteForm();

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
      <NoteEditor
        form={form}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={createNote.isPending}
        submitLabel="작성"
      />
    </div>
  );
}
