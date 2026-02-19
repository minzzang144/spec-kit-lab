import { Link, useNavigate } from 'react-router';
import { useCategoryList, ALL_CATEGORY_ID } from '#/Entities/Category';
import { useCategoryFilterLogic } from '#/Features/CategoryFilter';
import { ROUTES } from '#/Shared/Config';
import { Button } from '#/Shared/Ui';
import { useSidebarState } from '../../Model';

export function Sidebar() {
  const { isOpen, open, close } = useSidebarState();
  const { data: categoryList } = useCategoryList();
  const { setSelectedCategoryId } = useCategoryFilterLogic();
  const navigate = useNavigate();

  function handleCategoryClick(categoryId: string) {
    setSelectedCategoryId(categoryId);
    navigate(ROUTES.HOME);
    close();
  }

  function handleAllNotesClick() {
    setSelectedCategoryId(ALL_CATEGORY_ID);
    close();
  }

  return (
    <>
      {/* 모바일 오버레이 */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={close}
          aria-hidden="true"
        />
      )}

      {/* 사이드바 패널 */}
      <aside
        className={[
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-background transition-transform duration-200',
          'md:relative md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between border-b p-4">
          <span className="font-semibold">노트 앱</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={close}
            aria-label="사이드바 닫기"
            className="md:hidden"
          >
            ✕
          </Button>
        </div>

        {/* 네비게이션 */}
        <nav className="flex flex-col gap-1 p-3">
          <Link
            to={ROUTES.HOME}
            onClick={handleAllNotesClick}
            className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
          >
            내 노트
          </Link>
          <Link
            to={ROUTES.CATEGORY_MANAGE}
            onClick={close}
            className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
          >
            카테고리 관리
          </Link>
        </nav>

        {/* 카테고리 목록 */}
        {categoryList && categoryList.length > 0 && (
          <div className="border-t p-3">
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              카테고리
            </p>
            <div className="flex flex-col gap-1">
              {categoryList.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  className="rounded-md px-3 py-2 text-left text-sm hover:bg-accent"
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </aside>

      {/* 모바일 토글 버튼 (사이드바 닫혀있을 때) */}
      {!isOpen && (
        <Button
          variant="ghost"
          size="sm"
          onClick={open}
          aria-label="사이드바 열기"
          className="fixed left-3 top-3 z-30 h-9 w-9 p-0 md:hidden"
        >
          ☰
        </Button>
      )}
    </>
  );
}
