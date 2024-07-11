/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useContext } from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import { RouteComponentProps, useParams } from 'react-router-dom';
import { LogTypeItem } from '../../../../types';
import {
  EuiSmallButtonIcon,
  EuiDescriptionList,
  EuiFlexGroup,
  EuiFlexItem,
  EuiLoadingSpinner,
  EuiPanel,
  EuiSpacer,
  EuiTab,
  EuiTabs,
  EuiTitle,
  EuiToolTip,
} from '@elastic/eui';
import { DataStore } from '../../../store/DataStore';
import { CoreServicesContext } from '../../../components/core_services';
import { BREADCRUMBS, ROUTES } from '../../../utils/constants';
import { logTypeDetailsTabs } from '../utils/constants';
import { LogTypeDetails } from '../components/LogTypeDetails';
import { NotificationsStart } from 'opensearch-dashboards/public';
import { LogTypeDetectionRules } from '../components/LogTypeDetectionRules';
import { RuleTableItem } from '../../Rules/utils/helpers';
import { useCallback } from 'react';
import { DeleteLogTypeModal } from '../components/DeleteLogTypeModal';
import { errorNotificationToast, successNotificationToast } from '../../../utils/helpers';

export interface LogTypeProps extends RouteComponentProps {
  notifications: NotificationsStart;
}

export const LogType: React.FC<LogTypeProps> = ({ notifications, history }) => {
  const context = useContext(CoreServicesContext);
  const { logTypeId } = useParams<{ logTypeId: string }>();
  const [selectedTabId, setSelectedTabId] = useState('details');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
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
  const [rules, setRules] = useState<RuleTableItem[]>([]);
  const [loadingRules, setLoadingRules] = useState(true);

  const updateRules = useCallback(async (details: LogTypeItem, intialDetails: LogTypeItem) => {
    const rulesRes = await DataStore.rules.getAllRules({
      'rule.category': [details.name.toLowerCase()],
    });
    const ruleItems = rulesRes.map((rule) => ({
      title: rule._source.title,
      level: rule._source.level,
      category: rule._source.category,
      description: rule._source.description,
      source: rule.prePackaged ? 'Standard' : 'Custom',
      ruleInfo: rule,
      ruleId: rule._id,
    }));
    setRules(ruleItems);
    setLoadingRules(false);
    setLogTypeDetails({
      ...details,
      detectionRulesCount: ruleItems.length,
    });
    setInitialLogTypeDetails({
      ...intialDetails,
      detectionRulesCount: ruleItems.length,
    });
  }, []);

  useEffect(() => {
    const getLogTypeDetails = async () => {
      const details = await DataStore.logTypes.getLogType(logTypeId);

      if (!details) {
        setInfoText('Log type not found!');
        return;
      }

      context?.chrome.setBreadcrumbs([
        BREADCRUMBS.SECURITY_ANALYTICS,
        BREADCRUMBS.DETECTORS,
        BREADCRUMBS.LOG_TYPES,
        { text: details.name },
      ]);
      const logTypeItem = { ...details, detectionRulesCount: details.detectionRules.length };
      updateRules(logTypeItem, logTypeItem);
    };

    getLogTypeDetails();
  }, []);

  const refreshRules = useCallback(() => {
    updateRules(logTypeDetails!, initialLogTypeDetails!);
  }, [logTypeDetails]);

  const renderTabContent = () => {
    switch (selectedTabId) {
      case 'detection_rules':
        return (
          <LogTypeDetectionRules
            loadingRules={loadingRules}
            rules={rules}
            refreshRules={refreshRules}
          />
        );
      case 'details':
      default:
        return (
          <LogTypeDetails
            initialLogTypeDetails={initialLogTypeDetails!}
            logTypeDetails={logTypeDetails!}
            isEditMode={isEditMode}
            notifications={notifications}
            setIsEditMode={setIsEditMode}
            setLogTypeDetails={setLogTypeDetails}
          />
        );
    }
  };

  const deleteLogType = async () => {
    const deleteSucceeded = await DataStore.logTypes.deleteLogType(logTypeDetails!.id);
    if (deleteSucceeded) {
      successNotificationToast(notifications, 'deleted', 'log type');
      history.push(ROUTES.LOG_TYPES);
    } else {
      errorNotificationToast(notifications, 'delete', 'log type');
    }
  };

  return !logTypeDetails ? (
    <EuiTitle>
      <h2>{infoText}</h2>
    </EuiTitle>
  ) : (
    <>
      {showDeleteModal && (
        <DeleteLogTypeModal
          logTypeName={logTypeDetails.name}
          detectionRulesCount={logTypeDetails.detectionRulesCount}
          closeModal={() => setShowDeleteModal(false)}
          onConfirm={deleteLogType}
        />
      )}
      <EuiFlexGroup justifyContent="spaceBetween">
        <EuiFlexItem>
          <EuiTitle>
            <h1>{logTypeDetails.name}</h1>
          </EuiTitle>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiToolTip content="Delete" position="bottom">
            <EuiSmallButtonIcon
              iconType={'trash'}
              color="danger"
              onClick={() => setShowDeleteModal(true)}
            />
          </EuiToolTip>
        </EuiFlexItem>
      </EuiFlexGroup>

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
              listItems={[
                { title: 'Detection rules', description: logTypeDetails.detectionRulesCount },
              ]}
            />
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiDescriptionList
              listItems={[
                {
                  title: 'Source',
                  description:
                    logTypeDetails.source === 'Sigma' ? 'Standard' : logTypeDetails.source,
                },
              ]}
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
      <EuiSpacer size="m" />
      {renderTabContent()}
    </>
  );
};
