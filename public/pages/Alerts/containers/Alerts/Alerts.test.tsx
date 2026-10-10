/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import moment from 'moment';
import Alerts, { Alerts as AlertsComponent } from './Alerts';
import alertsMock from '../../../../../test/mocks/Alerts/Alerts.mock';
import { MemoryRouter, Route, RouteComponentProps } from 'react-router-dom';
import { setupCoreStart } from '../../../../../test/utils/helpers';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import detectorResponseMock from '../../../../../test/mocks/Detectors/containers/Detectors/DetectorResponse.mock';
import notificationsStartMock from '../../../../../test/mocks/services/notifications/NotificationsStart.mock';
import { DataStore } from '../../../../store/DataStore';
import { AlertsStore } from '../../../../store/AlertsStore';
import { ROUTES } from '../../../../utils/constants';
import { dataSourceInfo } from '../../../../services/utils/constants';

beforeAll(() => {
  setupCoreStart();
});

const OLD_BACKEND_ERROR =
  '[action_request_validation_exception] Validation Failed: 1: At least one of detector type or detector id needs to be passed;';

const createAlert = (id: string, detectorId: string, state = 'ACTIVE') => ({
  id,
  detector_id: detectorId,
  trigger_name: `trigger ${id}`,
  start_time: '2026-01-01T00:00:00.000Z',
  last_notification_time: '2026-01-01T00:00:00.000Z',
  state,
  severity: '1',
  finding_ids: [],
  acknowledged_time: null,
});

const createAlerts = (detectorId: string, count: number, offset = 0) =>
  Array.from({ length: count }, (_, i) => createAlert(`${detectorId}-${offset + i}`, detectorId));

const createDetectorHit = (id: string, name: string) => ({
  _id: id,
  _index: '.windows',
  _source: { ...detectorResponseMock, name },
});

const detectorsResponse = {
  ok: true,
  response: {
    hits: {
      hits: [
        createDetectorHit('detector_1', 'Detector one'),
        createDetectorHit('detector_2', 'Detector two'),
      ],
    },
  },
};

const deferred = <T,>() => {
  let resolve: (value: T) => void = () => {};
  const promise = new Promise<T>((res) => (resolve = res));
  return { promise, resolve };
};

const okAlerts = (alerts: any[], total = alerts.length) => ({
  ok: true,
  response: { alerts, total_alerts: total },
});

const isAllDetectorsRequest = (params: any) => !params.detector_id && !params.detectorType;

describe('<Alerts /> spec', () => {
  const originalAlertsStore = DataStore.alerts;
  const defaultDateTimeFilter = { startTime: 'now-24h', endTime: 'now' };
  let getAlerts: jest.Mock;
  let getDetectors: jest.Mock;
  let acknowledgeAlerts: jest.Mock;
  let getThreatIntelAlerts: jest.Mock;

  const renderAlerts = ({
    path = ROUTES.ALERTS,
    dateTimeFilter = defaultDateTimeFilter,
    dataSource,
  }: {
    path?: string;
    dateTimeFilter?: { startTime: string; endTime: string };
    dataSource?: { id: string };
  } = {}) => {
    let history: RouteComponentProps['history'] | undefined;
    let props = { dateTimeFilter, dataSource };
    const renderElement = () => (
      <MemoryRouter initialEntries={[path]}>
        <Route
          path={`${ROUTES.ALERTS}/:detectorId?`}
          render={(routeProps) => {
            history = routeProps.history;
            return (
              <Alerts
                {...alertsMock}
                {...props}
                detectorService={{ getDetectors } as any}
                alertService={{ getAlerts, acknowledgeAlerts } as any}
              />
            );
          }}
        />
      </MemoryRouter>
    );
    const result = render(renderElement());
    const update = (changes: Partial<typeof props>) => {
      props = { ...props, ...changes };
      result.rerender(renderElement());
    };
    return {
      ...result,
      setDateTimeFilter: (filter: { startTime: string; endTime: string }) =>
        update({ dateTimeFilter: filter }),
      setDataSource: (source: { id: string }) => {
        dataSourceInfo.activeDataSource = source;
        update({ dataSource: source });
      },
      navigate: (newPath: string) => act(() => history?.push(newPath)),
    };
  };

  const lastAlertsRequest = () => getAlerts.mock.calls[getAlerts.mock.calls.length - 1][0];

  // Waits until the given number of alerts requests were made and returns the last one.
  const waitForAlertsRequest = async (count: number) => {
    await waitFor(() => expect(getAlerts).toHaveBeenCalledTimes(count));
    return lastAlertsRequest();
  };

  const getTable = () => screen.getByTestId('detectionRuleAlertsTable');

  const getActivePage = () =>
    within(getTable())
      .getAllByRole('button')
      .find((button) => button.getAttribute('aria-current') === 'true');

  const clickColumnHeader = (columnField: string, index: number) =>
    fireEvent.click(
      within(screen.getByTestId(`tableHeaderCell_${columnField}_${index}`)).getByTestId(
        'tableHeaderSortButton'
      )
    );

  const selectFilterOption = (filter: string, value: string) => {
    if (!screen.queryByTestId(`${filter}-option-${value}`)) {
      fireEvent.click(screen.getByTestId(filter));
    }
    fireEvent.click(screen.getByTestId(`${filter}-option-${value}`));
  };

  // Renders the page with 100 alerts in total and waits for the first page.
  const renderWithAlerts = async (options?: Parameters<typeof renderAlerts>[0]) => {
    getAlerts.mockImplementation((params) =>
      Promise.resolve(okAlerts(createAlerts('detector_1', params.size, params.startIndex), 100))
    );
    const result = renderAlerts(options);
    await screen.findByText('trigger detector_1-0');
    return result;
  };

  // A store that doesn't know yet whether the backend supports getting pages of all alerts
  const createAlertsStore = () =>
    new AlertsStore({ getAlerts, getThreatIntelAlerts } as any, notificationsStartMock);

  beforeEach(async () => {
    getDetectors = jest.fn().mockResolvedValue(detectorsResponse);
    getAlerts = jest.fn().mockResolvedValue(okAlerts([]));
    getThreatIntelAlerts = jest.fn().mockResolvedValue(okAlerts([]));
    acknowledgeAlerts = jest.fn().mockResolvedValue({ ok: true, response: {} });
    DataStore.alerts = createAlertsStore();
    // The backend supports getting pages of all alerts unless a test says otherwise.
    await DataStore.alerts.detectAlertsServerSideSupport();
    getAlerts.mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    DataStore.alerts = originalAlertsStore;
    dataSourceInfo.activeDataSource = { id: '' };
  });

  it('renders the component', () => {
    const { container } = render(
      <MemoryRouter>
        <Alerts {...alertsMock} />
      </MemoryRouter>
    );
    expect(container).toMatchSnapshot();
  });

  describe('detection rule alerts paged by the backend', () => {
    it('gets the first page of the alerts of all detectors on load', async () => {
      const detectors = deferred<any>();
      const alerts = deferred<any>();
      getDetectors.mockReturnValue(detectors.promise);
      getAlerts.mockReturnValue(alerts.promise);

      renderAlerts();

      // Both requests are made before either of them completes.
      await waitFor(() => expect(getAlerts).toHaveBeenCalledTimes(1));
      expect(getDetectors).toHaveBeenCalledTimes(1);

      const params = lastAlertsRequest();
      expect(params).toEqual({
        startIndex: 0,
        size: 10,
        sortString: 'start_time',
        sortOrder: 'desc',
        startTime: expect.any(Number),
        endTime: expect.any(Number),
      });
      expect(params.endTime - params.startTime).toBeCloseTo(24 * 60 * 60 * 1000, -3);

      act(() => alerts.resolve(okAlerts(createAlerts('detector_1', 2), 2)));
      await screen.findByText('trigger detector_1-0');
      act(() => detectors.resolve(detectorsResponse));
      await waitFor(() => expect(screen.getAllByText('Detector one')).toHaveLength(2));
      expect(screen.getByText('Alerts (2)')).toBeInTheDocument();
      expect(getAlerts).toHaveBeenCalledTimes(1);
      expect(getDetectors).toHaveBeenCalledTimes(1);
    });

    it('shows the detector name of an alert or its detector id if the detector is unknown', async () => {
      getAlerts.mockResolvedValue(
        okAlerts([createAlert('a1', 'detector_2'), createAlert('a2', 'unknown_detector')])
      );

      renderAlerts();

      await screen.findByText('Detector two');
      expect(screen.getByText('unknown_detector')).toBeInTheDocument();

      // The details can only be shown for alerts of known detectors.
      expect(screen.getByText('trigger a1').closest('button')).toBeInTheDocument();
      expect(screen.getByText('trigger a2').closest('button')).toBeNull();
      const viewDetailsButtons = within(getTable()).getAllByLabelText('View details');
      expect(viewDetailsButtons[0]).toBeEnabled();
      expect(viewDetailsButtons[1]).toBeDisabled();
    });

    it('gets the alerts of the detector in the route', async () => {
      renderAlerts({ path: `${ROUTES.ALERTS}/detector_2` });

      const params = await waitForAlertsRequest(1);
      expect(params.detector_id).toBe('detector_2');
      expect(params.detectorType).toBeUndefined();
    });

    it('gets the selected page', async () => {
      await renderWithAlerts();

      fireEvent.click(screen.getByTestId('pagination-button-1'));
      expect(await waitForAlertsRequest(2)).toMatchObject({ startIndex: 10, size: 10 });

      await screen.findByText('trigger detector_1-10');
      expect(getActivePage()).toHaveTextContent('2');

      fireEvent.click(screen.getByTestId('pagination-button-next'));
      expect(await waitForAlertsRequest(3)).toMatchObject({ startIndex: 20, size: 10 });
      await screen.findByText('trigger detector_1-20');
      expect(getAlerts).toHaveBeenCalledTimes(3);
    });

    it('gets the first page with the selected page size', async () => {
      await renderWithAlerts();
      fireEvent.click(screen.getByTestId('pagination-button-2'));
      await waitForAlertsRequest(2);

      fireEvent.click(screen.getByTestId('tablePaginationPopoverButton'));
      fireEvent.click(await screen.findByTestId('tablePagination-50-rows'));

      expect(await waitForAlertsRequest(3)).toMatchObject({ startIndex: 0, size: 50 });
      await screen.findByText('trigger detector_1-49');
      expect(getAlerts).toHaveBeenCalledTimes(3);
    });

    it('offers page sizes of 10, 20, 50 and 100', async () => {
      await renderWithAlerts();

      fireEvent.click(screen.getByTestId('tablePaginationPopoverButton'));

      for (const size of [10, 20, 50, 100]) {
        expect(await screen.findByTestId(`tablePagination-${size}-rows`)).toBeInTheDocument();
      }
    });

    it.each([
      ['start_time', 0, 'start_time'],
      ['detectorName', 2, 'monitor_name.keyword'],
      ['state', 3, 'state'],
      ['severity', 4, 'severity'],
    ])(
      'sorts by the %s column in both directions on the first page',
      async (columnField, columnIndex, sortString) => {
        await renderWithAlerts();
        fireEvent.click(screen.getByTestId('pagination-button-1'));
        await waitForAlertsRequest(2);

        // Start time is sorted descending by default, so its first click sorts ascending too.
        clickColumnHeader(columnField, columnIndex);
        expect(await waitForAlertsRequest(3)).toMatchObject({
          startIndex: 0,
          sortString,
          sortOrder: 'asc',
        });

        clickColumnHeader(columnField, columnIndex);
        expect(await waitForAlertsRequest(4)).toMatchObject({
          startIndex: 0,
          sortString,
          sortOrder: 'desc',
        });
        expect(getAlerts).toHaveBeenCalledTimes(4);
      }
    );

    it('does not sort by trigger name', async () => {
      await renderWithAlerts();

      expect(
        within(screen.getByTestId('tableHeaderCell_trigger_name_1')).queryByTestId(
          'tableHeaderSortButton'
        )
      ).not.toBeInTheDocument();
    });

    it('filters by any number of severities on the first page', async () => {
      await renderWithAlerts();
      fireEvent.click(screen.getByTestId('pagination-button-1'));
      await waitForAlertsRequest(2);

      selectFilterOption('alertsSeverityFilter', '3');
      expect(await waitForAlertsRequest(3)).toMatchObject({ startIndex: 0, severityLevels: '3' });

      selectFilterOption('alertsSeverityFilter', '1');
      expect(await waitForAlertsRequest(4)).toMatchObject({
        startIndex: 0,
        severityLevels: '1,3',
      });

      // Only the last of quickly made changes is requested.
      selectFilterOption('alertsSeverityFilter', '3');
      selectFilterOption('alertsSeverityFilter', '1');
      const params = await waitForAlertsRequest(5);
      expect(params.severityLevels).toBeUndefined();
      expect(params.severityLevel).toBeUndefined();
    });

    it('offers all severities and statuses as filter options', async () => {
      await renderWithAlerts();

      fireEvent.click(screen.getByTestId('alertsSeverityFilter'));
      [
        ['1', '1 (Highest)'],
        ['2', '2 (High)'],
        ['3', '3 (Medium)'],
        ['4', '4 (Low)'],
        ['5', '5 (Lowest)'],
      ].forEach(([severity, label]) =>
        expect(screen.getByTestId(`alertsSeverityFilter-option-${severity}`)).toHaveTextContent(
          label
        )
      );

      fireEvent.click(screen.getByTestId('alertsStatusFilter'));
      [
        ['ACTIVE', 'Active'],
        ['ACKNOWLEDGED', 'Acknowledged'],
        ['COMPLETED', 'Completed'],
        ['ERROR', 'Error'],
        ['DELETED', 'Deleted'],
      ].forEach(([state, label]) =>
        expect(screen.getByTestId(`alertsStatusFilter-option-${state}`)).toHaveTextContent(label)
      );
    });

    it('filters by any number of statuses on the first page', async () => {
      await renderWithAlerts();
      fireEvent.click(screen.getByTestId('pagination-button-1'));
      await waitForAlertsRequest(2);

      selectFilterOption('alertsStatusFilter', 'COMPLETED');
      expect(await waitForAlertsRequest(3)).toMatchObject({
        startIndex: 0,
        alertStates: 'COMPLETED',
      });

      selectFilterOption('alertsStatusFilter', 'ACTIVE');
      expect(await waitForAlertsRequest(4)).toMatchObject({
        startIndex: 0,
        alertStates: 'ACTIVE,COMPLETED',
      });
      expect(lastAlertsRequest().alertState).toBeUndefined();
    });

    it('searches with a sanitized query string after the input settles', async () => {
      await renderWithAlerts();
      fireEvent.click(screen.getByTestId('pagination-button-1'));
      await waitForAlertsRequest(2);

      // Typing fires input events.
      const searchField = screen.getByTestId('alertsSearchField');
      fireEvent.input(searchField, { target: { value: 'a' } });
      fireEvent.input(searchField, { target: { value: 'a-b' } });
      fireEvent.input(searchField, { target: { value: 'A-b:c (d)' } });

      // Nothing is requested before the debounce time passed.
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(getAlerts).toHaveBeenCalledTimes(2);

      expect(await waitForAlertsRequest(3)).toMatchObject({
        startIndex: 0,
        searchString: 'a* b\\:c* d*',
      });

      // Only adding characters that are ignored doesn't search again.
      fireEvent.input(searchField, { target: { value: 'A-b:c (d) "*' } });
      await new Promise((resolve) => setTimeout(resolve, 500));
      expect(getAlerts).toHaveBeenCalledTimes(3);

      fireEvent.input(searchField, { target: { value: '' } });
      const params = await waitForAlertsRequest(4);
      expect(params.searchString).toBeUndefined();
    });

    it('searches immediately when the search is submitted', async () => {
      await renderWithAlerts();

      const searchField = screen.getByTestId('alertsSearchField');
      fireEvent.input(searchField, { target: { value: 'Größe_über' } });
      fireEvent.keyUp(searchField, { key: 'Enter', target: { value: 'Größe_über' } });

      expect(await waitForAlertsRequest(2)).toMatchObject({ searchString: 'größe_über*' });
      // The pending debounced search doesn't make another request.
      await new Promise((resolve) => setTimeout(resolve, 500));
      expect(getAlerts).toHaveBeenCalledTimes(2);
    });

    it('gets the first page for the selected time range', async () => {
      const { setDateTimeFilter } = await renderWithAlerts();
      fireEvent.click(screen.getByTestId('pagination-button-1'));
      await waitForAlertsRequest(2);

      setDateTimeFilter({ startTime: 'now-7d', endTime: 'now' });

      const params = await waitForAlertsRequest(3);
      expect(params.startIndex).toBe(0);
      expect(params.endTime - params.startTime).toBeCloseTo(7 * 24 * 60 * 60 * 1000, -3);
      expect(getDetectors).toHaveBeenCalledTimes(1);
    });

    it('keeps the current page when refreshing', async () => {
      await renderWithAlerts();
      fireEvent.click(screen.getByTestId('pagination-button-1'));
      await waitForAlertsRequest(2);
      await screen.findByText('trigger detector_1-10');

      const refreshed = deferred<any>();
      getAlerts.mockReturnValue(refreshed.promise);
      fireEvent.click(screen.getByTestId('superDatePickerApplyTimeButton'));

      expect(await waitForAlertsRequest(3)).toMatchObject({ startIndex: 10, size: 10 });
      expect(getDetectors).toHaveBeenCalledTimes(2);
      // The current rows stay visible while loading.
      expect(screen.getByText('trigger detector_1-10')).toBeInTheDocument();

      act(() => refreshed.resolve(okAlerts(createAlerts('detector_2', 10, 10), 100)));

      await screen.findByText('trigger detector_2-10');
      expect(getActivePage()).toHaveTextContent('2');
      expect(getAlerts).toHaveBeenCalledTimes(3);
    });

    it('ignores the responses of superseded requests', async () => {
      await renderWithAlerts();

      const page2 = deferred<any>();
      const page3 = deferred<any>();
      getAlerts.mockReturnValueOnce(page2.promise).mockReturnValueOnce(page3.promise);

      fireEvent.click(screen.getByTestId('pagination-button-1'));
      await waitForAlertsRequest(2);
      fireEvent.click(screen.getByTestId('pagination-button-2'));
      await waitForAlertsRequest(3);

      act(() => page3.resolve(okAlerts(createAlerts('detector_1', 10, 20), 100)));
      await screen.findByText('trigger detector_1-20');

      await act(async () => page2.resolve(okAlerts(createAlerts('detector_1', 10, 10), 100)));

      expect(screen.getByText('trigger detector_1-20')).toBeInTheDocument();
      expect(screen.queryByText('trigger detector_1-10')).not.toBeInTheDocument();
      expect(getActivePage()).toHaveTextContent('3');
    });

    it('shows an error and keeps the current rows when getting alerts fails', async () => {
      await renderWithAlerts();

      getAlerts.mockResolvedValue({ ok: false, error: 'Something failed' });
      fireEvent.click(screen.getByTestId('pagination-button-1'));
      await waitForAlertsRequest(2);

      await waitFor(() =>
        expect(notificationsStartMock.toasts.addDanger).toHaveBeenCalledWith(
          expect.objectContaining({ text: 'Something failed' })
        )
      );
      expect(screen.getByText('trigger detector_1-0')).toBeInTheDocument();
      expect(getAlerts).toHaveBeenCalledTimes(2);
    });

    it('shows that the alerts are capped at 10,000', async () => {
      getAlerts.mockImplementation((params) =>
        Promise.resolve(okAlerts(createAlerts('detector_1', params.size, params.startIndex), 10000))
      );

      renderAlerts();

      expect(await screen.findByText('Alerts (10,000+)')).toBeInTheDocument();
      expect(
        screen.getByText(
          'Showing the first 10,000 matching alerts. Narrow the time range or filters to see more.'
        )
      ).toBeInTheDocument();
    });

    it('does not show the cap note for less than 10,000 alerts', async () => {
      await renderWithAlerts();

      expect(screen.getByText('Alerts (100)')).toBeInTheDocument();
      expect(screen.queryByText(/Showing the first 10,000/)).not.toBeInTheDocument();
    });

    it('never requests alerts past the 10,000 alerts window', async () => {
      getAlerts.mockImplementation((params) =>
        Promise.resolve(okAlerts(createAlerts('detector_1', params.size, params.startIndex), 10000))
      );
      renderAlerts();
      await screen.findByText('trigger detector_1-0');

      fireEvent.click(screen.getByTestId('tablePaginationPopoverButton'));
      fireEvent.click(await screen.findByTestId('tablePagination-100-rows'));
      await waitForAlertsRequest(2);

      // The last page of the window
      fireEvent.click(await screen.findByTestId('pagination-button-99'));
      expect(await waitForAlertsRequest(3)).toMatchObject({ startIndex: 9900, size: 100 });
      expect(screen.queryByTestId('pagination-button-100')).not.toBeInTheDocument();
    });

    it('gets the current page again after acknowledging alerts', async () => {
      await renderWithAlerts();
      fireEvent.click(screen.getByTestId('pagination-button-1'));
      await waitForAlertsRequest(2);
      await screen.findByText('trigger detector_1-10');

      fireEvent.click(within(getTable()).getAllByLabelText('Acknowledge')[0]);

      await waitFor(() =>
        expect(acknowledgeAlerts).toHaveBeenCalledWith(['detector_1-10'], 'detector_1')
      );
      expect(await waitForAlertsRequest(3)).toMatchObject({ startIndex: 10, size: 10 });
      await waitFor(() => expect(screen.getByTestId('acknowledge-button')).toBeDisabled());
      expect(getActivePage()).toHaveTextContent('2');
    });

    it('gets the last page if no alerts are left on the page after acknowledging', async () => {
      await renderWithAlerts();
      fireEvent.click(screen.getByTestId('pagination-button-9'));
      await waitForAlertsRequest(2);
      await screen.findByText('trigger detector_1-90');

      // Only active alerts are shown and all alerts of the last page get acknowledged.
      getAlerts.mockImplementation((params) =>
        Promise.resolve(
          params.startIndex >= 90
            ? okAlerts([], 90)
            : okAlerts(createAlerts('detector_1', params.size, params.startIndex), 90)
        )
      );
      fireEvent.click(within(getTable()).getAllByLabelText('Acknowledge')[0]);

      await screen.findByText('trigger detector_1-80');
      expect(getAlerts.mock.calls[2][0]).toMatchObject({ startIndex: 90 });
      expect(getAlerts.mock.calls[3][0]).toMatchObject({ startIndex: 80 });
      expect(getActivePage()).toHaveTextContent('9');
      expect(getAlerts).toHaveBeenCalledTimes(4);
    });

    it('only allows selecting active alerts and clears the selection on page change', async () => {
      getAlerts.mockImplementation((params) =>
        Promise.resolve(
          okAlerts(
            [
              createAlert(`active-${params.startIndex}`, 'detector_1'),
              createAlert(`acknowledged-${params.startIndex}`, 'detector_1', 'ACKNOWLEDGED'),
            ],
            100
          )
        )
      );
      renderAlerts();
      await screen.findByText('trigger active-0');

      const activeCheckbox = screen.getByTestId('checkboxSelectRow-active-0');
      expect(activeCheckbox).toBeEnabled();
      expect(screen.getByTestId('checkboxSelectRow-acknowledged-0')).toBeDisabled();

      fireEvent.click(activeCheckbox);
      expect(screen.getByTestId('acknowledge-button')).toBeEnabled();

      fireEvent.click(screen.getByTestId('pagination-button-1'));
      expect(screen.getByTestId('acknowledge-button')).toBeDisabled();
      await screen.findByText('trigger active-10');
      expect(screen.getByTestId('acknowledge-button')).toBeDisabled();
    });
  });

  describe('detection rule alerts with a backend that only gets alerts per detector', () => {
    const mockOldBackend = (alertsByDetector: { [detectorId: string]: any[] | Promise<any> }) =>
      getAlerts.mockImplementation((params) => {
        if (isAllDetectorsRequest(params)) {
          return Promise.resolve({ ok: false, error: OLD_BACKEND_ERROR });
        }
        const alerts = alertsByDetector[params.detector_id] ?? [];
        return Array.isArray(alerts) ? Promise.resolve(okAlerts(alerts)) : alerts;
      });

    beforeEach(() => {
      DataStore.alerts = createAlertsStore();
      // moment is globally mocked in the test setup and always returns the same instance, so stub
      // the time range check that is applied on the client.
      jest.spyOn(moment(), 'isBetween').mockReturnValue(true);
    });

    it('falls back to loading the alerts of every detector without an error', async () => {
      mockOldBackend({
        detector_1: createAlerts('detector_1', 3),
        detector_2: createAlerts('detector_2', 2),
      });

      renderAlerts();

      await screen.findByText('trigger detector_2-1');
      expect(getAlerts.mock.calls.map(([params]) => params.detector_id)).toEqual([
        undefined,
        'detector_1',
        'detector_2',
      ]);
      expect(getDetectors).toHaveBeenCalledTimes(1);
      expect(notificationsStartMock.toasts.addDanger).not.toHaveBeenCalled();
      expect(screen.getAllByText('Detector one')).toHaveLength(3);
      expect(screen.getAllByText('Detector two')).toHaveLength(2);
      expect(screen.queryByTestId('alertsSearchField')).not.toBeInTheDocument();

      // Refreshing doesn't try to get the alerts of all detectors again.
      fireEvent.click(screen.getByTestId('superDatePickerApplyTimeButton'));
      await waitForAlertsRequest(5);
      expect(getAlerts.mock.calls.slice(3).map(([params]) => params.detector_id)).toEqual([
        'detector_1',
        'detector_2',
      ]);
    });

    it('shows the alerts of all detectors once all of them are loaded', async () => {
      const detector2Alerts = deferred<any>();
      mockOldBackend({
        detector_1: createAlerts('detector_1', 3),
        detector_2: detector2Alerts.promise,
      });

      renderAlerts();

      await waitForAlertsRequest(3);
      // The alerts of the first detector are not rendered on their own while the rest are loading.
      expect(screen.queryByText('trigger detector_1-0')).not.toBeInTheDocument();

      act(() => detector2Alerts.resolve(okAlerts(createAlerts('detector_2', 2))));

      await screen.findByText('trigger detector_2-1');
      ['detector_1-0', 'detector_1-1', 'detector_1-2', 'detector_2-0'].forEach((id) =>
        expect(screen.getByText(`trigger ${id}`)).toBeInTheDocument()
      );
      expect(getAlerts).toHaveBeenCalledTimes(3);
    });

    it('keeps showing the current rows while the alerts are refreshed', async () => {
      mockOldBackend({ detector_1: createAlerts('detector_1', 1) });

      renderAlerts();
      await screen.findByText('trigger detector_1-0');

      const refreshedAlerts = deferred<any>();
      mockOldBackend({ detector_1: refreshedAlerts.promise });
      fireEvent.click(screen.getByTestId('superDatePickerApplyTimeButton'));

      await waitForAlertsRequest(4);
      expect(screen.getByText('trigger detector_1-0')).toBeInTheDocument();

      act(() => refreshedAlerts.resolve(okAlerts(createAlerts('detector_1', 2))));

      await screen.findByText('trigger detector_1-1');
      expect(screen.getByText('trigger detector_1-0')).toBeInTheDocument();
    });

    it('does not fall back for other errors', async () => {
      getAlerts.mockResolvedValue({
        ok: false,
        error: '[action_request_validation_exception] Validation Failed: 1: invalid sort',
      });

      renderAlerts();

      await waitFor(() => expect(notificationsStartMock.toasts.addDanger).toHaveBeenCalled());
      expect(getAlerts).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId('alertsSearchField')).toBeInTheDocument();
    });
  });
  describe('detection rule alerts after the first page load', () => {
    it('gets the first page for another detector in the route', async () => {
      const { navigate } = await renderWithAlerts({ path: `${ROUTES.ALERTS}/detector_1` });
      fireEvent.click(screen.getByTestId('pagination-button-2'));
      expect(await waitForAlertsRequest(2)).toMatchObject({
        startIndex: 20,
        detector_id: 'detector_1',
      });
      await screen.findByText('trigger detector_1-20');

      navigate(`${ROUTES.ALERTS}/detector_2`);

      expect(await waitForAlertsRequest(3)).toMatchObject({
        startIndex: 0,
        detector_id: 'detector_2',
      });
      await screen.findByText('trigger detector_1-0');
      expect(getActivePage()).toHaveTextContent('1');
    });

    it('loads the last page if the total shrank below the current page on refresh', async () => {
      await renderWithAlerts();
      fireEvent.click(screen.getByTestId('pagination-button-9'));
      await waitForAlertsRequest(2);
      await screen.findByText('trigger detector_1-90');

      // Only 45 alerts are left.
      getAlerts.mockImplementation((params) =>
        Promise.resolve(
          okAlerts(
            createAlerts(
              'detector_1',
              Math.max(0, Math.min(params.size, 45 - params.startIndex)),
              params.startIndex
            ),
            45
          )
        )
      );
      fireEvent.click(screen.getByTestId('superDatePickerApplyTimeButton'));

      await screen.findByText('trigger detector_1-40');
      expect(getAlerts.mock.calls[2][0]).toMatchObject({ startIndex: 90 });
      expect(getAlerts.mock.calls[3][0]).toMatchObject({ startIndex: 40, size: 10 });
      expect(getActivePage()).toHaveTextContent('5');
      expect(screen.getByText('Alerts (45)')).toBeInTheDocument();
      expect(getAlerts).toHaveBeenCalledTimes(4);
    });

    it('makes at most one more request if the last page is empty too', async () => {
      await renderWithAlerts();
      fireEvent.click(screen.getByTestId('pagination-button-9'));
      await waitForAlertsRequest(2);
      await screen.findByText('trigger detector_1-90');

      // Every page is empty and the total keeps shrinking.
      let total = 60;
      getAlerts.mockImplementation(() => {
        total -= 20;
        return Promise.resolve(okAlerts([], total));
      });
      fireEvent.click(screen.getByTestId('superDatePickerApplyTimeButton'));

      await waitForAlertsRequest(4);
      await waitFor(() => expect(screen.getByText('Alerts (20)')).toBeInTheDocument());
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(getAlerts.mock.calls[2][0]).toMatchObject({ startIndex: 90 });
      // The last page for the total of the first response
      expect(getAlerts.mock.calls[3][0]).toMatchObject({ startIndex: 30 });
      expect(getAlerts).toHaveBeenCalledTimes(4);
      // The table shows the last page for the total of the last response.
      expect(getActivePage()).toHaveTextContent('2');
    });

    it('goes to the first page without another request if there are no alerts left', async () => {
      await renderWithAlerts();
      fireEvent.click(screen.getByTestId('pagination-button-9'));
      await waitForAlertsRequest(2);
      await screen.findByText('trigger detector_1-90');

      getAlerts.mockResolvedValue(okAlerts([], 0));
      fireEvent.click(screen.getByTestId('superDatePickerApplyTimeButton'));

      await waitForAlertsRequest(3);
      await waitFor(() => expect(screen.getByText('Alerts (0)')).toBeInTheDocument());
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(getAlerts).toHaveBeenCalledTimes(3);

      // The next load gets the first page.
      fireEvent.click(screen.getByTestId('superDatePickerApplyTimeButton'));
      expect(await waitForAlertsRequest(4)).toMatchObject({ startIndex: 0 });
    });

    it('does not acknowledge alerts without a detector', async () => {
      getAlerts.mockResolvedValue(
        okAlerts([
          createAlert('a1', 'detector_1'),
          { ...createAlert('a2', ''), detector_id: undefined },
        ])
      );
      renderAlerts();
      await screen.findByText('trigger a2');

      fireEvent.click(within(getTable()).getAllByLabelText('Acknowledge')[1]);
      await waitForAlertsRequest(2);
      expect(acknowledgeAlerts).not.toHaveBeenCalled();

      await waitFor(() => expect(screen.getByTestId('checkboxSelectRow-a1')).toBeEnabled());
      fireEvent.click(screen.getByTestId('checkboxSelectRow-a1'));
      fireEvent.click(screen.getByTestId('checkboxSelectRow-a2'));
      fireEvent.click(screen.getByTestId('acknowledge-button'));

      await waitForAlertsRequest(3);
      expect(acknowledgeAlerts).toHaveBeenCalledTimes(1);
      expect(acknowledgeAlerts).toHaveBeenCalledWith(['a1'], 'detector_1');
    });

    it('clears the selection on refresh', async () => {
      await renderWithAlerts();
      fireEvent.click(screen.getByTestId('checkboxSelectRow-detector_1-0'));
      expect(screen.getByTestId('acknowledge-button')).toBeEnabled();

      getAlerts.mockReturnValue(deferred<any>().promise);
      fireEvent.click(screen.getByTestId('superDatePickerApplyTimeButton'));

      await waitForAlertsRequest(2);
      expect(screen.getByTestId('acknowledge-button')).toBeDisabled();
      expect(screen.getByTestId('checkboxSelectRow-detector_1-0')).not.toBeChecked();
    });

    it('clears the selection when switching tabs', async () => {
      await renderWithAlerts();
      fireEvent.click(screen.getByTestId('checkboxSelectRow-detector_1-0'));
      expect(screen.getByTestId('acknowledge-button')).toBeEnabled();

      fireEvent.click(screen.getByText('Threat intel'));
      await waitFor(() => expect(getThreatIntelAlerts).toHaveBeenCalled());
      fireEvent.click(screen.getByText('Detection rules'));

      await screen.findByText('trigger detector_1-0');
      expect(screen.getByTestId('acknowledge-button')).toBeDisabled();
    });

    it('only shows the detectors of the latest load', async () => {
      const firstLoad = deferred<any>();
      const secondLoad = deferred<any>();
      getDetectors.mockReturnValueOnce(firstLoad.promise).mockReturnValueOnce(secondLoad.promise);
      getAlerts.mockResolvedValue(okAlerts([createAlert('a1', 'detector_1')]));
      renderAlerts();
      await screen.findByText('trigger a1');

      fireEvent.click(screen.getByTestId('superDatePickerApplyTimeButton'));
      await waitFor(() => expect(getDetectors).toHaveBeenCalledTimes(2));

      act(() =>
        secondLoad.resolve({
          ok: true,
          response: { hits: { hits: [createDetectorHit('detector_1', 'New name')] } },
        })
      );
      await screen.findByText('New name');
      await act(async () =>
        firstLoad.resolve({
          ok: true,
          response: { hits: { hits: [createDetectorHit('detector_1', 'Old name')] } },
        })
      );

      expect(screen.getByText('New name')).toBeInTheDocument();
      expect(screen.queryByText('Old name')).not.toBeInTheDocument();
    });

    it('ignores the detectors response after leaving the page', async () => {
      const detectors = deferred<any>();
      getDetectors.mockReturnValue(detectors.promise);
      const { unmount } = renderAlerts();
      await waitForAlertsRequest(1);
      await waitFor(() => expect(getDetectors).toHaveBeenCalledTimes(1));

      unmount();
      const setState = jest.spyOn(AlertsComponent.prototype, 'setState');
      await act(async () => detectors.resolve({ ok: false, error: 'Failed' }));

      expect(setState).not.toHaveBeenCalled();
      expect(notificationsStartMock.toasts.addDanger).not.toHaveBeenCalled();
    });
  });

  describe('server side support detection', () => {
    const NEW_PARAMS = ['sortString', 'severityLevels', 'alertStates', 'searchString'];

    const isProbe = (params: any) => isAllDetectorsRequest(params) && params.size === 0;

    const probeCount = () => getAlerts.mock.calls.filter(([params]) => isProbe(params)).length;

    beforeEach(() => {
      DataStore.alerts = createAlertsStore();
      jest.spyOn(moment(), 'isBetween').mockReturnValue(true);
    });

    it('falls back without sending new params on the route of a detector of an older backend', async () => {
      const probe = deferred<any>();
      getAlerts.mockImplementation((params) =>
        isAllDetectorsRequest(params)
          ? probe.promise
          : Promise.resolve(okAlerts(createAlerts(params.detector_id, 2)))
      );
      renderAlerts({ path: `${ROUTES.ALERTS}/detector_1` });

      expect(await waitForAlertsRequest(1)).toEqual({
        startIndex: 0,
        size: 0,
        dataSource: { id: '' },
      });
      // Filter while it's unknown if the backend supports filters.
      selectFilterOption('alertsSeverityFilter', '3');
      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(getAlerts).toHaveBeenCalledTimes(1);

      act(() => probe.resolve({ ok: false, error: OLD_BACKEND_ERROR }));

      await screen.findByText('trigger detector_1-1');
      expect(screen.queryByTestId('alertsSearchField')).not.toBeInTheDocument();
      expect(notificationsStartMock.toasts.addDanger).not.toHaveBeenCalled();

      fireEvent.click(screen.getByTestId('superDatePickerApplyTimeButton'));
      await waitForAlertsRequest(3);
      expect(getAlerts.mock.calls.slice(1).map(([params]) => params.detector_id)).toEqual([
        'detector_1',
        'detector_1',
      ]);
      getAlerts.mock.calls.forEach(([params]) =>
        NEW_PARAMS.forEach((param) => expect(params[param]).toBeUndefined())
      );
      expect(probeCount()).toBe(1);
    });

    it('detects the support once per data source', async () => {
      getAlerts.mockImplementation((params) =>
        Promise.resolve(
          okAlerts(createAlerts('detector_1', params.size, params.startIndex ?? 0), 100)
        )
      );
      const { unmount } = renderAlerts();
      await screen.findByText('trigger detector_1-0');
      fireEvent.click(screen.getByTestId('pagination-button-1'));
      await screen.findByText('trigger detector_1-10');
      unmount();

      renderAlerts({ path: `${ROUTES.ALERTS}/detector_1` });
      await waitFor(() => expect(getAlerts).toHaveBeenCalledTimes(4));
      await screen.findByText('trigger detector_1-0');

      expect(probeCount()).toBe(1);
      expect(getAlerts.mock.calls[0][0]).toEqual({
        startIndex: 0,
        size: 0,
        dataSource: { id: '' },
      });
      expect(getAlerts.mock.calls[1][0]).toMatchObject({ startIndex: 0, size: 10 });
    });

    it('shows other errors and detects the support again on the next load', async () => {
      getAlerts.mockResolvedValueOnce({ ok: false, error: 'Service unavailable' });
      renderAlerts();

      await waitFor(() =>
        expect(notificationsStartMock.toasts.addDanger).toHaveBeenCalledWith(
          expect.objectContaining({ text: 'Service unavailable' })
        )
      );
      expect(getAlerts).toHaveBeenCalledTimes(1);
      // The mode doesn't change.
      expect(screen.getByTestId('alertsSearchField')).toBeInTheDocument();

      getAlerts.mockImplementation((params) =>
        Promise.resolve(okAlerts(createAlerts('detector_1', params.size, params.startIndex), 100))
      );
      fireEvent.click(screen.getByTestId('superDatePickerApplyTimeButton'));

      await screen.findByText('trigger detector_1-0');
      expect(probeCount()).toBe(2);
      expect(getAlerts.mock.calls[2][0]).toMatchObject({ startIndex: 0, size: 10 });
      expect(getAlerts).toHaveBeenCalledTimes(3);
    });

    it('resets the page and detects the support per data source when it changes', async () => {
      const oldBackendId = 'old-cluster';
      getAlerts.mockImplementation((params) => {
        const dataSourceId = params.dataSource?.id ?? dataSourceInfo.activeDataSource.id;
        if (dataSourceId === oldBackendId) {
          return Promise.resolve(
            isAllDetectorsRequest(params)
              ? { ok: false, error: OLD_BACKEND_ERROR }
              : okAlerts(createAlerts(`${params.detector_id}-old`, 1))
          );
        }
        if (dataSourceId === 'flaky-cluster') {
          return Promise.resolve({ ok: false, error: 'Service unavailable' });
        }
        return Promise.resolve(
          okAlerts(createAlerts('detector_1', params.size, params.startIndex), 100)
        );
      });
      dataSourceInfo.activeDataSource = { id: 'new-cluster' };
      const { setDataSource } = renderAlerts({ dataSource: { id: 'new-cluster' } });
      await screen.findByText('trigger detector_1-0');
      fireEvent.click(screen.getByTestId('pagination-button-2'));
      await screen.findByText('trigger detector_1-20');

      setDataSource({ id: oldBackendId });
      await screen.findByText('trigger detector_2-old-0');
      expect(screen.queryByTestId('alertsSearchField')).not.toBeInTheDocument();
      expect(probeCount()).toBe(2);

      // Other errors keep the current mode.
      setDataSource({ id: 'flaky-cluster' });
      await waitFor(() =>
        expect(notificationsStartMock.toasts.addDanger).toHaveBeenCalledWith(
          expect.objectContaining({ text: 'Service unavailable' })
        )
      );
      expect(screen.queryByTestId('alertsSearchField')).not.toBeInTheDocument();
      expect(probeCount()).toBe(3);

      const callsBefore = getAlerts.mock.calls.length;
      setDataSource({ id: 'new-cluster' });
      await screen.findByText('trigger detector_1-0');
      expect(screen.getByTestId('alertsSearchField')).toBeInTheDocument();
      expect(getActivePage()).toHaveTextContent('1');
      expect(getAlerts.mock.calls.slice(callsBefore).map(([params]) => params)).toEqual([
        expect.objectContaining({ startIndex: 0, size: 10 }),
      ]);
      expect(probeCount()).toBe(3);
      getAlerts.mock.calls
        .filter(([params]) => (params.dataSource?.id ?? '') === oldBackendId || params.detector_id)
        .forEach(([params]) =>
          NEW_PARAMS.forEach((param) => expect(params[param]).toBeUndefined())
        );
    });
  });
});
