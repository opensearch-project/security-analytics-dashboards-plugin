/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiAccordion,
  EuiBadge,
  EuiButton,
  EuiButtonEmpty,
  EuiCheckbox,
  EuiComboBox,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiPanel,
  EuiPopover,
  EuiSpacer,
  EuiText,
  EuiTitle,
} from '@elastic/eui';
import { IocLabel, ThreatIntelIoc } from '../../../../../common/constants';
import React, { useState } from 'react';
import { ThreatIntelLogSource } from '../../../../../types';
import { Interval } from '../../../CreateDetector/components/DefineDetector/components/DetectorSchedule/Interval';

export interface SelectThreatIntelLogSourcesProps {
  sources: ThreatIntelLogSource[];
  updateSources?: (sources: ThreatIntelLogSource[]) => void;
}

export const SelectThreatIntelLogSources: React.FC<SelectThreatIntelLogSourcesProps> = ({
  sources,
  updateSources,
}) => {
  const [selectedSources, setSelectedSources] = useState([...sources]);
  const [iocWithAddFieldOpen, setIocWithAddFieldOpen] = useState<
    { sourceName: string; ioc: string } | undefined
  >(undefined);

  const onIocToggle = (
    source: ThreatIntelLogSource,
    sourceIdx: number,
    toggledIoc: ThreatIntelIoc,
    enabled: boolean
  ) => {
    const newSources: ThreatIntelLogSource[] = [
      ...selectedSources.slice(0, sourceIdx),
      {
        ...source,
        iocConfigMap: {
          ...source.iocConfigMap,
          [toggledIoc]: {
            ...source.iocConfigMap[toggledIoc],
            enabled: enabled,
          },
        },
      },
      ...selectedSources.slice(sourceIdx + 1),
    ];

    setSelectedSources(newSources);
    updateSources?.(newSources);
  };

  const onFieldAliasUpdate = (
    action: 'add' | 'remove',
    source: ThreatIntelLogSource,
    sourceIdx: number,
    ioc: ThreatIntelIoc,
    alias: string
  ) => {
    const aliasesSet = new Set(source.iocConfigMap[ioc].fieldAliases);
    if (action === 'add') {
      aliasesSet.add(alias);
    } else {
      aliasesSet.delete(alias);
    }

    const newSources: ThreatIntelLogSource[] = [
      ...selectedSources.slice(0, sourceIdx),
      {
        ...source,
        iocConfigMap: {
          ...source.iocConfigMap,
          [ioc]: {
            ...source.iocConfigMap[ioc],
            fieldAliases: Array.from(aliasesSet),
          },
        },
      },
      ...selectedSources.slice(sourceIdx + 1),
    ];

    setSelectedSources(newSources);
    updateSources?.(newSources);
  };

  return (
    <EuiPanel style={{ minHeight: 700 }}>
      <EuiTitle size="s">
        <h2>Select log sources</h2>
      </EuiTitle>
      <EuiSpacer />
      <EuiFormRow
        label="Select Indexes/Aliases"
        helpText="Using index patterns and aliases is recommended for more precise field mapping"
      >
        <EuiComboBox />
      </EuiFormRow>
      <EuiSpacer />
      <Interval
        label={'Run scan every'}
        detector={{ schedule: { period: { interval: 1, unit: 'DAYS' } } }}
        onDetectorScheduleChange={(sch) => {}}
      />
      <EuiSpacer size="xxl" />
      <EuiTitle size="s">
        <h4>Select fields to scan</h4>
      </EuiTitle>
      <EuiText color="subdued">
        <p>
          To perform detection the IoC from threat intelligence feeds have to be matched against
          selected fields in your data.
        </p>
      </EuiText>
      <EuiSpacer />

      {selectedSources.length === 0 ? (
        <EuiText>
          <p>Select indexes/aliases above to view the fields.</p>
        </EuiText>
      ) : (
        selectedSources.map((source, idx) => {
          const { name, iocConfigMap } = source;
          return (
            <>
              <EuiAccordion
                key={name}
                id={name}
                buttonContent={name}
                initialIsOpen={Object.values(iocConfigMap).some((config) => !config.enabled)}
                paddingSize="l"
              >
                <div style={{ marginTop: -20 }}>
                  {Object.entries(iocConfigMap).map(([ioc, config]) => (
                    <EuiFlexGroup key={ioc} alignItems="center" gutterSize="s">
                      <EuiFlexItem grow={1}>
                        <EuiCheckbox
                          id={`${name}-${ioc}`}
                          label={IocLabel[ioc as ThreatIntelIoc]}
                          checked={config.enabled}
                          onChange={(event) =>
                            onIocToggle(source, idx, ioc as ThreatIntelIoc, event.target.checked)
                          }
                        />
                      </EuiFlexItem>
                      <EuiFlexItem grow={7}>
                        <EuiFlexGroup gutterSize="s" alignItems="center">
                          {config.fieldAliases.map((alias) => (
                            <EuiFlexItem grow={false} key={alias}>
                              <EuiBadge
                                key={alias}
                                color="hollow"
                                iconType="cross"
                                iconSide="right"
                                iconOnClickAriaLabel="Remove field alias"
                                iconOnClick={() =>
                                  onFieldAliasUpdate(
                                    'remove',
                                    source,
                                    idx,
                                    ioc as ThreatIntelIoc,
                                    alias
                                  )
                                }
                              >
                                {alias}
                              </EuiBadge>
                            </EuiFlexItem>
                          ))}
                          <EuiFlexItem grow={false}>
                            <EuiPopover
                              button={
                                <EuiButtonEmpty
                                  iconType={'plus'}
                                  onClick={() => setIocWithAddFieldOpen({ ioc, sourceName: name })}
                                >
                                  Add fields
                                </EuiButtonEmpty>
                              }
                              panelPaddingSize="s"
                              closePopover={() => setIocWithAddFieldOpen(undefined)}
                              isOpen={
                                iocWithAddFieldOpen &&
                                iocWithAddFieldOpen.sourceName === name &&
                                iocWithAddFieldOpen.ioc === ioc
                              }
                            >
                              <EuiComboBox style={{ minWidth: 300 }}></EuiComboBox>
                              <EuiSpacer />
                              <EuiFlexGroup gutterSize="s" justifyContent="flexEnd">
                                <EuiFlexItem grow={false}>
                                  <EuiButtonEmpty>Cancel</EuiButtonEmpty>
                                </EuiFlexItem>
                                <EuiFlexItem grow={false}>
                                  <EuiButton fill>Add fields</EuiButton>
                                </EuiFlexItem>
                              </EuiFlexGroup>
                            </EuiPopover>
                          </EuiFlexItem>
                        </EuiFlexGroup>
                      </EuiFlexItem>
                    </EuiFlexGroup>
                  ))}
                </div>
              </EuiAccordion>
              <EuiSpacer />
            </>
          );
        })
      )}
    </EuiPanel>
  );
};
