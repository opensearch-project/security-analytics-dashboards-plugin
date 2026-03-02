/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { LogTypeForm } from '../components/LogTypeForm';
import { LogTypeBase } from '../../../../types';
import { defaultLogType } from '../utils/constants';
import { RouteComponentProps } from 'react-router-dom';
import { BREADCRUMBS, ROUTES } from '../../../utils/constants';
import { useEffect } from 'react';
import { DataStore } from '../../../store/DataStore';
import { setBreadcrumbs, successNotificationToast } from '../../../utils/helpers';
import { NotificationsStart } from 'opensearch-dashboards/public';
import { EuiPanel, EuiSpacer, EuiText } from '@elastic/eui';
import { PageHeader } from '../../../components/PageHeader/PageHeader';
import { getUseUpdatedUx } from '../../../services/utils/constants';

export interface CreateLogTypeProps extends RouteComponentProps {
  notifications: NotificationsStart;
}

export const CreateLogType: React.FC<CreateLogTypeProps> = ({ history, notifications }) => {
  const [logTypeDetails, setLogTypeDetails] = useState<LogTypeBase>({ ...defaultLogType });

  useEffect(() => {
    if (getUseUpdatedUx()) {
      setBreadcrumbs([BREADCRUMBS.LOG_TYPES, BREADCRUMBS.LOG_TYPE_CREATE]);
    } else {
      setBreadcrumbs([BREADCRUMBS.DETECTION, BREADCRUMBS.DETECTORS, BREADCRUMBS.LOG_TYPES, BREADCRUMBS.LOG_TYPE_CREATE]);
    }
  }, [getUseUpdatedUx()]);

  const description =
    'Create integration to categorize and identify detection rules for your data sources.'; // Replace Log Type is replaced with Integration by Wazuh

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
      <LogTypeForm
        logTypeDetails={{ ...logTypeDetails, id: '', detectionRulesCount: 0 }}
        isEditMode={true}
        confirmButtonText={'Create integration'} // Replace Log Type to Integration by Wazuh
        notifications={notifications}
        setLogTypeDetails={setLogTypeDetails}
        onCancel={() => history.push(ROUTES.LOG_TYPES)}
        onConfirm={async () => {
          const success = await DataStore.logTypes.createLogType(logTypeDetails);
          if (success) {
            successNotificationToast(notifications, 'created', `integration ${logTypeDetails.name}`); // Replace Log Type to Integration by Wazuh
            history.push(ROUTES.LOG_TYPES);
          }
        }}
      />
    </EuiPanel>
  );
};
