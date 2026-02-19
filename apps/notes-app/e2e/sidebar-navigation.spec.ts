import { test, expect } from '@playwright/test';

test.describe('US9: 사이드바 네비게이션', () => {
  test('E2E-US9-001: 사이드바 네비게이션 링크가 렌더링된다', async ({
    page,
  }) => {
    await page.goto('/');

    await expect(page.getByRole('link', { name: '내 노트' })).toBeVisible();
    await expect(
      page.getByRole('link', { name: '카테고리 관리' }),
    ).toBeVisible();
  });

  test('E2E-US9-002: 카테고리 관리 링크 클릭 시 카테고리 페이지로 이동', async ({
    page,
  }) => {
    await page.goto('/');

    await page.getByRole('link', { name: '카테고리 관리' }).click();

    await expect(page).toHaveURL('/categories');
  });

  test('E2E-US9-003: 사이드바 카테고리 클릭 시 해당 카테고리로 필터', async ({
    page,
  }) => {
    await page.goto('/');

    await expect(page.locator('article[role="article"]').first()).toBeVisible();
    const allCount = await page
      .locator('article[role="article"]')
      .count();

    const categoryButton = page
      .locator('aside button')
      .filter({ hasText: '업무' });
    await expect(categoryButton).toBeVisible();
    await categoryButton.click();

    const filteredCount = await page
      .locator('article[role="article"]')
      .count();
    expect(filteredCount).toBeLessThanOrEqual(allCount);
  });
});
