/**
 * Main application entry point
 * Initializes the Kanban board application with services and web components
 */

import { TodoManager } from './services/todo-manager.js';
import { Storage } from './services/storage.js';
import { WIPEnforcer } from './services/wip-enforcer.js';

/**
 * Initialize the application
 */
function initializeApp() {
  // Initialize services
  const storage = new Storage();
  const todoManager = new TodoManager();
  const wipEnforcer = new WIPEnforcer();

  // Load initial board state
  const boardState = todoManager.getBoard();

  // Log initialization
  console.log('Application initialized', {
    todosCount: boardState.todos.length,
    wipLimit: boardState.wipLimit,
    version: storage.getVersion(),
  });

  // Expose services globally for debugging (optional)
  if (window.__DEBUG__) {
    window.app = {
      todoManager,
      storage,
      wipEnforcer,
      boardState,
    };
  }

  return {
    todoManager,
    storage,
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
