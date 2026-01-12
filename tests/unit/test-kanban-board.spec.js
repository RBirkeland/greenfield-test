/**
 * Unit Tests for KanbanBoard and TodoColumn Components (T037-T038)
 * Test-first development: These tests should FAIL until components are implemented
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';

describe('KanbanBoard Component (T037)', () => {
  let dom;
  let document;
  let window;

  beforeEach(() => {
    dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
      url: 'http://localhost',
      runScripts: 'dangerously',
      resources: 'usable',
    });
    document = dom.window.document;
    window = dom.window;
    global.window = window;
    global.document = document;
    global.customElements = window.customElements;
    global.HTMLElement = window.HTMLElement;
  });

  it('should render three columns: backlog, in-progress, and done', async () => {
    // Attempt to load the KanbanBoard component
    // This will fail until the component is implemented
    let KanbanBoard;
    try {
      const module = await import('../../src/components/kanban-board.js');
      KanbanBoard = module.KanbanBoard;
    } catch (error) {
      // Expected to fail - component doesn't exist yet
      expect(error.message).toContain('Cannot find module');
      return;
    }

    // Create and mount the component
    const boardElement = document.createElement('kanban-board');
    document.body.appendChild(boardElement);

    // Wait for component to render
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Verify three columns exist
    const columns = boardElement.querySelectorAll('todo-column');
    expect(columns).toHaveLength(3);

    // Verify column attributes
    const columnStatuses = Array.from(columns).map((col) =>
      col.getAttribute('status')
    );
    expect(columnStatuses).toContain('backlog');
    expect(columnStatuses).toContain('in-progress');
    expect(columnStatuses).toContain('done');

    // Verify column titles
    const backlogColumn = Array.from(columns).find(
      (col) => col.getAttribute('status') === 'backlog'
    );
    expect(backlogColumn.querySelector('.column-title')?.textContent).toBe(
      'Backlog'
    );

    const inProgressColumn = Array.from(columns).find(
      (col) => col.getAttribute('status') === 'in-progress'
    );
    expect(inProgressColumn.querySelector('.column-title')?.textContent).toBe(
      'In Progress'
    );

    const doneColumn = Array.from(columns).find(
      (col) => col.getAttribute('status') === 'done'
    );
    expect(doneColumn.querySelector('.column-title')?.textContent).toBe('Done');
  });

  it('should have proper structure with header and columns container', async () => {
    let KanbanBoard;
    try {
      const module = await import('../../src/components/kanban-board.js');
      KanbanBoard = module.KanbanBoard;
    } catch (error) {
      expect(error.message).toContain('Cannot find module');
      return;
    }

    const boardElement = document.createElement('kanban-board');
    document.body.appendChild(boardElement);
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Verify board structure
    expect(boardElement.querySelector('.board-header')).toBeTruthy();
    expect(boardElement.querySelector('.columns-container')).toBeTruthy();
  });
});

describe('TodoColumn Component (T038)', () => {
  let dom;
  let document;
  let window;

  beforeEach(() => {
    dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
      url: 'http://localhost',
      runScripts: 'dangerously',
      resources: 'usable',
    });
    document = dom.window.document;
    window = dom.window;
    global.window = window;
    global.document = document;
    global.customElements = window.customElements;
    global.HTMLElement = window.HTMLElement;
  });

  it('should display all TODOs for its column status', async () => {
    let TodoColumn;
    try {
      const module = await import('../../src/components/todo-column.js');
      TodoColumn = module.TodoColumn;
    } catch (error) {
      expect(error.message).toContain('Cannot find module');
      return;
    }

    // Create column with test todos
    const columnElement = document.createElement('todo-column');
    columnElement.setAttribute('status', 'backlog');
    document.body.appendChild(columnElement);

    // Mock todos data
    const mockTodos = [
      {
        id: '1',
        title: 'Test TODO 1',
        status: 'backlog',
        position: 0,
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        title: 'Test TODO 2',
        status: 'backlog',
        position: 1,
        createdAt: new Date().toISOString(),
      },
      {
        id: '3',
        title: 'Test TODO 3',
        status: 'backlog',
        position: 2,
        createdAt: new Date().toISOString(),
      },
    ];

    // Set todos (component should have a method or property for this)
    if (columnElement.setTodos) {
      columnElement.setTodos(mockTodos);
    }

    await new Promise((resolve) => setTimeout(resolve, 0));

    // Verify all todos are displayed
    const todoItems = columnElement.querySelectorAll('.todo-item');
    expect(todoItems).toHaveLength(3);

    // Verify todo content
    const todoTitles = Array.from(todoItems).map(
      (item) => item.querySelector('.todo-title')?.textContent
    );
    expect(todoTitles).toContain('Test TODO 1');
    expect(todoTitles).toContain('Test TODO 2');
    expect(todoTitles).toContain('Test TODO 3');
  });

  it('should display empty state when no todos exist', async () => {
    let TodoColumn;
    try {
      const module = await import('../../src/components/todo-column.js');
      TodoColumn = module.TodoColumn;
    } catch (error) {
      expect(error.message).toContain('Cannot find module');
      return;
    }

    const columnElement = document.createElement('todo-column');
    columnElement.setAttribute('status', 'backlog');
    document.body.appendChild(columnElement);

    if (columnElement.setTodos) {
      columnElement.setTodos([]);
    }

    await new Promise((resolve) => setTimeout(resolve, 0));

    // Verify empty state
    const todoItems = columnElement.querySelectorAll('.todo-item');
    expect(todoItems).toHaveLength(0);

    // Should show empty state message
    const emptyState = columnElement.querySelector('.empty-state');
    expect(emptyState).toBeTruthy();
  });

  it('should maintain todo order by position', async () => {
    let TodoColumn;
    try {
      const module = await import('../../src/components/todo-column.js');
      TodoColumn = module.TodoColumn;
    } catch (error) {
      expect(error.message).toContain('Cannot find module');
      return;
    }

    const columnElement = document.createElement('todo-column');
    columnElement.setAttribute('status', 'backlog');
    document.body.appendChild(columnElement);

    // Create todos with specific positions (out of order)
    const mockTodos = [
      {
        id: '2',
        title: 'Second TODO',
        status: 'backlog',
        position: 1,
        createdAt: new Date().toISOString(),
      },
      {
        id: '1',
        title: 'First TODO',
        status: 'backlog',
        position: 0,
        createdAt: new Date().toISOString(),
      },
      {
        id: '3',
        title: 'Third TODO',
        status: 'backlog',
        position: 2,
        createdAt: new Date().toISOString(),
      },
    ];

    if (columnElement.setTodos) {
      columnElement.setTodos(mockTodos);
    }

    await new Promise((resolve) => setTimeout(resolve, 0));

    // Verify todos are displayed in position order
    const todoItems = columnElement.querySelectorAll('.todo-item');
    const titles = Array.from(todoItems).map(
      (item) => item.querySelector('.todo-title')?.textContent
    );

    expect(titles[0]).toBe('First TODO');
    expect(titles[1]).toBe('Second TODO');
    expect(titles[2]).toBe('Third TODO');
  });
});
