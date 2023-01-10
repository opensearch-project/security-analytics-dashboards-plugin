/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export const MIN_NAME_CHARACTERS = 5;
export const MAX_NAME_CHARACTERS = 50;

// This regex pattern support MIN to MAX character limit, capital and lowercase letters,
// numbers 0-9, hyphens, spaces, and underscores.
export const NAME_REGEX = new RegExp(/^[a-zA-Z0-9 _-]{5,50}$/);

// This regex pattern support MIN to MAX character limit, capital and lowercase letters,
// numbers 0-9, hyphens, spaces, and underscores.
export const AUTHOR_REGEX = new RegExp(/^[a-zA-Z0-9 _,-.]{5,50}$/);

/**
 * Validates a string against NAME_REGEX.
 * @param name: The string to validate.
 * @return TRUE if valid; else FALSE.
 */
export function validateName(name: string, regex: RegExp = NAME_REGEX): boolean {
  return name.trim().match(regex) !== null;
}

export const nameErrorString = `Name should only consist of upper and lowercase letters, numbers 0-9, hyphens, spaces, and underscores. 
Use between ${MIN_NAME_CHARACTERS} and ${MAX_NAME_CHARACTERS} characters.`;
export const authorErrorString = `Author name should only consist of upper and lowercase letters, numbers 0-9, hyphens, commas, spaces, and underscores. 
Use between ${MIN_NAME_CHARACTERS} and ${MAX_NAME_CHARACTERS} characters.`;

export function getNameErrorMessage(
  name: string,
  nameIsInvalid: boolean,
  nameFieldTouched: boolean
) {
  const trimmedName = name.trim();
  if (nameFieldTouched) {
    if (trimmedName.length === 0) return 'Enter a name.';
    if (nameIsInvalid) return nameErrorString;
  }
}

export const MIN_DESCRIPTION_CHARACTERS = 0;
export const MAX_DESCRIPTION_CHARACTERS = 500;

// This regex pattern support MIN to MAX character limit, capital and lowercase letters,
// numbers 0-9, hyphens, periods, spaces, and underscores.
export const DESCRIPTION_REGEX = new RegExp(/^[a-zA-Z0-9 _.,-]{0,500}$/);

/**
 * Validates a string against NAME_REGEX.
 * @param name: The string to validate.
 * @return TRUE if valid; else FALSE.
 */
export function validateDescription(name: string): boolean {
  return name.trim().match(DESCRIPTION_REGEX) !== null;
}

export const descriptionErrorString = `Description should only consist of upper and lowercase letters, numbers 0-9,
 commas, hyphens, periods, spaces, and underscores. Max limit of ${MAX_DESCRIPTION_CHARACTERS} characters,`;

export function getDescriptionErrorMessage(
  _description: string,
  descriptionIsInvalid: boolean,
  descriptionFieldTouched: boolean
) {
  if (descriptionFieldTouched && descriptionIsInvalid) {
    return descriptionErrorString;
  }
}

export function validateField(hasSubmitted: boolean, fieldTouched: boolean) {
  return hasSubmitted || fieldTouched;
}
