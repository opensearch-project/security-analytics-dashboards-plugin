/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export const MIN_NAME_CHARACTERS = 5;
export const MAX_NAME_CHARACTERS = 50;

// This regex pattern support MIN to MAX character limit, capital and lowercase letters,
// numbers 0-9, hyphens, spaces, and underscores.
export const NAME_REGEX = new RegExp(/^[a-zA-Z0-9 _-]{5,50}$/);

export const LOG_TYPE_NAME_REGEX = new RegExp(/^[a-z0-9_-]{2,50}$/);

// This regex pattern support MIN to MAX character limit, capital and lowercase letters,
// numbers 0-9, hyphens, dot, and underscores.
export const DETECTION_NAME_REGEX = new RegExp(/^[a-zA-Z0-9_.-]{5,50}$/);

export const DETECTION_CONDITION_REGEX = new RegExp(
  /^((not )?[a-zA-Z0-9_]+)?( (and|or|and not|or not|not) ?([a-zA-Z0-9_]+))*(?<!and|or|not)$/
);

// This regex pattern support MIN to MAX character limit, capital and lowercase letters,
// numbers 0-9, hyphens, spaces, and underscores.
export const AUTHOR_REGEX = new RegExp(/^[a-zA-Z0-9 _,-.]{5,50}$/);

/**
 * Validates a string against NAME_REGEX.
 * @param name: The string to validate.
 * @param regex
 * @return TRUE if valid; else FALSE.
 */
export function validateName(
  name: string,
  regex: RegExp = NAME_REGEX,
  shouldTrimName: boolean = true
): boolean {
  const toValidate = shouldTrimName ? name.trim() : name;
  return toValidate.match(regex) !== null;
}

export function validateDetectionFieldName(
  name: string,
  regex: RegExp = DETECTION_NAME_REGEX
): boolean {
  return name.trim().match(regex) !== null;
}

export function validateCondition(
  name: string,
  regex: RegExp = DETECTION_CONDITION_REGEX
): boolean {
  return name.trim().match(regex) !== null;
}

const nameOrTitleErrorBase = `should only consist of upper and lowercase letters, numbers 0-9, hyphens, spaces, and underscores.
Use between ${MIN_NAME_CHARACTERS} and ${MAX_NAME_CHARACTERS} characters.`;
export const nameErrorString = `Name ${nameOrTitleErrorBase}`;
export const titleErrorString = `Title ${nameOrTitleErrorBase}`;
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
 commas, hyphens, periods, spaces, and underscores. Max limit of ${MAX_DESCRIPTION_CHARACTERS} characters.`;

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
