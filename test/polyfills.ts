/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

// @ts-ignore
import { MutationObserver } from './polyfills/mutationObserver';
import { webcrypto } from 'crypto';

Object.defineProperty(window, 'MutationObserver', { value: MutationObserver });

// Polyfill crypto for uuid@14+ in jsdom test environment
if (!global.crypto) {
  // @ts-ignore
  global.crypto = webcrypto;
}
