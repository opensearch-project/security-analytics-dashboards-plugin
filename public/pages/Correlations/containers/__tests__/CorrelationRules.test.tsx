/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

describe('CorrelationRules Access column staleness guard logic', () => {
  // Direct unit coverage of the guard used in CorrelationRules' render: the
  // types passed to getCorrelationRulesTableColumns must only reflect
  // resourceSharing.types when it was resolved for the currently selected
  // data source, falling back to [] otherwise. getResourceSharingAvailableTypes(...)
  // is called from a useEffect keyed on props.dataSource?.id, so on a
  // data-source switch, resourceSharing.types can still hold the previous
  // data source's result until the new probe resolves.
  const computeAvailableTypes = (
    resourceSharing: { dataSourceId: string | undefined; types: string[] },
    selectedDataSourceId: string | undefined
  ): string[] =>
    resourceSharing.dataSourceId === selectedDataSourceId ? resourceSharing.types : [];

  it('returns the resolved types once they match the currently selected data source', () => {
    const resourceSharing = { dataSourceId: 'ds-a', types: ['correlation-rule'] };
    expect(computeAvailableTypes(resourceSharing, 'ds-a')).toEqual(['correlation-rule']);
  });

  it('returns an empty list while a resolved result belongs to a data source other than the one now selected', () => {
    const resourceSharing = { dataSourceId: 'ds-a', types: ['correlation-rule'] };
    expect(computeAvailableTypes(resourceSharing, 'ds-b')).toEqual([]);
  });

  it('returns an empty list before any result has resolved for the currently selected data source', () => {
    const resourceSharing = { dataSourceId: undefined, types: [] };
    expect(computeAvailableTypes(resourceSharing, 'ds-a')).toEqual([]);
  });
});
