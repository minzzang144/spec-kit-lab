import { useParams, useNavigate } from 'react-router';
import { useNote } from '#/Entities/Note';
import { useCategoryList } from '#/Entities/Category';
import { NoteDetail } from '#/Widgets/NoteDetail';
import { ROUTES } from '#/Shared/Config';
import { Button } from '#/Shared/Ui';

export function NoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: note, isLoading, isError } = useNote(id ?? '');
  const { data: categoryList } = useCategoryList();

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

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate(ROUTES.HOME)}>
          ← 목록으로
        </Button>
      </div>
      <NoteDetail note={note} categoryName={categoryName} />
    </div>
  );
}
