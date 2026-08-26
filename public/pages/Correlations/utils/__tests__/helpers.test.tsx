/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { getCorrelationRulesTableColumns } from '../helpers';
import { isResourceSharingAvailable } from '../../../../services/utils/resource_sharing';

jest.mock('../../../../services/utils/resource_sharing', () => ({
  isResourceSharingAvailable: jest.fn(),
  SA_CORRELATION_RULE_RESOURCE_TYPE: 'correlation-rule',
}));

const mockIsAvailable = isResourceSharingAvailable as jest.Mock;

describe('getCorrelationRulesTableColumns resource sharing Access column', () => {
  afterEach(() => mockIsAvailable.mockReset());

  it('appends an Access column with a share-button marker when resource sharing is available', () => {
    mockIsAvailable.mockReturnValue(true);
    const columns = getCorrelationRulesTableColumns(jest.fn(), jest.fn());
    const accessColumn = columns.find((column: any) => column.name === 'Access') as any;
    expect(accessColumn).toBeDefined();

    const marker = accessColumn.render('rule-1', { name: 'My Correlation Rule' });
    expect(marker.props['data-resource-id']).toBe('rule-1');
    expect(marker.props['data-resource-type']).toBe('correlation-rule');
    expect(marker.props['data-resource-name']).toBe('My Correlation Rule');
    expect(marker.props['data-resource-share-display']).toBe('icon');
  });

  it('renders nothing for a row without an id', () => {
    mockIsAvailable.mockReturnValue(true);
    const columns = getCorrelationRulesTableColumns(jest.fn(), jest.fn());
    const accessColumn = columns.find((column: any) => column.name === 'Access') as any;
    expect(accessColumn.render(undefined, { name: 'No id rule' })).toBeNull();
  });

  it('does not append the Access column when resource sharing is unavailable', () => {
    mockIsAvailable.mockReturnValue(false);
    const columns = getCorrelationRulesTableColumns(jest.fn(), jest.fn());
    expect(columns.find((column: any) => column.name === 'Access')).toBeUndefined();
  });
});
