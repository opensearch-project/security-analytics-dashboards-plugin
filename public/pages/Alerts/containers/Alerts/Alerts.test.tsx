/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import moment from 'moment';
import Alerts from './Alerts';
import alertsMock from '../../../../../test/mocks/Alerts/Alerts.mock';
import { MemoryRouter } from 'react-router-dom';
import { setupCoreStart } from '../../../../../test/utils/helpers';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import detectorResponseMock from '../../../../../test/mocks/Detectors/containers/Detectors/DetectorResponse.mock';
import notificationsStartMock from '../../../../../test/mocks/services/notifications/NotificationsStart.mock';
import { DataStore } from '../../../../store/DataStore';
import { AlertsStore } from '../../../../store/AlertsStore';

beforeAll(() => {
  setupCoreStart();
});

const createAlert = (id: string, detectorId: string) => ({
  id,
  detector_id: detectorId,
  trigger_name: `trigger ${id}`,
  start_time: '2026-01-01T00:00:00.000Z',
  last_notification_time: '2026-01-01T00:00:00.000Z',
  state: 'ACTIVE',
  severity: '1',
  finding_ids: [],
  acknowledged_time: null,
});

const createAlerts = (detectorId: string, count: number) =>
  Array.from({ length: count }, (_, i) => createAlert(`${detectorId}-${i}`, detectorId));

const createDetectorHit = (id: string, name: string) => ({
  _id: id,
  _index: '.windows',
  _source: { ...detectorResponseMock, name },
});

const deferred = <T,>() => {
  let resolve: (value: T) => void = () => {};
  const promise = new Promise<T>((res) => (resolve = res));
  return { promise, resolve };
};

const okAlerts = (alerts: any[]) => ({
  ok: true,
  response: { alerts, total_alerts: alerts.length },
});

describe('<Alerts /> spec', () => {
  const originalAlertsStore = DataStore.alerts;
  let getAlerts: jest.Mock;
  let getDetectors: jest.Mock;

  const renderAlerts = () =>
    render(
      <MemoryRouter>
        <Alerts
          {...alertsMock}
          detectorService={{ getDetectors } as any}
          alertService={{ getAlerts } as any}
        />
      </MemoryRouter>
    );

  beforeEach(() => {
    // moment is globally mocked in the test setup and always returns the same instance, so stub the
    // time range check that the alerts page applies on the client.
    jest.spyOn(moment(), 'isBetween').mockReturnValue(true);
    getDetectors = jest.fn().mockResolvedValue({
      ok: true,
      response: {
        hits: {
          hits: [
            createDetectorHit('detector_1', 'Detector one'),
            createDetectorHit('detector_2', 'Detector two'),
          ],
        },
      },
    });
    getAlerts = jest.fn().mockResolvedValue(okAlerts([]));
    DataStore.alerts = new AlertsStore({ getAlerts } as any, notificationsStartMock);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    DataStore.alerts = originalAlertsStore;
  });

  it('renders the component', () => {
    const { container } = render(
      <MemoryRouter>
        <Alerts {...alertsMock} />
      </MemoryRouter>
    );
    expect(container).toMatchSnapshot();
  });

  it('shows the alerts of all detectors once all of them are loaded', async () => {
    const detector2Alerts = deferred<any>();
    getAlerts.mockImplementation((params) =>
      params.detector_id === 'detector_1'
        ? Promise.resolve(okAlerts(createAlerts('detector_1', 3)))
        : detector2Alerts.promise
    );

    renderAlerts();

    await waitFor(() => expect(getAlerts).toHaveBeenCalledTimes(2));
    // The alerts of the first detector are not rendered on their own while the rest are loading.
    expect(screen.queryByText('trigger detector_1-0')).not.toBeInTheDocument();

    detector2Alerts.resolve(okAlerts(createAlerts('detector_2', 2)));

    await screen.findByText('trigger detector_2-1');
    ['detector_1-0', 'detector_1-1', 'detector_1-2', 'detector_2-0', 'detector_2-1'].forEach((id) =>
      expect(screen.getByText(`trigger ${id}`)).toBeInTheDocument()
    );
    expect(screen.getAllByText('Detector one')).toHaveLength(3);
    expect(screen.getAllByText('Detector two')).toHaveLength(2);
    expect(getAlerts).toHaveBeenCalledTimes(2);
  });

  it('keeps showing the current rows while the alerts are refreshed', async () => {
    getAlerts.mockImplementation((params) =>
      Promise.resolve(
        okAlerts(params.detector_id === 'detector_1' ? createAlerts('detector_1', 1) : [])
      )
    );

    renderAlerts();
    await screen.findByText('trigger detector_1-0');

    const refreshedAlerts = deferred<any>();
    getAlerts.mockImplementation((params) =>
      params.detector_id === 'detector_1' ? refreshedAlerts.promise : Promise.resolve(okAlerts([]))
    );
    fireEvent.click(screen.getByTestId('superDatePickerApplyTimeButton'));

    await waitFor(() => expect(getAlerts).toHaveBeenCalledTimes(3));
    expect(screen.getByText('trigger detector_1-0')).toBeInTheDocument();

    refreshedAlerts.resolve(okAlerts(createAlerts('detector_1', 2)));

    await screen.findByText('trigger detector_1-1');
    expect(screen.getByText('trigger detector_1-0')).toBeInTheDocument();
  });
});
