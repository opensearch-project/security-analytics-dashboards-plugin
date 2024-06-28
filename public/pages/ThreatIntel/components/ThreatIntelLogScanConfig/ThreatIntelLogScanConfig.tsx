/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiButtonEmpty,
  EuiDescriptionList,
  EuiEmptyPrompt,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiLink,
  EuiPanel,
  EuiSpacer,
  EuiText,
  EuiTitle,
} from '@elastic/eui';
import React from 'react';
import { ConfigActionButton } from '../Utility/ConfigActionButton';
import { ThreatIntelScanConfig } from '../../../../../types';
import { deriveFormModelFromConfig } from '../../utils/helpers';
import { IocLabel, ThreatIntelIocType } from '../../../../../common/constants';
import { Interval } from '../../../CreateDetector/components/DefineDetector/components/DetectorSchedule/Interval';
import { ThreatIntelLogSourcesFlyout } from '../ThreatIntelLogSourcesFlyout/ThreatIntelLogSourcesFlyout';
import { ThreatIntelAlertTriggersFlyout } from '../ThreatIntelAlertTriggersFlyout/ThreatIntelAlertTriggersFlyout';

export interface ThreatIntelLogScanConfigProps {
  scanConfig?: ThreatIntelScanConfig;
  threatIntelSourceCount: number;
  setFlyoutContent: (content: React.ReactNode) => void;
  addThreatIntelActionHandler: () => void;
  scanConfigActionHandler: () => void;
}

export const ThreatIntelLogScanConfig: React.FC<ThreatIntelLogScanConfigProps> = ({
  scanConfig,
  threatIntelSourceCount,
  addThreatIntelActionHandler,
  scanConfigActionHandler,
  setFlyoutContent,
}) => {
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

  return (
    <EuiPanel>
      <EuiFlexGroup alignItems="flexStart">
        <EuiFlexItem>
          <EuiTitle>
            <h4>Log sources</h4>
          </EuiTitle>
          <EuiSpacer size="xs" />
          <EuiText color="subdued">
            <span>
              To perform detection the IoC from threat intelligence feeds have to be matched against
              selected fields in your data.
            </span>
          </EuiText>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <ConfigActionButton
            action={logSources.length > 0 ? 'edit' : 'configure'}
            actionHandler={scanConfigActionHandler}
            disabled={threatIntelSourceCount === 0}
          />
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
                    title: `Log sources (${logSources.length})`,
                    description: `Select indexes, aliases and wildcard patterns that 
                  are being scanned for the matches with the known malicious activity indicators`,
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
                {logSources.length > 0 && (
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
                    title: 'Scan schedule',
                    description: 'Define the frequency of the log scan execution.',
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
                    title: `Alert triggers (${triggers.length})`,
                    description:
                      'Set up alert triggers to get notified on the matches with threat intel sources in your log sources.',
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
                {triggers.length > 0 && (
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
  );
};
