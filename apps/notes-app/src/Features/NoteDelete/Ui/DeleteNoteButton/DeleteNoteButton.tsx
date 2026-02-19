import { useState } from 'react';
import { useDeleteNote } from '../../Model';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/Shared/Ui';

type DeleteNoteButtonProps = {
  noteId: string;
};

export function DeleteNoteButton({ noteId }: DeleteNoteButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const deleteNote = useDeleteNote(noteId);

  return (
    <>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => setIsOpen(true)}
      >
        삭제
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>노트 삭제</DialogTitle>
            <DialogDescription>
              이 노트를 삭제하시겠습니까? 삭제된 노트는 복구할 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteNote.mutate()}
              disabled={deleteNote.isPending}
            >
              {deleteNote.isPending ? '삭제 중...' : '삭제'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
