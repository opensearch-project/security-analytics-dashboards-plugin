/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiBadge,
  EuiBasicTable,
  EuiBasicTableColumn,
  EuiSmallButton,
  EuiSmallButtonIcon,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiLink,
  EuiSpacer,
  EuiText,
  EuiTitle,
} from '@elastic/eui';
import React, { useEffect, useState } from 'react';
import { ThreatIntelAlert, ThreatIntelFinding } from '../../../../../types';
import { DescriptionGroup } from '../../../../components/Utility/DescriptionGroup';
import { capitalize } from 'lodash';
import { renderTime } from '../../../../utils/helpers';
import { IocLabel } from '../../../../../common/constants';
import { DataStore } from '../../../../store/DataStore';
import { DEFAULT_EMPTY_DATA } from '../../../../utils/constants';
import { ContentPanel } from '../../../../components/ContentPanel';

export interface ThreatIntelAlertFlyoutProps {
  alertItem: ThreatIntelAlert;
  onClose: () => void;
  onAlertStateChange: (
    selectedItems: ThreatIntelAlert[],
    nextState: 'ACKNOWLEDGED' | 'COMPLETED'
  ) => Promise<boolean>;
}

export const ThreatIntelAlertFlyout: React.FC<ThreatIntelAlertFlyoutProps> = ({
  alertItem,
  onAlertStateChange,
  onClose,
}) => {
  const [alertState, setAlertState] = useState(alertItem.state);
  const [loading, setLoading] = useState(false);
  const showActionButton = alertState === 'ACTIVE' || alertState === 'ACKNOWLEDGED';
  const [findings, setFindings] = useState<ThreatIntelFinding[]>([]);

  useEffect(() => {
    setLoading(true);
    DataStore.threatIntel
      .getThreatIntelFindingsByIds(alertItem.finding_ids)
      .then((findings) => {
        setFindings(findings);
        setLoading(false);
      })
      .catch((_e) => setLoading(false));
  }, []);

  const createFindingTableColumns = (): EuiBasicTableColumn<ThreatIntelFinding>[] => {
    const backButton = (
      <EuiSmallButtonIcon
        iconType="arrowLeft"
        aria-label="back"
        onClick={() => DataStore.findings.closeFlyout()}
        display="base"
        size="s"
        data-test-subj={'finding-details-flyout-back-button'}
      />
    );

    return [
      {
        field: 'timestamp',
        name: 'Time',
        sortable: true,
        dataType: 'date',
        render: renderTime,
      },
      {
        field: 'id',
        name: 'Finding ID',
        sortable: true,
        dataType: 'string',
        render: (id: string, finding: ThreatIntelFinding) =>
          (
            <EuiLink
              onClick={() => {
                DataStore.findings.openThreatIntelFindingFlyout(finding, backButton);
              }}
              data-test-subj={'finding-details-flyout-button'}
            >
              {id.length > 7 ? `${id.slice(0, 7)}...` : id}
            </EuiLink>
          ) || DEFAULT_EMPTY_DATA,
      },
      {
        field: 'ioc_feed_ids',
        name: 'Threat intel sources',
        render: (ioc_feed_ids: ThreatIntelFinding['ioc_feed_ids']) => {
          return (
            <EuiText>
              <span>
                {ioc_feed_ids
                  .slice(0, 2)
                  .map(({ feed_name }) => feed_name)
                  .join(', ')}
              </span>
              {ioc_feed_ids.length > 2 ? (
                <EuiBadge>+{ioc_feed_ids.slice(2).length} more</EuiBadge>
              ) : null}
            </EuiText>
          );
        },
      },
    ];
  };

  return (
    <EuiFlyout onClose={onClose} ownFocus hideCloseButton>
      <EuiFlyoutHeader hasBorder={true}>
        <EuiFlexGroup justifyContent="spaceBetween">
          <EuiFlexItem grow={2}>
            <EuiTitle size={'m'}>
              <h3>Alert details</h3>
            </EuiTitle>
          </EuiFlexItem>
          <EuiFlexItem grow={8}>
            <EuiFlexGroup justifyContent="flexEnd" alignItems="center">
              {showActionButton && (
                <EuiFlexItem grow={false}>
                  <EuiSmallButton
                    onClick={() => {
                      const nextState = alertState === 'ACTIVE' ? 'ACKNOWLEDGED' : 'COMPLETED';
                      onAlertStateChange([alertItem], nextState).then((success) => {
                        if (success) {
                          setAlertState(nextState);
                        }
                      });
                    }}
                    data-test-subj={'alert-details-flyout-acknowledge-button'}
                  >
                    {alertState === 'ACTIVE' ? 'Acknowledge' : 'Complete'}
                  </EuiSmallButton>
                </EuiFlexItem>
              )}
              <EuiFlexItem grow={false}>
                <EuiSmallButtonIcon
                  aria-label="close"
                  iconType="cross"
                  iconSize="m"
                  display="empty"
                  onClick={onClose}
                  data-test-subj={'alert-details-flyout-close-button'}
                />
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlyoutHeader>
      <EuiFlyoutBody>
        <DescriptionGroup
          listItems={[
            { title: 'Alert trigger name', description: alertItem.trigger_name },
            { title: 'Alert status', description: alertState },
            { title: 'Alert severity', description: capitalize(alertItem.severity) },
          ]}
        />
        <EuiSpacer size="m" />
        <DescriptionGroup
          listItems={[
            { title: 'Start time', description: renderTime(alertItem.start_time) },
            { title: 'Last updated time', description: renderTime(alertItem.last_updated_time) },
            { title: 'Indicator type', description: IocLabel[alertItem.ioc_type] },
          ]}
        />
        <EuiSpacer />
        <ContentPanel title={`Findings (${findings.length})`}>
          <EuiBasicTable<ThreatIntelFinding>
            columns={createFindingTableColumns()}
            items={findings}
            loading={loading}
          />
        </ContentPanel>
      </EuiFlyoutBody>
    </EuiFlyout>
  );
};
