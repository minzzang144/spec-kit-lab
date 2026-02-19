import { test, expect } from '@playwright/test';

test.describe('US7: 카테고리별 노트 필터링', () => {
  test('E2E-US7-001: 카테고리 필터 선택 시 해당 카테고리 노트만 표시', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('article[role="article"]').first()).toBeVisible();
    const allCount = await page.locator('article[role="article"]').count();

    await page.getByRole('button', { name: '업무' }).click();

    const filteredCount = await page.locator('article[role="article"]').count();
    expect(filteredCount).toBeLessThan(allCount);
  });

  test('E2E-US7-002: "전체" 선택 시 모든 노트 표시', async ({ page }) => {
    await page.goto('/');

    const allCount = await page.locator('article[role="article"]').count();

    await page.getByRole('button', { name: '업무' }).click();
    await page.getByRole('button', { name: '전체' }).click();

    const restoredCount = await page.locator('article[role="article"]').count();
    expect(restoredCount).toBe(allCount);
  });

  test('E2E-US7-003: 페이지 진입 시 "전체" 필터가 활성화 상태', async ({ page }) => {
    await page.goto('/');

    const allButton = page.getByRole('button', { name: '전체' });
    await expect(allButton).toBeVisible();
  });

  test('E2E-US7-004: 노트가 없는 카테고리 선택 시 빈 상태 표시', async ({ page }) => {
    await page.goto('/categories');

    await page.getByLabel('새 카테고리 이름').fill('빈카테고리');
    await page.getByRole('button', { name: '추가' }).click();
    await expect(page.getByText('빈카테고리')).toBeVisible();

    await page.goto('/');

    await page.getByRole('button', { name: '빈카테고리' }).click();

    await expect(page.getByText('아직 작성된 노트가 없습니다')).toBeVisible();
  });
});
