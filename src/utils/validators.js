import { MAX_TITLE_LENGTH, MAX_DESCRIPTION_LENGTH } from '../config.js';

/**
 * Validate that a string is non-empty after trimming
 * @param {string} value - Value to validate
 * @returns {boolean}
 */
export function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Validate that a string doesn't exceed max length
 * @param {string} value - Value to validate
 * @param {number} maxLength - Maximum allowed length
 * @returns {boolean}
 */
export function isWithinMaxLength(value, maxLength) {
  return typeof value === 'string' && value.length <= maxLength;
}

/**
 * Trim whitespace from string
 * @param {string} value - Value to trim
 * @returns {string}
 */
export function trim(value) {
  return typeof value === 'string' ? value.trim() : '';
}

/**
 * Validate TODO title
 * @param {string} title - Title to validate
 * @returns {Object} { valid: boolean, error: string|null }
 */
export function validateTitle(title) {
  if (!isNonEmptyString(title)) {
    return { valid: false, error: 'Title cannot be empty' };
  }

  if (!isWithinMaxLength(title, MAX_TITLE_LENGTH)) {
    return {
      valid: false,
      error: `Title cannot exceed ${MAX_TITLE_LENGTH} characters`,
    };
  }

  return { valid: true, error: null };
}

/**
 * Validate TODO description
 * @param {string} description - Description to validate
 * @returns {Object} { valid: boolean, error: string|null }
 */
export function validateDescription(description) {
  if (description === null || description === undefined) {
    return { valid: true, error: null };
  }

  if (!isWithinMaxLength(description, MAX_DESCRIPTION_LENGTH)) {
    return {
      valid: false,
      error: `Description cannot exceed ${MAX_DESCRIPTION_LENGTH} characters`,
    };
  }

  return { valid: true, error: null };
}

/**
 * Sanitize user input to prevent XSS
 * @param {string} input - User input
 * @returns {string}
 */
export function sanitize(input) {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}
