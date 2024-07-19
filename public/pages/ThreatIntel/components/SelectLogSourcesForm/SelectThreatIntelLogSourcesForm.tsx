/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiAccordion,
  EuiBadge,
  EuiButton,
  EuiButtonEmpty,
  EuiComboBox,
  EuiComboBoxOptionOption,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiIcon,
  EuiPanel,
  EuiPopover,
  EuiSpacer,
  EuiText,
  EuiTitle,
} from '@elastic/eui';
import { IocLabel, ThreatIntelIocType } from '../../../../../common/constants';
import React, { useCallback, useEffect, useState } from 'react';
import { LogSourceIocConfig, ThreatIntelLogSource } from '../../../../../types';
import { Interval } from '../../../CreateDetector/components/DefineDetector/components/DetectorSchedule/Interval';
import { getDataSources, getFieldsForIndex } from '../../../../utils/helpers';
import { useContext } from 'react';
import { SecurityAnalyticsContext } from '../../../../services';
import { NotificationsStart } from 'opensearch-dashboards/public';
import { IndexOption } from '../../../Detectors/models/interfaces';
import { PeriodSchedule } from '../../../../../models/interfaces';

export interface SelectThreatIntelLogSourcesProps {
  sources: ThreatIntelLogSource[];
  schedule: PeriodSchedule;
  notifications: NotificationsStart;
  updateSources: (sources: ThreatIntelLogSource[]) => void;
  updateSchedule: (schedule: PeriodSchedule) => void;
}

export const SelectThreatIntelLogSources: React.FC<SelectThreatIntelLogSourcesProps> = ({
  sources,
  notifications,
  schedule,
  updateSources,
  updateSchedule,
}) => {
  const saContext = useContext(SecurityAnalyticsContext);
  const [loadingLogSourceOptions, setLoadingLogSourceOptions] = useState(false);
  const [logSourceOptions, setLogSourceOptions] = useState<EuiComboBoxOptionOption<string>[]>([]);
  const [fieldsByIndexName, setFieldsByIndexName] = useState<
    Record<string, { label: string; value: string }[]>
  >({});
  const [iocInfoWithAddFieldOpen, setIocInfoWithAddFieldOpen] = useState<
    { sourceName: string; ioc: string; selectedFields: string[] } | undefined
  >(undefined);

  const getLogFields = useCallback(
    async (indexName: string) => {
      if (saContext && !fieldsByIndexName[indexName]) {
        getFieldsForIndex(saContext.services.fieldMappingService, indexName).then((fields) => {
          setFieldsByIndexName({
            ...fieldsByIndexName,
            [indexName]: fields,
          });
        });
      }
    },
    [saContext, fieldsByIndexName]
  );
  const [selectedSourcesMap, setSelectedSourcesMap] = useState(() => {
    const selectedSourcesByName: Map<string, ThreatIntelLogSource> = new Map();
    sources.forEach((source) => {
      selectedSourcesByName.set(source.name, source);
      getLogFields(source.name);
    });
    return selectedSourcesByName;
  });

  useEffect(() => {
    const getLogSourceOptions = async () => {
      if (saContext) {
        setLoadingLogSourceOptions(true);
        const res = await getDataSources(saContext.services.indexService, notifications);
        if (res.ok) {
          setLogSourceOptions(res.dataSources);
        }
        setLoadingLogSourceOptions(false);
      }
    };

    getLogSourceOptions();
  }, [saContext]);

  const onIocToggle = (
    source: ThreatIntelLogSource,
    toggledIoc: ThreatIntelIocType,
    enabled: boolean
  ) => {
    const newSelectedSourcesMap = new Map(selectedSourcesMap);
    newSelectedSourcesMap.get(source.name)!.iocConfigMap = {
      ...source.iocConfigMap,
      [toggledIoc]: {
        fieldAliases: [],
        ...source.iocConfigMap[toggledIoc],
        enabled,
      },
    };

    setSelectedSourcesMap(newSelectedSourcesMap);
    updateSources?.(Array.from(newSelectedSourcesMap.values()));
  };

  const onFieldAliasRemove = (
    source: ThreatIntelLogSource,
    ioc: ThreatIntelIocType,
    alias: string
  ) => {
    const aliasesSet = new Set(source.iocConfigMap[ioc]?.fieldAliases || []);
    aliasesSet.delete(alias);

    updateAliases(source, ioc, Array.from(aliasesSet));
  };

  const onFieldAliasesAdd = (source: ThreatIntelLogSource, ioc: ThreatIntelIocType) => {
    const newFieldAliasesSet = new Set([...(source.iocConfigMap[ioc]?.fieldAliases || [])]);
    iocInfoWithAddFieldOpen?.selectedFields.forEach((field) => newFieldAliasesSet.add(field));
    updateAliases(source, ioc, Array.from(newFieldAliasesSet));
    setIocInfoWithAddFieldOpen(undefined);
  };

  const onFieldAliasesSelect = (aliases: string[]) => {
    setIocInfoWithAddFieldOpen({
      ...iocInfoWithAddFieldOpen!,
      selectedFields: aliases,
    });
  };

  const updateAliases = (
    source: ThreatIntelLogSource,
    ioc: ThreatIntelIocType,
    fieldAliases: string[]
  ) => {
    const newSelectedSourcesMap = new Map(selectedSourcesMap);
    newSelectedSourcesMap.get(source.name)!.iocConfigMap = {
      ...source.iocConfigMap,
      [ioc]: {
        ...source.iocConfigMap[ioc],
        fieldAliases,
      },
    };

    setSelectedSourcesMap(newSelectedSourcesMap);
    onIocToggle(source, ioc, fieldAliases.length > 0);
    updateSources?.(Array.from(newSelectedSourcesMap.values()));
  };

  const onLogSourceSelectionChange = (options: EuiComboBoxOptionOption<string>[]) => {
    const newSelectedSourcesMap: Map<string, ThreatIntelLogSource> = new Map();

    options.forEach(({ label }) => {
      if (selectedSourcesMap.get(label)) {
        newSelectedSourcesMap.set(label, selectedSourcesMap.get(label)!);
      } else {
        newSelectedSourcesMap.set(label, {
          name: label,
          iocConfigMap: {},
        });
      }
      getLogFields(label);
    });

    setSelectedSourcesMap(newSelectedSourcesMap);
    updateSources?.(Array.from(newSelectedSourcesMap.values()));
  };

  return (
    <EuiPanel>
      <EuiTitle size="s">
        <h2>Configure logs scan</h2>
      </EuiTitle>
      <EuiSpacer />
      <EuiFormRow
        label="Select Indexes/Aliases"
        helpText="Using indexes and aliases is recommended for more precise field mapping"
      >
        <EuiComboBox
          options={logSourceOptions}
          placeholder={'Select an input source for the detector.'}
          isLoading={loadingLogSourceOptions}
          selectedOptions={sources.map(({ name }) => ({ label: name }))}
          onChange={onLogSourceSelectionChange}
          isClearable={true}
          data-test-subj={'define-detector-select-data-source'}
          renderOption={(option: IndexOption) => {
            return option.index ? `${option.label} (${option.index})` : option.label;
          }}
        />
      </EuiFormRow>
      <EuiSpacer size="xxl" />
      <EuiTitle size="s">
        <h4>Select fields to scan</h4>
      </EuiTitle>
      <EuiText color="subdued">
        <p>Add log fields that map to at least one IoC type to perform threat intel scan.</p>
      </EuiText>
      <EuiSpacer />

      {selectedSourcesMap.size === 0 ? (
        <EuiText>
          <p>
            Select <b>indexes/aliases</b> above to view the fields.
          </p>
        </EuiText>
      ) : (
        Array.from(selectedSourcesMap.values()).map((source, idx) => {
          const { name, iocConfigMap } = source;
          const fieldOptionsSet = new Set(
            (fieldsByIndexName[name] || []).map(({ label }) => label)
          );
          Object.values(ThreatIntelIocType).forEach((iocType) => {
            const selectedFields = iocConfigMap[iocType as ThreatIntelIocType]?.fieldAliases || [];
            selectedFields.forEach((f) => fieldOptionsSet.delete(f));
          });

          return (
            <>
              <EuiAccordion
                key={name}
                id={name}
                buttonContent={name}
                initialIsOpen={true}
                paddingSize="l"
              >
                <div style={{ marginTop: -20 }}>
                  {Object.values(ThreatIntelIocType).map((iocType) => {
                    const iocEnabled = iocConfigMap[iocType as ThreatIntelIocType]?.enabled;
                    const [ioc, config]: [ThreatIntelIocType, LogSourceIocConfig] = [
                      iocType as ThreatIntelIocType,
                      iocConfigMap[iocType as ThreatIntelIocType] ?? {
                        enabled: false,
                        fieldAliases: [],
                      },
                    ];

                    return (
                      <EuiFlexGroup key={ioc} alignItems="center" gutterSize="s">
                        <EuiFlexItem grow={1}>
                          <EuiFlexGroup gutterSize="s" alignItems="center" wrap={false}>
                            <EuiFlexItem grow={false}>
                              <EuiIcon
                                type={'checkInCircleEmpty'}
                                color="success"
                                style={{ visibility: iocEnabled ? 'visible' : 'hidden' }}
                              />
                            </EuiFlexItem>
                            <EuiFlexItem grow={false}>
                              <EuiText>{IocLabel[ioc]}</EuiText>
                            </EuiFlexItem>
                          </EuiFlexGroup>
                        </EuiFlexItem>
                        <EuiFlexItem grow={7}>
                          <EuiFlexGroup gutterSize="s" alignItems="center" wrap>
                            {config.fieldAliases.map((alias) => (
                              <EuiFlexItem grow={false} key={alias}>
                                <EuiBadge
                                  key={alias}
                                  color="hollow"
                                  iconType="cross"
                                  iconSide="right"
                                  iconOnClickAriaLabel="Remove field alias"
                                  iconOnClick={() => onFieldAliasRemove(source, ioc, alias)}
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
                                    onClick={() =>
                                      setIocInfoWithAddFieldOpen({
                                        ioc: ioc,
                                        sourceName: name,
                                        selectedFields:
                                          iocInfoWithAddFieldOpen?.selectedFields || [],
                                      })
                                    }
                                  >
                                    Add fields
                                  </EuiButtonEmpty>
                                }
                                panelPaddingSize="s"
                                closePopover={() => onFieldAliasesAdd(source, ioc)}
                                isOpen={
                                  iocInfoWithAddFieldOpen &&
                                  iocInfoWithAddFieldOpen.sourceName === name &&
                                  iocInfoWithAddFieldOpen.ioc === ioc
                                }
                              >
                                <EuiFlexGroup alignItems="flexEnd">
                                  <EuiFlexItem>
                                    <EuiComboBox
                                      style={{ minWidth: 300 }}
                                      options={Array.from(fieldOptionsSet).map((f) => ({
                                        label: f,
                                        value: f,
                                      }))}
                                      onChange={(options) =>
                                        onFieldAliasesSelect(options.map(({ label }) => label))
                                      }
                                      selectedOptions={iocInfoWithAddFieldOpen?.selectedFields.map(
                                        (field) => ({ label: field })
                                      )}
                                    />
                                  </EuiFlexItem>
                                  <EuiFlexItem grow={false}>
                                    <EuiButton onClick={() => onFieldAliasesAdd(source, ioc)}>
                                      Done
                                    </EuiButton>
                                  </EuiFlexItem>
                                </EuiFlexGroup>
                              </EuiPopover>
                            </EuiFlexItem>
                          </EuiFlexGroup>
                        </EuiFlexItem>
                      </EuiFlexGroup>
                    );
                  })}
                </div>
              </EuiAccordion>
              <EuiSpacer />
            </>
          );
        })
      )}

      <EuiSpacer />
      <EuiTitle size="s">
        <h4>Scan schedule</h4>
      </EuiTitle>
      <EuiText color="subdued">
        <p>Define the frequency of the log scan execution.</p>
      </EuiText>
      <EuiSpacer />
      <Interval label={'Run scan every'} schedule={schedule} onScheduleChange={updateSchedule} />
    </EuiPanel>
  );
};
