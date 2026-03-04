/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import { IntegrationForm } from '../components/IntegrationForm';
import { CreateIntegrationRequestBody, IntegrationDocumentCreate } from '../../../../types';
import { defaultIntegration } from '../../../../common/constants';
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
  const integrationDetails: CreateIntegrationRequestBody = { ...defaultIntegration };

  setBreadcrumbs([BREADCRUMBS.INTEGRATIONS, BREADCRUMBS.INTEGRATIONS_CREATE]);

  const description = 'Create integration to categorize and identify rules for your data sources.'; // Replace Log Type is replaced with Integration by Wazuh

  const onCreateIntegration = async (integrationData: CreateIntegrationRequestBody) => {
    const { document } = integrationData;
    const integrationDocumentBody: IntegrationDocumentCreate = Object.fromEntries(
      [
        'author',
        'category',
        'description',
        'documentation',
        'references',
        'tags',
        'title',
      ].map((field) => [field, document[field as keyof typeof integrationData.document]])
    ) as IntegrationDocumentCreate;
    const success = await DataStore.integrations.createIntegration({
      document: integrationDocumentBody,
    });
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
