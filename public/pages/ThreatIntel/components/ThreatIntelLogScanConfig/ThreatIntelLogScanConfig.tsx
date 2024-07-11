/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiSmallButton,
  EuiButtonEmpty,
  EuiContextMenuItem,
  EuiContextMenuPanel,
  EuiDescriptionList,
  EuiEmptyPrompt,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiIcon,
  EuiLink,
  EuiPanel,
  EuiPopover,
  EuiSpacer,
  EuiText,
  EuiTitle,
  EuiToolTip,
} from '@elastic/eui';
import React, { useState } from 'react';
import { ThreatIntelScanConfig } from '../../../../../types';
import { deriveFormModelFromConfig } from '../../utils/helpers';
import { IocLabel, ThreatIntelIocType } from '../../../../../common/constants';
import { Interval } from '../../../CreateDetector/components/DefineDetector/components/DetectorSchedule/Interval';
import { ThreatIntelLogSourcesFlyout } from '../ThreatIntelLogSourcesFlyout/ThreatIntelLogSourcesFlyout';
import { ThreatIntelAlertTriggersFlyout } from '../ThreatIntelAlertTriggersFlyout/ThreatIntelAlertTriggersFlyout';
import DeleteModal from '../../../../components/DeleteModal';
import { ThreatIntelService } from '../../../../services';

export interface ThreatIntelLogScanConfigProps {
  scanConfig?: ThreatIntelScanConfig;
  threatIntelSourceCount: number;
  threatIntelService: ThreatIntelService;
  refreshScanConfig: () => void;
  setFlyoutContent: (content: React.ReactNode) => void;
  addThreatIntelActionHandler: () => void;
  scanConfigActionHandler: () => void;
  toggleScan: () => void;
}

export const ThreatIntelLogScanConfig: React.FC<ThreatIntelLogScanConfigProps> = ({
  scanConfig,
  threatIntelSourceCount,
  threatIntelService,
  refreshScanConfig,
  addThreatIntelActionHandler,
  scanConfigActionHandler,
  setFlyoutContent,
  toggleScan,
}) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  if (threatIntelSourceCount === 0) {
    return (
      <EuiPanel>
        <EuiEmptyPrompt
          title={
            <p>
              Configure log scan after{' '}
              <EuiLink onClick={addThreatIntelActionHandler}>adding a threat intel source</EuiLink>.
            </p>
          }
          titleSize="xs"
        />
      </EuiPanel>
    );
  }

  if (!scanConfig) {
    return (
      <EuiPanel>
        <EuiEmptyPrompt
          title={
            <p>
              <EuiLink onClick={scanConfigActionHandler}>Configure scan</EuiLink> to monitor threats
              using the threat intel sources.
            </p>
          }
          titleSize="xs"
        />
      </EuiPanel>
    );
  }

  const { logSources, schedule, triggers } = deriveFormModelFromConfig(scanConfig);
  const getActionItems = () => {
    return [
      <EuiContextMenuItem
        disabled={logSources.length === 0}
        onClick={() => {
          setIsPopoverOpen(false);
          toggleScan();
        }}
      >
        {scanConfig.enabled ? 'Stop scan' : 'Start scan'}
      </EuiContextMenuItem>,
      <EuiContextMenuItem disabled={threatIntelSourceCount === 0} onClick={scanConfigActionHandler}>
        {logSources.length > 0 ? 'Edit scan configuration' : 'Configure scan'}
      </EuiContextMenuItem>,
      <EuiContextMenuItem
        disabled={logSources.length === 0}
        onClick={() => setShowDeleteModal(true)}
      >
        Delete scan configuration
      </EuiContextMenuItem>,
    ];
  };

  const toggleActionMenu = () => {
    setIsPopoverOpen(!isPopoverOpen);
  };

  const closeActionMenu = () => {
    setIsPopoverOpen(false);
  };

  const onDeleteConfirmed = async () => {
    const res = await threatIntelService.deleteThreatIntelMonitor(scanConfig.id);
    if (res.ok) {
      refreshScanConfig();
    }
  };

  return (
    <>
      <EuiPanel>
        <EuiFlexGroup alignItems="flexStart" wrap>
          <EuiFlexItem>
            <EuiTitle>
              <h4>Log sources</h4>
            </EuiTitle>
            <EuiText color="subdued">
              <span>
                To perform detection the IoC from threat intelligence feeds have to be matched
                against selected fields in your data.
              </span>
            </EuiText>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiPopover
              id={'detectorsActionsPopover'}
              button={
                <EuiSmallButton
                  iconType={isPopoverOpen ? 'arrowUp' : 'arrowDown'}
                  iconSide={'right'}
                  onClick={toggleActionMenu}
                  data-test-subj={'log-scan-config-action-button'}
                >
                  Actions
                </EuiSmallButton>
              }
              isOpen={isPopoverOpen}
              closePopover={closeActionMenu}
              panelPaddingSize={'none'}
              anchorPosition={'downLeft'}
              data-test-subj={'detectorsActionsPopover'}
            >
              <EuiContextMenuPanel items={getActionItems()} />
            </EuiPopover>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer />
        {logSources.length > 0 && (
          <>
            <EuiFlexGroup>
              <EuiFlexItem grow={1}>
                <EuiDescriptionList
                  listItems={[
                    {
                      title: (
                        <>
                          {`Log sources (${logSources.length})`}&nbsp;
                          <EuiToolTip
                            content={`Select indexes and aliases that are being scanned for the matches with the known malicious activity indicators`}
                          >
                            <EuiIcon type={'iInCircle'} color="success" />
                          </EuiToolTip>
                        </>
                      ),
                      description: ``,
                    },
                  ]}
                />
              </EuiFlexItem>
              <EuiFlexItem grow={2} style={{ marginLeft: 100 }}>
                <EuiFlexGroup direction="column" alignItems="flexStart" gutterSize="xs">
                  {logSources.slice(0, 3).map((source) => {
                    return (
                      <EuiFlexItem grow={false}>
                        <EuiDescriptionList
                          key={source.name}
                          listItems={[
                            {
                              title: source.name,
                              description: Object.keys(source.iocConfigMap)
                                .map((iocType) => IocLabel[iocType as ThreatIntelIocType])
                                .join(', '),
                            },
                          ]}
                        />
                      </EuiFlexItem>
                    );
                  })}
                  {logSources.length > 3 && (
                    <EuiFlexItem grow={false}>
                      <EuiButtonEmpty
                        onClick={() => {
                          setFlyoutContent(
                            <ThreatIntelLogSourcesFlyout
                              logSources={logSources}
                              scanConfigActionHandler={scanConfigActionHandler}
                              threatIntelSourceCount={threatIntelSourceCount}
                            />
                          );
                        }}
                      >
                        View {logSources.length} log sources
                      </EuiButtonEmpty>
                    </EuiFlexItem>
                  )}
                </EuiFlexGroup>
              </EuiFlexItem>
            </EuiFlexGroup>
            <EuiSpacer size="xxl" />
            <EuiFlexGroup>
              <EuiFlexItem grow={1}>
                <EuiDescriptionList
                  listItems={[
                    {
                      title: (
                        <>
                          {`Scan schedule`}&nbsp;
                          <EuiToolTip content={`Define the frequency of the log scan execution.`}>
                            <EuiIcon type={'iInCircle'} color="success" />
                          </EuiToolTip>
                        </>
                      ),
                      description: '',
                    },
                  ]}
                />
              </EuiFlexItem>
              <EuiFlexItem grow={2} style={{ marginLeft: 100 }}>
                <EuiFormRow label="Scan runs every">
                  <Interval schedule={schedule} readonly onScheduleChange={() => {}} />
                </EuiFormRow>
              </EuiFlexItem>
            </EuiFlexGroup>
            <EuiSpacer size="xxl" />
            <EuiFlexGroup>
              <EuiFlexItem grow={1}>
                <EuiDescriptionList
                  listItems={[
                    {
                      title: (
                        <>
                          {`Alert triggers (${triggers.length})`}&nbsp;
                          <EuiToolTip
                            content={`Set up alert triggers to get notified on the matches with threat intel sources in your log sources.`}
                          >
                            <EuiIcon type={'iInCircle'} color="success" />
                          </EuiToolTip>
                        </>
                      ),
                      description: '',
                    },
                  ]}
                />
              </EuiFlexItem>
              <EuiFlexItem grow={2} style={{ marginLeft: 100 }}>
                <EuiFlexGroup gutterSize="s" direction="column" alignItems="flexStart">
                  {triggers.slice(0, 3).map(({ name, data_sources, ioc_types }) => {
                    const logSourcesCount =
                      data_sources.length === 0 ? 'Any' : data_sources.length.toString();
                    const iocTriggerCondition =
                      ioc_types.length === 0
                        ? 'All types of indicators'
                        : ioc_types
                            .map((iocType) => IocLabel[iocType as ThreatIntelIocType])
                            .join(', ');

                    return (
                      <EuiFlexItem key={name}>
                        <EuiDescriptionList
                          listItems={[
                            {
                              title: name,
                              description: `${logSourcesCount} log sources, ${iocTriggerCondition}`,
                            },
                          ]}
                        />
                      </EuiFlexItem>
                    );
                  })}
                  {triggers.length > 3 && (
                    <EuiFlexItem grow={false}>
                      <EuiButtonEmpty
                        size="s"
                        onClick={() => {
                          setFlyoutContent(
                            <ThreatIntelAlertTriggersFlyout
                              triggers={triggers}
                              threatIntelSourceCount={threatIntelSourceCount}
                              scanConfigActionHandler={scanConfigActionHandler}
                            />
                          );
                        }}
                      >
                        View {triggers.length} triggers
                      </EuiButtonEmpty>
                    </EuiFlexItem>
                  )}
                </EuiFlexGroup>
              </EuiFlexItem>
            </EuiFlexGroup>
          </>
        )}
      </EuiPanel>
      {showDeleteModal && (
        <DeleteModal
          type="threat intel scan configuration"
          closeDeleteModal={() => {
            setShowDeleteModal(false);
          }}
          ids={'scan configuration'}
          onClickDelete={onDeleteConfirmed}
          confirmation
        />
      )}
    </>
  );
};
