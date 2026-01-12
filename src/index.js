/**
 * Main application entry point
 * Initializes the Kanban board application with services and web components
 */

import { TodoManager } from './services/todo-manager.js';
import { WIPEnforcer } from './services/wip-enforcer.js';

/**
 * Initialize the application
 */
async function initializeApp() {
  // Initialize services
  const todoManager = new TodoManager();
  const wipEnforcer = new WIPEnforcer();

  // Load initial board state
  const boardState = todoManager.getBoard();

  // Initialize Vibe Kanban Web Companion (dynamic import)
  try {
    await import('vibe-kanban-web-companion');
    const companionElement = document.createElement('vibe-kanban-web-companion');
    document.body.appendChild(companionElement);
  } catch (error) {
    console.warn('Vibe Kanban Web Companion not available:', error.message);
  }

  // Log initialization
  console.log('Application initialized', {
    todosCount: boardState.todos.length,
    wipLimit: boardState.wipLimit,
    version: todoManager.storage.getVersion(),
  });

  // Expose services globally for debugging (optional)
  if (window.__DEBUG__) {
    window.app = {
      todoManager,
      storage: todoManager.storage,
      wipEnforcer,
      boardState,
    };
  }

  return {
    todoManager,
    storage: todoManager.storage,
    wipEnforcer,
    boardState,
  };
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

export { initializeApp };
