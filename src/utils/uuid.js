import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a unique identifier for TODOs and other entities
 * @returns {string} UUID v4 string
 */
export function generateId() {
  return uuidv4();
}
