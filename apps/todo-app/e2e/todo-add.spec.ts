import { test, expect } from '@playwright/test'

test.describe('US1: 할 일 추가하기', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
    await page.reload()
  })

  test('빈 목록에서 할 일을 추가하면 목록에 표시된다', async ({ page }) => {
    // Given: 빈 할 일 목록
    await expect(page.getByText('할 일이 없습니다')).toBeVisible()

    // When: "장보기"를 입력하고 추가 버튼 클릭
    await page.getByPlaceholder('할 일을 입력하세요').fill('장보기')
    await page.getByRole('button', { name: '추가' }).click()

    // Then: "장보기" 항목이 목록에 표시된다
    await expect(page.getByText('장보기')).toBeVisible()
    await expect(page.getByText('할 일이 없습니다')).not.toBeVisible()
  })

  test('기존 항목이 있을 때 새 항목은 목록 최상단에 추가된다', async ({ page }) => {
    // Given: 기존 할 일 항목 추가
    await page.getByPlaceholder('할 일을 입력하세요').fill('첫 번째 할 일')
    await page.getByRole('button', { name: '추가' }).click()
    await expect(page.getByText('첫 번째 할 일')).toBeVisible()

    // When: 새로운 할 일 추가
    await page.getByPlaceholder('할 일을 입력하세요').fill('두 번째 할 일')
    await page.getByRole('button', { name: '추가' }).click()

    // Then: 새 항목이 목록 최상단에 위치 (첫 번째로 나타남)
    const todoItems = page.locator('[class*="flex items-center gap-3"]')
    await expect(todoItems.first()).toContainText('두 번째 할 일')
  })

  test('빈 입력 상태에서 추가 버튼을 누르면 아무 동작도 일어나지 않는다', async ({
    page,
  }) => {
    // Given: 빈 입력 상태
    const input = page.getByPlaceholder('할 일을 입력하세요')
    await expect(input).toHaveValue('')

    // When: 추가 버튼 클릭
    await page.getByRole('button', { name: '추가' }).click()

    // Then: 목록에 아무것도 추가되지 않음
    await expect(page.getByText('할 일이 없습니다')).toBeVisible()
  })

  test('Enter 키로 할 일을 추가할 수 있다', async ({ page }) => {
    // Given: 빈 할 일 목록
    await expect(page.getByText('할 일이 없습니다')).toBeVisible()

    // When: 텍스트 입력 후 Enter 키 누름
    await page.getByPlaceholder('할 일을 입력하세요').fill('Enter로 추가')
    await page.getByPlaceholder('할 일을 입력하세요').press('Enter')

    // Then: 할 일이 목록에 추가됨
    await expect(page.getByText('Enter로 추가')).toBeVisible()
  })

  test('새로고침 후에도 데이터가 유지된다', async ({ page }) => {
    // Given: 할 일 추가
    await page.getByPlaceholder('할 일을 입력하세요').fill('저장 테스트')
    await page.getByRole('button', { name: '추가' }).click()
    await expect(page.getByText('저장 테스트')).toBeVisible()

    // When: 페이지 새로고침
    await page.reload()

    // Then: 데이터가 유지됨
    await expect(page.getByText('저장 테스트')).toBeVisible()
  })
})
