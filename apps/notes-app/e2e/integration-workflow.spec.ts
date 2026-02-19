import { test, expect } from '@playwright/test';

test.describe('E2E-INT-001: 전체 CRUD 워크플로우', () => {
  test('카테고리 생성 → 노트 작성 → 노트 편집 → 검색 → 삭제', async ({ page }) => {
    // 1. 카테고리 생성
    await page.goto('/categories');
    await page.getByLabel('새 카테고리 이름').fill('통합테스트');
    await page.getByRole('button', { name: '추가' }).click();
    await expect(page.locator('main').getByText('통합테스트').first()).toBeVisible();

    // 2. 노트 작성
    // page.goto()는 전체 리로드 → MSW DB 초기화됨
    // 소프트 내비게이션으로 이동: /categories → / → /notes/new
    await page.getByRole('link', { name: '내 노트' }).click();
    await page.waitForURL('http://localhost:5173/');
    await page.getByRole('link', { name: '새 노트 작성' }).click();
    await page.waitForURL('http://localhost:5173/notes/new');

    await page.getByLabel('제목').fill('통합테스트 노트');
    await page.getByLabel('내용').fill('통합테스트 노트 내용입니다');
    await page.getByRole('button', { name: '작성' }).click();

    await expect(page).toHaveURL('/');
    await expect(page.getByText('통합테스트 노트', { exact: true })).toBeVisible();

    // 3. 노트 편집
    await page.getByText('통합테스트 노트', { exact: true }).click();
    await page.getByRole('button', { name: '편집' }).click();
    await expect(page.getByLabel('제목')).not.toHaveValue('');

    await page.getByLabel('제목').fill('통합테스트 노트 수정됨');
    await page.getByRole('button', { name: '저장' }).click();
    // 저장 후 TanStack Query 리패치 완료까지 대기
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('통합테스트 노트 수정됨')).toBeVisible({ timeout: 10000 });

    // 4. 검색으로 노트 찾기
    // page.goto('/') 대신 소프트 내비게이션 (MSW 상태 유지)
    await page.getByRole('button', { name: '← 목록으로' }).click();
    await expect(page.locator('article[role="article"]').first()).toBeVisible();
    await page.getByPlaceholder('노트 검색...').fill('통합테스트');
    await page.waitForTimeout(600); // 300ms debounce + 여유
    await expect(page.getByText('통합테스트 노트 수정됨')).toBeVisible({ timeout: 5000 });

    // 5. 노트 삭제
    await page.getByText('통합테스트 노트 수정됨').click();
    await page.getByRole('button', { name: '삭제' }).click();
    await page.getByRole('button', { name: '삭제' }).last().click();

    await expect(page).toHaveURL('/');
    await expect(page.getByText('통합테스트 노트 수정됨')).not.toBeVisible();
  });
});
