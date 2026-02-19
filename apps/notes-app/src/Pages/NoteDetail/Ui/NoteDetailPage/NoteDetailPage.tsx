import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useNote } from '#/Entities/Note';
import { useCategoryList } from '#/Entities/Category';
import { useUpdateNote } from '#/Features/NoteWrite';
import { useDeleteNote } from '#/Features/NoteDelete';
import { NoteDetail } from '#/Widgets/NoteDetail';
import { NoteWrite, useNoteForm } from '#/Widgets/NoteWrite';
import type { NoteFormData } from '#/Widgets/NoteWrite';
import { ROUTES } from '#/Shared/Config';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/Shared/Ui';

export function NoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data: note, isLoading, isError } = useNote(id ?? '');
  const { data: categoryList } = useCategoryList();
  const updateNote = useUpdateNote(id ?? '');
  const deleteNote = useDeleteNote(id ?? '');
  const form = useNoteForm({ existingNote: note });

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

  function handleDeleteConfirm() {
    deleteNote.mutate();
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
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              삭제
            </Button>
          </div>
        )}
      </div>

      {isEditMode ? (
        <NoteWrite
          form={form}
          onSubmit={handleSave}
          onCancel={() => setIsEditMode(false)}
          isSubmitting={updateNote.isPending}
          submitLabel="저장"
        />
      ) : (
        <NoteDetail note={note} categoryName={categoryName} />
      )}

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>노트 삭제</DialogTitle>
            <DialogDescription>
              이 노트를 삭제하시겠습니까? 삭제된 노트는 복구할 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteNote.isPending}
            >
              {deleteNote.isPending ? '삭제 중...' : '삭제'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
