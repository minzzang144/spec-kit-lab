import { test, expect } from '@playwright/test';

test.describe('US3: 노트 상세 보기', () => {
  test('E2E-US3-001: 목록에서 노트 클릭 시 상세 화면에 모든 필드 표시', async ({ page }) => {
    await page.goto('/');

    const firstNoteCard = page.locator('article[role="article"]').first();
    await expect(firstNoteCard).toBeVisible();

    const titleText = await firstNoteCard.locator('h3').textContent();
    await firstNoteCard.click();

    await expect(page).toHaveURL(/\/notes\/\d+/);

    // 제목 표시
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(titleText ?? '');

    // 본문 컨테이너 표시
    await expect(page.locator('article')).toBeVisible();
  });

  test('E2E-US3-002: 상세 페이지에서 "목록으로" 버튼 클릭 시 목록으로 이동', async ({ page }) => {
    await page.goto('/');

    await page.locator('article[role="article"]').first().click();
    await expect(page).toHaveURL(/\/notes\/\d+/);

    await page.getByRole('button', { name: /목록으로/ }).click();

    await expect(page).toHaveURL('/');
  });

  test('E2E-US3-003: 존재하지 않는 노트 ID 접근 시 에러 상태 표시', async ({ page }) => {
    await page.goto('/notes/nonexistent-id');

    await expect(page.getByText('노트를 찾을 수 없습니다.')).toBeVisible();
    await expect(page.getByRole('button', { name: '목록으로 돌아가기' })).toBeVisible();
  });
});
