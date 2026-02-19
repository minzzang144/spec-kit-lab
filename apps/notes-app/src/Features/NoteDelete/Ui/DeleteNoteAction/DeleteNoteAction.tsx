import { useDeleteNote } from '../../Model';
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '#/Shared/Ui';

type DeleteNoteActionProps = {
  noteId: string;
};

export function DeleteNoteAction({ noteId }: DeleteNoteActionProps) {
  const deleteNote = useDeleteNote(noteId);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          삭제
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>노트 삭제</DialogTitle>
          <DialogDescription>
            이 노트를 삭제하시겠습니까? 삭제된 노트는 복구할 수 없습니다.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">취소</Button>
          </DialogClose>
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
  );
}
