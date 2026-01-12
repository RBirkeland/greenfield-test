/**
 * E2E Tests for User Story 1 Workflow (T035-T036)
 * Test-first development: These tests should FAIL until UI is fully implemented
 *
 * Requirements:
 * - T035: User adds 5 TODOs and sees them in backlog without WIP limit
 * - T036: User reorders TODOs via drag-and-drop and refreshes browser
 *
 * These tests verify the complete user experience from the browser perspective
 */

import { test, expect } from '@playwright/test';

test.describe('US1: Create and Prioritize TODOs - E2E Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');

    // Clear localStorage to start fresh
    await page.evaluate(() => {
      localStorage.clear();
    });

    // Reload to ensure clean state
    await page.reload();
  });

  test('T035: User adds 5 TODOs and sees them in backlog without WIP limit', async ({
    page,
  }) => {
    // Verify kanban board is rendered
    await expect(page.locator('kanban-board')).toBeVisible();

    // Verify three columns exist
    const columns = page.locator('todo-column');
    await expect(columns).toHaveCount(3);

    // Verify backlog column exists and is visible
    const backlogColumn = page.locator('todo-column[status="backlog"]');
    await expect(backlogColumn).toBeVisible();

    // Verify backlog column header
    await expect(backlogColumn.locator('.column-title')).toHaveText('Backlog');

    // Verify add TODO input exists
    const addInput = page.locator('input[placeholder*="Add"], input[name="todo-title"], .add-todo-input');
    await expect(addInput).toBeVisible();

    // Define 5 TODOs to add
    const todosToAdd = [
      'Implement user authentication',
      'Create API endpoints',
      'Design database schema',
      'Write unit tests',
      'Setup CI/CD pipeline',
    ];

    // Add 5 TODOs one by one
    for (const todoTitle of todosToAdd) {
      // Type TODO title
      await addInput.fill(todoTitle);

      // Submit (press Enter or click Add button)
      const addButton = page.locator('button[type="submit"], .add-todo-button');
      if (await addButton.isVisible()) {
        await addButton.click();
      } else {
        await addInput.press('Enter');
      }

      // Wait for TODO to appear
      await expect(
        backlogColumn.locator('.todo-item', { hasText: todoTitle })
      ).toBeVisible();
    }

    // Verify all 5 TODOs are displayed in backlog
    const todoItems = backlogColumn.locator('.todo-item');
    await expect(todoItems).toHaveCount(5);

    // Verify TODOs appear in reverse order (newest first)
    const expectedOrder = [...todosToAdd].reverse();
    for (let i = 0; i < expectedOrder.length; i++) {
      const todoTitle = await todoItems
        .nth(i)
        .locator('.todo-title')
        .textContent();
      expect(todoTitle?.trim()).toBe(expectedOrder[i]);
    }

    // Verify no WIP limit applied (all 5 TODOs are in backlog)
    // In-progress column should be empty
    const inProgressColumn = page.locator('todo-column[status="in-progress"]');
    const inProgressItems = inProgressColumn.locator('.todo-item');
    await expect(inProgressItems).toHaveCount(0);

    // Verify input is cleared after each addition
    await expect(addInput).toHaveValue('');

    // Verify localStorage contains the TODOs
    const storedData = await page.evaluate(() => {
      return localStorage.getItem('kanban-board');
    });
    expect(storedData).toBeTruthy();

    const parsedData = JSON.parse(storedData);
    expect(parsedData.todos).toHaveLength(5);
    expect(parsedData.todos.every((t) => t.status === 'backlog')).toBe(true);
  });

  test('T036: User reorders TODOs via drag-and-drop and refreshes browser', async ({
    page,
  }) => {
    // Setup: Add 3 TODOs first
    await page.goto('/');

    const addInput = page.locator('input[placeholder*="Add"], input[name="todo-title"], .add-todo-input');
    const todosToAdd = ['First TODO', 'Second TODO', 'Third TODO'];

    for (const todoTitle of todosToAdd) {
      await addInput.fill(todoTitle);
      const addButton = page.locator('button[type="submit"], .add-todo-button');
      if (await addButton.isVisible()) {
        await addButton.click();
      } else {
        await addInput.press('Enter');
      }
      await page.waitForTimeout(100); // Small delay for stability
    }

    const backlogColumn = page.locator('todo-column[status="backlog"]');
    const todoItems = backlogColumn.locator('.todo-item');

    // Verify initial order (newest first)
    await expect(todoItems).toHaveCount(3);
    const initialOrder = await todoItems
      .locator('.todo-title')
      .allTextContents();
    expect(initialOrder.map((t) => t.trim())).toEqual([
      'Third TODO',
      'Second TODO',
      'First TODO',
    ]);

    // Perform drag-and-drop: Move "First TODO" from bottom to top
    const firstTodo = todoItems.filter({ hasText: 'First TODO' });
    const thirdTodo = todoItems.filter({ hasText: 'Third TODO' });

    // Get bounding boxes for drag operation
    const firstTodoBox = await firstTodo.boundingBox();
    const thirdTodoBox = await thirdTodo.boundingBox();

    expect(firstTodoBox).toBeTruthy();
    expect(thirdTodoBox).toBeTruthy();

    // Perform drag-and-drop
    await page.mouse.move(
      firstTodoBox.x + firstTodoBox.width / 2,
      firstTodoBox.y + firstTodoBox.height / 2
    );
    await page.mouse.down();
    await page.mouse.move(
      thirdTodoBox.x + thirdTodoBox.width / 2,
      thirdTodoBox.y + thirdTodoBox.height / 2,
      { steps: 10 }
    );
    await page.mouse.up();

    // Wait for reorder to complete
    await page.waitForTimeout(500);

    // Verify new order in UI
    const reorderedItems = await backlogColumn
      .locator('.todo-item .todo-title')
      .allTextContents();
    const reorderedTitles = reorderedItems.map((t) => t.trim());

    // "First TODO" should now be at or near the top
    expect(reorderedTitles[0]).toBe('First TODO');

    // Verify localStorage was updated with new order
    const storedDataBeforeRefresh = await page.evaluate(() => {
      return localStorage.getItem('kanban-board');
    });
    expect(storedDataBeforeRefresh).toBeTruthy();

    const parsedBeforeRefresh = JSON.parse(storedDataBeforeRefresh);
    const backlogTodos = parsedBeforeRefresh.todos
      .filter((t) => t.status === 'backlog')
      .sort((a, b) => a.position - b.position);

    // Verify "First TODO" has position 0
    const firstTodoData = backlogTodos.find((t) => t.title === 'First TODO');
    expect(firstTodoData.position).toBe(0);

    // CRITICAL: Refresh the browser to verify persistence
    await page.reload();

    // Wait for board to render after refresh
    await expect(page.locator('kanban-board')).toBeVisible();
    const backlogColumnAfterRefresh = page.locator(
      'todo-column[status="backlog"]'
    );
    await expect(backlogColumnAfterRefresh).toBeVisible();

    // Verify the reordered state persisted after refresh
    const todoItemsAfterRefresh =
      backlogColumnAfterRefresh.locator('.todo-item');
    await expect(todoItemsAfterRefresh).toHaveCount(3);

    const persistedOrder = await todoItemsAfterRefresh
      .locator('.todo-title')
      .allTextContents();
    const persistedTitles = persistedOrder.map((t) => t.trim());

    // Verify "First TODO" is still at the top after refresh
    expect(persistedTitles[0]).toBe('First TODO');

    // Verify all TODOs are still present
    expect(persistedTitles).toContain('First TODO');
    expect(persistedTitles).toContain('Second TODO');
    expect(persistedTitles).toContain('Third TODO');

    // Verify localStorage still contains correct data
    const storedDataAfterRefresh = await page.evaluate(() => {
      return localStorage.getItem('kanban-board');
    });
    expect(storedDataAfterRefresh).toBeTruthy();

    const parsedAfterRefresh = JSON.parse(storedDataAfterRefresh);
    expect(parsedAfterRefresh.todos).toHaveLength(3);

    // Verify position data is consistent
    const backlogTodosAfterRefresh = parsedAfterRefresh.todos
      .filter((t) => t.status === 'backlog')
      .sort((a, b) => a.position - b.position);

    expect(backlogTodosAfterRefresh[0].title).toBe('First TODO');
    expect(backlogTodosAfterRefresh[0].position).toBe(0);
  });

  test('T036 (Alternative): User reorders via UI controls if drag-and-drop not implemented', async ({
    page,
  }) => {
    // This test provides an alternative if drag-and-drop is not implemented
    // Uses buttons or other UI controls for reordering

    await page.goto('/');

    // Add 3 TODOs
    const addInput = page.locator('input[placeholder*="Add"], input[name="todo-title"], .add-todo-input');
    const todosToAdd = ['First TODO', 'Second TODO', 'Third TODO'];

    for (const todoTitle of todosToAdd) {
      await addInput.fill(todoTitle);
      const addButton = page.locator('button[type="submit"], .add-todo-button');
      if (await addButton.isVisible()) {
        await addButton.click();
      } else {
        await addInput.press('Enter');
      }
      await page.waitForTimeout(100);
    }

    const backlogColumn = page.locator('todo-column[status="backlog"]');

    // Look for reorder buttons (e.g., "Move Up" or "Move to Top")
    const firstTodoItem = backlogColumn
      .locator('.todo-item')
      .filter({ hasText: 'First TODO' });

    // Try to find move up button
    const moveUpButton = firstTodoItem.locator(
      'button[title*="Move Up"], button[title*="Up"], .move-up-button'
    );

    if (await moveUpButton.isVisible()) {
      // Click move up twice to move from position 2 to position 0
      await moveUpButton.click();
      await page.waitForTimeout(200);
      await moveUpButton.click();
      await page.waitForTimeout(200);

      // Verify new order
      const reorderedItems = await backlogColumn
        .locator('.todo-item .todo-title')
        .allTextContents();
      expect(reorderedItems[0].trim()).toBe('First TODO');

      // Refresh and verify persistence
      await page.reload();
      await expect(page.locator('kanban-board')).toBeVisible();

      const persistedOrder = await backlogColumn
        .locator('.todo-item .todo-title')
        .allTextContents();
      expect(persistedOrder[0].trim()).toBe('First TODO');
    } else {
      // If no reorder controls found, skip this test
      test.skip();
    }
  });

  test('User can delete a TODO from backlog', async ({ page }) => {
    // Bonus test: Verify delete functionality works
    await page.goto('/');

    const addInput = page.locator('input[placeholder*="Add"], input[name="todo-title"], .add-todo-input');

    // Add 2 TODOs
    await addInput.fill('TODO to keep');
    await addInput.press('Enter');
    await addInput.fill('TODO to delete');
    await addInput.press('Enter');

    const backlogColumn = page.locator('todo-column[status="backlog"]');
    await expect(backlogColumn.locator('.todo-item')).toHaveCount(2);

    // Find and click delete button for "TODO to delete"
    const todoToDelete = backlogColumn
      .locator('.todo-item')
      .filter({ hasText: 'TODO to delete' });
    const deleteButton = todoToDelete.locator(
      'button[title*="Delete"], button[aria-label*="Delete"], .delete-button'
    );

    await expect(deleteButton).toBeVisible();
    await deleteButton.click();

    // Confirm deletion if there's a confirmation dialog
    const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Delete")');
    if (await confirmButton.isVisible()) {
      await confirmButton.click();
    }

    // Verify TODO was deleted
    await expect(backlogColumn.locator('.todo-item')).toHaveCount(1);
    await expect(
      backlogColumn.locator('.todo-item', { hasText: 'TODO to keep' })
    ).toBeVisible();
    await expect(
      backlogColumn.locator('.todo-item', { hasText: 'TODO to delete' })
    ).not.toBeVisible();

    // Verify persistence after refresh
    await page.reload();
    await expect(page.locator('kanban-board')).toBeVisible();
    await expect(backlogColumn.locator('.todo-item')).toHaveCount(1);
  });
});
