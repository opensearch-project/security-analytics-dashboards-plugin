/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export const MIN_NAME_CHARACTERS = 5;
export const MAX_NAME_CHARACTERS = 50;

// This regex supports MIN to MAX character limit, capital and lowercase letters,
// numbers 0-9, spaces, hyphens and underscores.
export const NAME_REGEX = new RegExp(/^[a-zA-Z0-9 _-]{5,50}$/);

/**
 * Validates a string against NAME_REGEX.
 * @param name: The string to validate.
 * @return TRUE if valid; else FALSE.
 */
export function validateName(name: string): boolean {
  return name.trim().match(NAME_REGEX) !== null;
}

export function getNameErrorMessage(
  name: string,
  nameIsInvalid: boolean,
  nameFieldTouched: boolean
) {
  const trimmedName = name.trim();
  if (nameFieldTouched) {
    if (trimmedName.length === 0) return 'Enter a name.';
    if (nameIsInvalid)
      return `Names consist of ${MIN_NAME_CHARACTERS}-${MAX_NAME_CHARACTERS} characters,
      upper and lowercase letters, numbers 0-9, hyphens, underscores, and spaces.`;
  }
}

export function validateField(hasSubmitted: boolean, fieldTouched: boolean) {
  return hasSubmitted || fieldTouched;
}
