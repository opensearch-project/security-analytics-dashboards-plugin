/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { EuiSmallButton, EuiDescriptionList } from '@elastic/eui';
import { ContentPanel } from '../../../components/ContentPanel';
import React from 'react';
import { IntegrationItem } from '../../../../types';
import { DataStore } from '../../../store/DataStore';
import { IntegrationForm } from './IntegrationForm';
import { NotificationsStart } from 'opensearch-dashboards/public';
import { successNotificationToast, setBreadcrumbs } from '../../../utils/helpers';
import { actionIsAllowedOnSpace } from '../../../../common/helpers';
import { SPACE_ACTIONS } from '../../../../common/constants';
import { BREADCRUMBS } from '../../../utils/constants';

export interface IntegrationDetailsProps {
  integrationDetails: IntegrationItem;
  isEditMode: boolean;
  notifications: NotificationsStart;
  setIsEditMode: (isEdit: boolean) => void;
  setIntegrationDetails: (integration: IntegrationItem) => void;
  integrationId: string;
}

export const IntegrationDetails: React.FC<IntegrationDetailsProps> = ({
  integrationDetails,
  isEditMode,
  notifications,
  setIsEditMode,
  setIntegrationDetails,
  integrationId,
}) => {
  const onUpdateIntegration = async (integrationData: IntegrationItem) => {
    const success = await DataStore.integrations.updateIntegration(integrationId, integrationData);
    if (success) {
      setIntegrationDetails(integrationData);
      setBreadcrumbs([BREADCRUMBS.INTEGRATIONS, { text: integrationData.document.title }]);
      successNotificationToast(
        notifications,
        'updated',
        `integration ${integrationData.document.title}`
      );
      setIsEditMode(false);
    }
  };

  return (
    <ContentPanel title="Details">
      <EuiDescriptionList
        listItems={[
          {
            description: (
              <IntegrationForm
                integrationDetails={integrationDetails}
                isEditMode={isEditMode}
                confirmButtonText={'Update'}
                notifications={notifications}
                onCancel={() => {
                  setIsEditMode(false);
                }}
                onConfirm={onUpdateIntegration}
              />
            ),
          },
        ]}
      />
    </ContentPanel>
  );
};
