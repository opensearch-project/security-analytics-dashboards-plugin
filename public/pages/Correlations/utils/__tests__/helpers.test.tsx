/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { getCorrelationRulesTableColumns } from '../helpers';
import { SA_CORRELATION_RULE_RESOURCE_TYPE } from '../../../../services/utils/resource_sharing';

describe('getCorrelationRulesTableColumns resource sharing Access column', () => {
  it('appends an Access column with a share-button marker when resource sharing is available', () => {
    const columns = getCorrelationRulesTableColumns(jest.fn(), jest.fn(), [
      SA_CORRELATION_RULE_RESOURCE_TYPE,
    ]);
    const accessColumn = columns.find((column: any) => column.name === 'Access') as any;
    expect(accessColumn).toBeDefined();

    const marker = accessColumn.render('rule-1', { name: 'My Correlation Rule' });
    expect(marker.props['data-resource-id']).toBe('rule-1');
    expect(marker.props['data-resource-type']).toBe('correlation-rule');
    expect(marker.props['data-resource-name']).toBe('My Correlation Rule');
    expect(marker.props['data-resource-share-display']).toBe('icon');
  });

  it('renders nothing for a row without an id', () => {
    const columns = getCorrelationRulesTableColumns(jest.fn(), jest.fn(), [
      SA_CORRELATION_RULE_RESOURCE_TYPE,
    ]);
    const accessColumn = columns.find((column: any) => column.name === 'Access') as any;
    expect(accessColumn.render(undefined, { name: 'No id rule' })).toBeNull();
  });

  it('does not append the Access column when resource sharing is unavailable', () => {
    const columns = getCorrelationRulesTableColumns(jest.fn(), jest.fn(), []);
    expect(columns.find((column: any) => column.name === 'Access')).toBeUndefined();
  });

  it('does not append the Access column when the parameter is omitted', () => {
    const columns = getCorrelationRulesTableColumns(jest.fn(), jest.fn());
    expect(columns.find((column: any) => column.name === 'Access')).toBeUndefined();
  });
});
