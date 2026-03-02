/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import { IntegrationForm } from '../components/IntegrationForm';
import { IntegrationBase, IntegrationItem } from '../../../../types';
import { defaultIntegration } from '../utils/constants';
import { RouteComponentProps } from 'react-router-dom';
import { BREADCRUMBS, ROUTES } from '../../../utils/constants';
import { DataStore } from '../../../store/DataStore';
import { setBreadcrumbs, successNotificationToast } from '../../../utils/helpers';
import { NotificationsStart } from 'opensearch-dashboards/public';
import { EuiPanel, EuiSpacer, EuiText } from '@elastic/eui';
import { PageHeader } from '../../../components/PageHeader/PageHeader';

export interface CreateIntegrationProps extends RouteComponentProps {
  notifications: NotificationsStart;
}

export const CreateIntegration: React.FC<CreateIntegrationProps> = ({ history, notifications }) => {
  const integrationDetails: IntegrationBase = { ...defaultIntegration };

  setBreadcrumbs([BREADCRUMBS.INTEGRATIONS, BREADCRUMBS.INTEGRATIONS_CREATE]);

  const description =
    'Create integration to categorize and identify detection rules for your data sources.'; // Replace Log Type is replaced with Integration by Wazuh

  const onCreateIntegration = async (integrationData: IntegrationItem) => {
    const success = await DataStore.integrations.createIntegration(integrationData);
    if (success) {
      successNotificationToast(
        notifications,
        'created',
        `integration ${integrationData.document.title}`
      );
      history.push(ROUTES.INTEGRATIONS);
    }
  };

  return (
    <EuiPanel>
      <PageHeader appDescriptionControls={[{ description }]}>
        <EuiText size="s">
          {/* Log Type is replaced with Integration by Wazuh */}
          <h1>Create integration</h1>
        </EuiText>
        <EuiText size="s" color="subdued">
          {description}
        </EuiText>
        <EuiSpacer />
      </PageHeader>
      <IntegrationForm
        integrationDetails={{
          ...integrationDetails,
          id: '',
          detectionRulesCount: 0,
        }}
        isEditMode={true}
        confirmButtonText={'Create integration'} // Replace Log Type to Integration by Wazuh
        notifications={notifications}
        onCancel={() => history.push(ROUTES.INTEGRATIONS)}
        onConfirm={onCreateIntegration}
      />
    </EuiPanel>
  );
};
