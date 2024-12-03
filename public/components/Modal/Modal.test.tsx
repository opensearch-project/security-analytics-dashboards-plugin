/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiButton, EuiOverlayMask, EuiModal } from '@elastic/eui';
import { render, fireEvent } from '@testing-library/react';
import ModalRoot from './ModalRoot';
import { ModalConsumer, ModalProvider } from './Modal';
import { SecurityAnalyticsContext, SaContextConsumer, MetricsService } from '../../services';
import services from '../../../test/mocks/services';
import { MetricsContext } from '../../metrics/MetricsContext';
import httpClientMock from '../../../test/mocks/services/httpClient.mock';

describe('<ModalRoot /> spec', () => {
  it('renders nothing when not used', () => {
    const { container } = render(
      <SecurityAnalyticsContext.Provider
        value={{ services, metrics: new MetricsContext(new MetricsService(httpClientMock)) }}
      >
        <ModalProvider>
          <SaContextConsumer>
            {(context) => context?.services && <ModalRoot services={context?.services} />}
          </SaContextConsumer>
        </ModalProvider>
      </SecurityAnalyticsContext.Provider>
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders a modal that can close and open', () => {
    const Modal = ({ onClose, text }: { onClose: () => {}; text: string }) => (
      <EuiOverlayMask>
        <EuiModal onClose={onClose}>A modal that has {text}</EuiModal>
      </EuiOverlayMask>
    );
    const { queryByText, getByTestId, getByLabelText } = render(
      <div>
        <SecurityAnalyticsContext.Provider
          value={{ services, metrics: new MetricsContext(new MetricsService(httpClientMock)) }}
        >
          <ModalProvider>
            <SaContextConsumer>
              {(context) => context?.services && <ModalRoot services={context.services} />}
            </SaContextConsumer>
            <ModalConsumer>
              {({ onShow }) => (
                <EuiButton
                  data-test-subj="showModal"
                  onClick={() => onShow(Modal, { text: 'interesting text' })}
                >
                  Show Modal
                </EuiButton>
              )}
            </ModalConsumer>
          </ModalProvider>
        </SecurityAnalyticsContext.Provider>
      </div>
    );

    expect(queryByText('A modal that has interesting text')).toBeNull();

    fireEvent.click(getByTestId('showModal'));

    expect(queryByText('A modal that has interesting text')).not.toBeNull();

    fireEvent.click(getByLabelText('Closes this modal window'));

    expect(queryByText('A modal that has interesting text')).toBeNull();
  });
});
