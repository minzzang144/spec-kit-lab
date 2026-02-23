import { test, expect } from '@playwright/test';

test.describe('US4: 노트 편집', () => {
  test('E2E-US4-001: 상세 페이지에서 편집 버튼 클릭 시 편집 모드 전환', async ({ page }) => {
    await page.goto('/');

    await page.locator('article[role="article"]').first().click();
    await expect(page).toHaveURL(/\/notes\/\d+/);

    await expect(page.getByRole('button', { name: '편집' })).toBeVisible();
    await page.getByRole('button', { name: '편집' }).click();

    await expect(page.getByLabel('제목')).toBeVisible();
    await expect(page.getByLabel('내용')).toBeVisible();
  });

  test('E2E-US4-002: 기존 노트 데이터가 편집 폼에 pre-fill 된다', async ({ page }) => {
    await page.goto('/');

    const firstCard = page.locator('article[role="article"]').first();
    const titleText = await firstCard.locator('h3').textContent();
    await firstCard.click();

    await page.getByRole('button', { name: '편집' }).click();

    const titleInput = page.getByLabel('제목');
    // 편집 모드 전환 후 form pre-fill 대기
    await expect(titleInput).not.toHaveValue('');
    await expect(titleInput).toHaveValue(titleText ?? '');
  });

  test('E2E-US4-003: 제목 수정 후 저장 시 상세 화면에 반영', async ({ page }) => {
    await page.goto('/');

    await page.locator('article[role="article"]').first().click();
    await expect(page).toHaveURL(/\/notes\/\d+/);

    await page.getByRole('button', { name: '편집' }).click();

    const titleInput = page.getByLabel('제목');
    await titleInput.clear();
    await titleInput.fill('수정된 노트 제목 E2E');

    await page.getByRole('button', { name: '저장' }).click();

    await expect(page.getByRole('heading', { name: '수정된 노트 제목 E2E' })).toBeVisible();
    await expect(page.getByRole('button', { name: '편집' })).toBeVisible();
  });

  test('E2E-US4-004: 편집 취소 시 읽기 모드로 돌아간다', async ({ page }) => {
    await page.goto('/');

    await page.locator('article[role="article"]').first().click();
    await expect(page).toHaveURL(/\/notes\/\d+/);

    // 노트 상세 h1이 로드될 때까지 대기 후 제목 확인
    const articleHeading = page.locator('article h1');
    await expect(articleHeading).toBeVisible();
    const originalTitle = await articleHeading.textContent();

    await page.getByRole('button', { name: '편집' }).click();
    await expect(page.getByLabel('제목')).not.toHaveValue('');

    await page.getByRole('button', { name: '취소' }).click();

    await expect(articleHeading).toHaveText(originalTitle ?? '');
    await expect(page.getByRole('button', { name: '편집' })).toBeVisible();
  });
});
