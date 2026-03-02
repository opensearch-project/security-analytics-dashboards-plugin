/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export const MIN_NAME_CHARACTERS = 5;
export const MAX_NAME_CHARACTERS = 50;

// This regex pattern support MIN to MAX character limit, capital and lowercase letters,
// numbers 0-9, hyphens, spaces, and underscores.
export const NAME_REGEX = new RegExp(/^[a-zA-Z0-9 _-]{5,50}$/);

// This regex pattern support MIN to MAX character limit for detection rule name
export const RULE_NAME_REGEX = new RegExp(/^.{1,256}$/);

// Restriction defined by OpenSearch security analitycs.
// Applies to LogTypes and Integrations name/title.
export const LOG_TYPE_NAME_REGEX = new RegExp(/^[a-z0-9_-]{2,50}$/);

// This regex pattern support MIN to MAX character limit.
// NOTE: This length constraint is strictly client-side.
//  The backend indexer does not seem to enforce a character limit for this field.
export const INTEGRATION_AUTHOR_REGEX = new RegExp(/^.{2,50}$/);

// This regex pattern support MIN to MAX character limit, capital and lowercase letters,
// numbers 0-9, hyphens, dot, and underscores.
export const DETECTION_NAME_REGEX = new RegExp(/^[a-zA-Z0-9_.-]{1,50}$/);

// This regex pattern support MIN to MAX character limit, capital and lowercase letters,
// numbers 0-9, hyphens, dot, and underscores.
export const THREAT_INTEL_SOURCE_NAME_REGEX = new RegExp(/^[a-zA-Z0-9 _-]{1,128}$/);

export const DETECTION_CONDITION_REGEX = new RegExp(
  /^((not )?.+)?( (and|or|and not|or not|not) ?(.+))*(?<!and|or|not)$/
);

// This regex pattern support MIN to MAX character limit.
export const AUTHOR_REGEX = new RegExp(/^.{0,256}$/);

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
  return String(name).trim().match(regex) !== null; // Wazuh: ensure name is string
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

// This regex pattern support MIN to MAX character limit, capital and lowercase letters,
// numbers 0-9, hyphens, periods, spaces, and underscores.
export const DESCRIPTION_REGEX = new RegExp(/^[a-zA-Z0-9 _.,-]{0,500}$/);

export const MAX_RULE_DESCRIPTION_LENGTH = 65535;

// This regex pattern support MIN to MAX character limit for detection rule description.
export const RULE_DESCRIPTION_REGEX = new RegExp(`^.{0,${MAX_RULE_DESCRIPTION_LENGTH}}$`);

export const THREAT_INTEL_SOURCE_DESCRIPTION_REGEX = new RegExp(
  `^.{0,${MAX_RULE_DESCRIPTION_LENGTH}}$`
);

/**
 * Validates a string against NAME_REGEX.
 * @param name: The string to validate.
 * @return TRUE if valid; else FALSE.
 */
export function validateDescription(
  name: string,
  descriptionRegex: RegExp = DESCRIPTION_REGEX
): boolean {
  return name.trim().match(descriptionRegex) !== null;
}

export const descriptionError = `Description should only consist of upper and lowercase letters, numbers 0-9, commas, hyphens, periods, spaces, and underscores. Max limit of 500 characters.`;

export const detectionRuleDescriptionError = `Description has max limit of 65,535 characters.`;

export function getDescriptionErrorMessage(
  _description: string,
  descriptionIsInvalid: boolean,
  descriptionFieldTouched: boolean
) {
  if (descriptionFieldTouched && descriptionIsInvalid) {
    return descriptionError;
  }
}

export function validateField(hasSubmitted: boolean, fieldTouched: boolean) {
  return hasSubmitted || fieldTouched;
}

export const detectionRuleNameError = 'Rule name can be max 256 characters.';
