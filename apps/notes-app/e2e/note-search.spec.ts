import { test, expect } from '@playwright/test';

test.describe('US8: 노트 검색', () => {
  test('E2E-US8-001: 키워드 입력 시 매칭 노트만 표시', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('article[role="article"]').first()).toBeVisible();
    const allCount = await page.locator('article[role="article"]').count();

    await page.getByPlaceholder('노트 검색...').fill('회의');

    await page.waitForTimeout(400);

    const filteredCount = await page.locator('article[role="article"]').count();
    expect(filteredCount).toBeLessThan(allCount);
    expect(filteredCount).toBeGreaterThan(0);
  });

  test('E2E-US8-002: clear 버튼 클릭 시 모든 노트 복원', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('article[role="article"]').first()).toBeVisible();
    const allCount = await page.locator('article[role="article"]').count();

    await page.getByPlaceholder('노트 검색...').fill('회의');
    await page.waitForTimeout(400);

    await page.getByRole('button', { name: '검색어 지우기' }).click();
    await page.waitForTimeout(100);

    const restoredCount = await page.locator('article[role="article"]').count();
    expect(restoredCount).toBe(allCount);
  });

  test('E2E-US8-003: 매칭 노트 없을 때 빈 상태 표시', async ({ page }) => {
    await page.goto('/');

    await page.getByPlaceholder('노트 검색...').fill('존재하지않는키워드xyz123');
    await page.waitForTimeout(400);

    await expect(page.getByText('아직 작성된 노트가 없습니다')).toBeVisible();
  });
});
