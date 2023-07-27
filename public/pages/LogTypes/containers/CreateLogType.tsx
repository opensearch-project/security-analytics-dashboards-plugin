/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiLink } from '@elastic/eui';
import { ContentPanel } from '../../../components/ContentPanel';
import React, { useContext, useState } from 'react';
import { LogTypeForm } from '../components/LogTypeForm';
import { LogTypeBase } from '../../../../types';
import { defaultLogType } from '../utils/constants';
import { RouteComponentProps } from 'react-router-dom';
import { BREADCRUMBS, ROUTES } from '../../../utils/constants';
import { CoreServicesContext } from '../../../components/core_services';
import { useEffect } from 'react';
import { DataStore } from '../../../store/DataStore';
import { successNotificationToast } from '../../../utils/helpers';
import { NotificationsStart } from 'opensearch-dashboards/public';

export interface CreateLogTypeProps extends RouteComponentProps {
  notifications: NotificationsStart;
}

export const CreateLogType: React.FC<CreateLogTypeProps> = ({ history, notifications }) => {
  const [logTypeDetails, setLogTypeDetails] = useState<LogTypeBase>({ ...defaultLogType });
  const context = useContext(CoreServicesContext);

  useEffect(() => {
    context?.chrome.setBreadcrumbs([
      BREADCRUMBS.SECURITY_ANALYTICS,
      BREADCRUMBS.DETECTORS,
      BREADCRUMBS.LOG_TYPES,
      BREADCRUMBS.LOG_TYPE_CREATE,
    ]);
  }, []);

  return (
    <ContentPanel
      title={'Create log type'}
      subTitleText={
        <p>
          Create log type to categorize and identify detection rules for your data sources. &nbsp;{' '}
          <EuiLink href={'www.bing.com'} target="_blank">
            Learn more
          </EuiLink>
        </p>
      }
      hideHeaderBorder={true}
    >
      <LogTypeForm
        logTypeDetails={{ ...logTypeDetails, id: '', detectionRules: 0 }}
        isEditMode={true}
        confirmButtonText={'Create rule category'}
        setLogTypeDetails={setLogTypeDetails}
        onCancel={() => history.push(ROUTES.LOG_TYPES)}
        onConfirm={async () => {
          const success = await DataStore.logTypes.createLogType(logTypeDetails);
          if (success) {
            successNotificationToast(notifications, 'created', `log type ${logTypeDetails.name}`);
            history.push(ROUTES.LOG_TYPES);
          }
        }}
      />
    </ContentPanel>
  );
};
