/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export async function loadFontAwesome() {
  // Decent browsers: Make sure the fonts are loaded.
  return document.fonts
    .load('normal normal 400 24px/1 "FontAwesome"')
    .catch(console.error.bind(console, 'Failed to load Font Awesome 4.'));
}
