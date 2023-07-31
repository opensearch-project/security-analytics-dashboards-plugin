/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useContext } from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { LogTypeItem } from '../../../../types';
import {
  EuiDescriptionList,
  EuiFlexGroup,
  EuiFlexItem,
  EuiLoadingSpinner,
  EuiPanel,
  EuiSpacer,
  EuiTab,
  EuiTabs,
  EuiTitle,
} from '@elastic/eui';
import { DataStore } from '../../../store/DataStore';
import { CoreServicesContext } from '../../../components/core_services';
import { BREADCRUMBS } from '../../../utils/constants';
import { logTypeDetailsTabs } from '../utils/constants';
import { LogTypeDetailsTab } from '../components/LogTypeDetailsTab';

export interface LogTypeDetailsProps {}

export const LogTypeDetails: React.FC<LogTypeDetailsProps> = () => {
  const context = useContext(CoreServicesContext);
  const { logTypeId } = useParams<{ logTypeId: string }>();
  const [selectedTabId, setSelectedTabId] = useState('details');
  const [infoText, setInfoText] = useState<React.ReactNode | string>(
    <>
      Loading details &nbsp;
      <EuiLoadingSpinner size="l" />
    </>
  );
  const [logTypeDetails, setLogTypeDetails] = useState<LogTypeItem | undefined>(undefined);
  const [initialLogTypeDetails, setInitialLogTypeDetails] = useState<LogTypeItem | undefined>(
    undefined
  );

  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    const getLogTypeDetails = async () => {
      const details = await DataStore.logTypes.getLogType(logTypeId);

      if (!details) {
        setInfoText('Log type not found!');
        return;
      }

      setInitialLogTypeDetails(details);
      setLogTypeDetails(details);
    };

    context?.chrome.setBreadcrumbs([
      BREADCRUMBS.SECURITY_ANALYTICS,
      BREADCRUMBS.DETECTORS,
      BREADCRUMBS.LOG_TYPES,
      { text: logTypeId },
    ]);
    getLogTypeDetails();
  }, []);

  const renderTabContent = () => {
    switch (selectedTabId) {
      case 'detection_rules':
        return null;
      case 'details':
      default:
        return (
          <LogTypeDetailsTab
            initialLogTypeDetails={initialLogTypeDetails!}
            logTypeDetails={logTypeDetails!}
            isEditMode={isEditMode}
            setIsEditMode={setIsEditMode}
            setLogTypeDetails={setLogTypeDetails}
          />
        );
    }
  };

  return !logTypeDetails ? (
    <EuiTitle>
      <h2>{infoText}</h2>
    </EuiTitle>
  ) : (
    <>
      <EuiTitle>
        <h1>{logTypeDetails.name}</h1>
      </EuiTitle>
      <EuiSpacer />
      <EuiPanel grow={false}>
        <EuiDescriptionList
          listItems={[{ title: 'Description', description: logTypeDetails.description }]}
        />
        <EuiSpacer />
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiDescriptionList listItems={[{ title: 'ID', description: logTypeDetails.id }]} />
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiDescriptionList
              listItems={[{ title: 'Detection rules', description: logTypeDetails.detectionRules }]}
            />
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiDescriptionList
              listItems={[{ title: 'Source', description: logTypeDetails.source }]}
            />
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiPanel>
      <EuiSpacer />
      <EuiTabs>
        {logTypeDetailsTabs.map((tab, index) => {
          return (
            <EuiTab
              onClick={() => {
                setSelectedTabId(tab.id);
              }}
              key={index}
              isSelected={selectedTabId === tab.id}
            >
              {tab.name}
            </EuiTab>
          );
        })}
      </EuiTabs>
      {renderTabContent()}
    </>
  );
};
