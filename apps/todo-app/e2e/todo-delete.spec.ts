import { test, expect } from '@playwright/test'

test.describe('US3: 할 일 삭제하기', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage and add test todos
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
    await page.reload()

    // Add a todo for testing
    await page.getByPlaceholder('할 일을 입력하세요').fill('삭제할 할 일')
    await page.getByRole('button', { name: '추가' }).click()
    await expect(page.getByText('삭제할 할 일')).toBeVisible()
  })

  test('삭제 버튼을 누르면 항목이 목록에서 사라진다', async ({ page }) => {
    // Given: 할 일 항목이 있음
    await expect(page.getByText('삭제할 할 일')).toBeVisible()

    // When: 삭제 버튼 클릭
    await page.getByRole('button', { name: '삭제' }).click()

    // Then: 항목이 목록에서 사라짐
    await expect(page.getByText('삭제할 할 일')).not.toBeVisible()
    await expect(page.getByText('할 일이 없습니다')).toBeVisible()
  })

  test('삭제 후 새로고침해도 삭제된 상태가 유지된다', async ({ page }) => {
    // Given: 할 일 삭제
    await page.getByRole('button', { name: '삭제' }).click()
    await expect(page.getByText('삭제할 할 일')).not.toBeVisible()

    // When: 페이지 새로고침
    await page.reload()

    // Then: 삭제된 상태가 유지됨
    await expect(page.getByText('삭제할 할 일')).not.toBeVisible()
    await expect(page.getByText('할 일이 없습니다')).toBeVisible()
  })

  test('여러 항목 중 특정 항목만 삭제할 수 있다', async ({ page }) => {
    // Given: 여러 할 일 항목 추가
    await page.getByPlaceholder('할 일을 입력하세요').fill('남겨둘 할 일')
    await page.getByRole('button', { name: '추가' }).click()
    await expect(page.getByText('남겨둘 할 일')).toBeVisible()
    await expect(page.getByText('삭제할 할 일')).toBeVisible()

    // When: 첫 번째 삭제 버튼 클릭 (최신 항목인 "남겨둘 할 일")
    const deleteButtons = page.getByRole('button', { name: '삭제' })
    await deleteButtons.first().click()

    // Then: "남겨둘 할 일"만 삭제되고 "삭제할 할 일"은 남아있음
    await expect(page.getByText('남겨둘 할 일')).not.toBeVisible()
    await expect(page.getByText('삭제할 할 일')).toBeVisible()
  })

  test('완료된 항목도 삭제할 수 있다', async ({ page }) => {
    // Given: 완료 상태로 변경
    const checkbox = page.getByRole('checkbox', { name: '삭제할 할 일' })
    await checkbox.click()
    await expect(checkbox).toBeChecked()

    // When: 삭제 버튼 클릭
    await page.getByRole('button', { name: '삭제' }).click()

    // Then: 항목이 삭제됨
    await expect(page.getByText('삭제할 할 일')).not.toBeVisible()
    await expect(page.getByText('할 일이 없습니다')).toBeVisible()
  })
})
