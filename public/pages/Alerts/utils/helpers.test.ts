/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ALERTS_TABLE_SORT_FIELDS,
  DEFAULT_ALERTS_TABLE_QUERY,
  getAlertsPageParams,
  getAlertsSearchString,
  getAlertsTableColumnField,
} from './helpers';
import { ALERTS_SORT_FIELDS } from '../../../../common/constants';
import {
  ALERTS_SEARCH_STRING_MAX_LENGTH,
  ALERTS_SEARCH_STRING_PATTERN,
} from '../../../../common/constants';

describe('Alerts helpers', () => {
  describe('getAlertsSearchString', () => {
    it.each([
      ['', ''],
      ['   ', ''],
      ['windows', 'windows*'],
      ['Windows Detector', 'windows* detector*'],
      ['a-b:c (d)', 'a* b\\:c* d*'],
      ['"quoted" AND (x OR y) || z && !w', 'quoted* and* x* or* y* z* w*'],
      ['field:value* ~2 ^3 [1 TO 5] {a} /re/ \\', 'field\\:value* 2* 3* 1* to* 5* a* re*'],
      // Kept together like the standard tokenizer does
      ['my_detector', 'my_detector*'],
      ['win.log', 'win.log*'],
      ["O'Neil", "o'neil*"],
      ['a:b', 'a\\:b*'],
      ['under_score.dot', 'under_score.dot*'],
      ['v1.2.3', 'v1.2.3*'],
      // A joining character needs a term character on both sides
      ['a..b a::b win. .net', 'a* b* a* b* win* net*'],
      // Split like the standard tokenizer does
      ['my-detector', 'my* detector*'],
      ['path/to/file', 'path* to* file*'],
      ['a+b=c<d>e!f?g~h^i"j', 'a* b* c* d* e* f* g* h* i* j*'],
      ['Größe über', 'größe* über*'],
      ['Größe_über', 'größe_über*'],
      ['日本語 検出', '日本語* 検出*'],
      ['café', 'café*'],
      // Combining marks stay part of the term
      ['cafe\u0301', 'cafe\u0301*'],
      ['ÄÖÜ', 'äöü*'],
      ['()[]{}:"*?\\/', ''],
      ["- / : . ' _", '_*'],
      ['🔥 ★ → €', ''],
    ])('converts %p to %p', (input, expected) => {
      expect(getAlertsSearchString(input)).toBe(expected);
    });

    it('only emits characters the get alerts API accepts', () => {
      const input = 'a-b:c (d) "e" O\'Neil win.log my_detector Größe 日本 \\ / * ? ~ ^ [] {} <>';
      expect(getAlertsSearchString(input)).toMatch(ALERTS_SEARCH_STRING_PATTERN);
    });

    it('drops the terms exceeding the max length', () => {
      const term = 'a'.repeat(99);
      const searchString = getAlertsSearchString(`${term} ${term} ${term}`);

      expect(searchString).toBe(`${term}* ${term}*`);
      expect(searchString.length).toBeLessThanOrEqual(ALERTS_SEARCH_STRING_MAX_LENGTH);
      expect(getAlertsSearchString('a'.repeat(300))).toBe('');
    });
  });

  describe('getAlertsPageParams', () => {
    it('maps the default table query', () => {
      expect(getAlertsPageParams(DEFAULT_ALERTS_TABLE_QUERY)).toEqual({
        startIndex: 0,
        size: 10,
        sortString: 'start_time',
        sortOrder: 'desc',
        startTime: undefined,
        endTime: undefined,
      });
    });

    it('maps pages, sorting, filters, search, time range and detector', () => {
      expect(
        getAlertsPageParams(
          {
            pageIndex: 3,
            pageSize: 20,
            sortField: 'monitor_name.keyword',
            sortDirection: 'asc',
            severities: ['1', '2'],
            statuses: ['ACTIVE', 'ACKNOWLEDGED'],
            search: 'my-detector',
          },
          { startTime: 1000, endTime: 2000 },
          'detector_1'
        )
      ).toEqual({
        startIndex: 60,
        size: 20,
        sortString: 'monitor_name.keyword',
        sortOrder: 'asc',
        startTime: 1000,
        endTime: 2000,
        severityLevels: '1,2',
        alertStates: 'ACTIVE,ACKNOWLEDGED',
        searchString: 'my* detector*',
        detector_id: 'detector_1',
      });
    });

    it('omits the search if only special characters are entered', () => {
      expect(
        getAlertsPageParams({ ...DEFAULT_ALERTS_TABLE_QUERY, search: '*:()' }).searchString
      ).toBeUndefined();
    });

    it.each([
      // pageSize, pageIndex, startIndex, size
      [100, 99, 9900, 100],
      [10, 999, 9990, 10],
      [30, 332, 9960, 30],
      [30, 333, 9990, 10],
      [30, 334, 10020, 0],
    ])(
      'never requests past the 10,000 alerts window (page size %p, page %p)',
      (pageSize, pageIndex, startIndex, size) => {
        expect(
          getAlertsPageParams({ ...DEFAULT_ALERTS_TABLE_QUERY, pageSize, pageIndex })
        ).toMatchObject({ startIndex, size });
      }
    );
  });

  describe('sort fields', () => {
    it('maps the sortable columns to the backend sort fields and back', () => {
      expect(ALERTS_TABLE_SORT_FIELDS).toEqual({
        start_time: 'start_time',
        detectorName: 'monitor_name.keyword',
        state: 'state',
        severity: 'severity',
      });
      Object.entries(ALERTS_TABLE_SORT_FIELDS).forEach(([columnField, sortField]) =>
        expect(getAlertsTableColumnField(sortField)).toBe(columnField)
      );
      // every field the API can sort by has exactly one sortable column
      expect(Object.values(ALERTS_TABLE_SORT_FIELDS).sort()).toEqual(
        [...ALERTS_SORT_FIELDS].sort()
      );
    });
  });
});
