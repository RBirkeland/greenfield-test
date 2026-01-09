/**
 * DOM utility helpers for common operations
 */

/**
 * Query a single element using CSS selector
 * @param {string} selector - CSS selector
 * @param {Element} context - Context element (defaults to document)
 * @returns {Element|null}
 */
export function query(selector, context = document) {
  return context.querySelector(selector);
}

/**
 * Query all elements matching CSS selector
 * @param {string} selector - CSS selector
 * @param {Element} context - Context element (defaults to document)
 * @returns {NodeList}
 */
export function queryAll(selector, context = document) {
  return context.querySelectorAll(selector);
}

/**
 * Create a new element with optional class and text
 * @param {string} tagName - HTML tag name
 * @param {string|null} className - CSS class name (optional)
 * @param {string|null} textContent - Text content (optional)
 * @returns {Element}
 */
export function createElement(tagName, className = null, textContent = null) {
  const element = document.createElement(tagName);
  if (className) {
    element.className = className;
  }
  if (textContent) {
    element.textContent = textContent;
  }
  return element;
}

/**
 * Add event listener to element
 * @param {Element} element - Target element
 * @param {string} event - Event name
 * @param {Function} handler - Event handler
 * @param {boolean|Object} options - Event listener options
 */
export function addEventListener(element, event, handler, options = false) {
  element.addEventListener(event, handler, options);
}

/**
 * Remove event listener from element
 * @param {Element} element - Target element
 * @param {string} event - Event name
 * @param {Function} handler - Event handler
 * @param {boolean|Object} options - Event listener options
 */
export function removeEventListener(element, event, handler, options = false) {
  element.removeEventListener(event, handler, options);
}

/**
 * Remove element from DOM
 * @param {Element} element - Element to remove
 */
export function removeElement(element) {
  if (element && element.parentNode) {
    element.parentNode.removeChild(element);
  }
}

/**
 * Set multiple attributes on an element
 * @param {Element} element - Target element
 * @param {Object} attributes - Key-value pairs of attributes
 */
export function setAttributes(element, attributes) {
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
}

/**
 * Emit a custom event
 * @param {Element} element - Element to emit event from
 * @param {string} eventName - Custom event name
 * @param {any} detail - Event detail data
 */
export function emitEvent(element, eventName, detail = null) {
  const event = new CustomEvent(eventName, { detail, bubbles: true, cancelable: true });
  element.dispatchEvent(event);
}
