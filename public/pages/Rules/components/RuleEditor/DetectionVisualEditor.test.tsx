/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render } from '@testing-library/react';
import { expect } from '@jest/globals';
import { DetectionVisualEditor } from './DetectionVisualEditor';
import DetectionVisualEditorMock from '../../../../../test/mocks/Rules/components/RuleEditor/DetectionVisualEditor.mock';

describe('<SelectionExpField /> spec', () => {
  beforeAll(() => {
    function at(this: any[], n: number) {
      // ToInteger() abstract op
      n = Math.trunc(n) || 0;
      // Allow negative indexing from the end
      if (n < 0) n += this.length;
      // OOB access is guaranteed to return undefined
      if (n < 0 || n >= this.length) return undefined;
      // Otherwise, this is just normal property access
      return this[n];
    }

    const TypedArray = Reflect.getPrototypeOf(Int8Array);
    for (const C of [Array, String, TypedArray]) {
      Object.defineProperty((C as any).prototype, 'at', {
        value: at,
        writable: true,
        enumerable: false,
        configurable: true,
      });
    }
  });

  it('renders the component', () => {
    const tree = render(<DetectionVisualEditor {...DetectionVisualEditorMock} />);
    expect(tree).toMatchSnapshot();
  });
});
