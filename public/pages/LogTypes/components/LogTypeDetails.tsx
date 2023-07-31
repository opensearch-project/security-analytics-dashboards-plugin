/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiButton, EuiDescriptionList } from '@elastic/eui';
import { ContentPanel } from '../../../components/ContentPanel';
import React from 'react';
import { LogTypeItem } from '../../../../types';
import { DataStore } from '../../../store/DataStore';
import { LogTypeForm } from './LogTypeForm';
import { NotificationsStart } from 'opensearch-dashboards/public';

export interface LogTypeDetailsProps {
  initialLogTypeDetails: LogTypeItem;
  logTypeDetails: LogTypeItem;
  isEditMode: boolean;
  notifications: NotificationsStart;
  setIsEditMode: (isEdit: boolean) => void;
  setLogTypeDetails: (logType: LogTypeItem) => void;
}

export const LogTypeDetails: React.FC<LogTypeDetailsProps> = ({
  initialLogTypeDetails,
  logTypeDetails,
  isEditMode,
  notifications,
  setIsEditMode,
  setLogTypeDetails,
}) => {
  const onUpdateLogType = async () => {
    const success = await DataStore.logTypes.updateLogType(logTypeDetails);
    if (success) {
      setIsEditMode(false);
    }
  };

  return (
    <ContentPanel
      title="Details"
      actions={
        !isEditMode &&
        logTypeDetails.source.toLocaleLowerCase() !== 'sigma' && [
          <EuiButton onClick={() => setIsEditMode(true)}>Edit</EuiButton>,
        ]
      }
    >
      <EuiDescriptionList
        type="column"
        listItems={[
          {
            title: 'Log type',
            description: (
              <LogTypeForm
                logTypeDetails={logTypeDetails}
                isEditMode={isEditMode}
                confirmButtonText={'Update'}
                notifications={notifications}
                setLogTypeDetails={setLogTypeDetails}
                onCancel={() => {
                  setLogTypeDetails(initialLogTypeDetails);
                  setIsEditMode(false);
                }}
                onConfirm={onUpdateLogType}
              />
            ),
          },
        ]}
      />
    </ContentPanel>
  );
};
