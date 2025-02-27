/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiAccordion,
  EuiBadge,
  EuiSmallButtonEmpty,
  EuiCompressedComboBox,
  EuiComboBoxOptionOption,
  EuiFlexGroup,
  EuiFlexItem,
  EuiCompressedFormRow,
  EuiIcon,
  EuiPanel,
  EuiPopover,
  EuiSpacer,
  EuiText,
  EuiTitle,
} from '@elastic/eui';
import React, { useCallback, useEffect, useState } from 'react';
import { LogSourceIocConfig, ThreatIntelLogSource } from '../../../../../types';
import { Interval } from '../../../CreateDetector/components/DefineDetector/components/DetectorSchedule/Interval';
import { getDataSources, getFieldsForIndex, renderIoCType } from '../../../../utils/helpers';
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
  const [iocTypes, setIocTypes] = useState<string[]>([]);

  const getLogFields = useCallback(
    async (indices: string[]) => {
      const newFieldsByIndexName = {
        ...fieldsByIndexName,
      };
      const getFieldsRequests: Promise<{ label: string; value: string }[]>[] = [];
      const indicesWithRequest: string[] = [];
      indices.forEach(async (indexName) => {
        if (saContext && !fieldsByIndexName[indexName]) {
          getFieldsRequests.push(
            getFieldsForIndex(saContext.services.fieldMappingService, indexName)
          );
          indicesWithRequest.push(indexName);
        }
      });

      const getFieldsResponses = await Promise.all(getFieldsRequests);
      indicesWithRequest.forEach((indexName, idx) => {
        newFieldsByIndexName[indexName] = getFieldsResponses[idx];
      });

      setFieldsByIndexName(newFieldsByIndexName);
    },
    [saContext, fieldsByIndexName]
  );
  const [selectedSourcesMap, setSelectedSourcesMap] = useState<Map<string, ThreatIntelLogSource>>(
    new Map()
  );

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

    const loadIocTypes = async () => {
      if (saContext) {
        const iocTypesRes: string[] = await saContext.services.opensearchService.getIocTypes();
        setIocTypes(iocTypesRes);
      }
    };

    getLogSourceOptions();
    loadIocTypes();
  }, [saContext]);

  useEffect(() => {
    const selectedSourcesByName: Map<string, ThreatIntelLogSource> = new Map();
    sources.forEach((source) => {
      selectedSourcesByName.set(source.name, source);
    });
    getLogFields(sources.map(({ name }) => name));
    setSelectedSourcesMap(selectedSourcesByName);
  }, [sources]);

  const onIocToggle = (source: ThreatIntelLogSource, toggledIoc: string, enabled: boolean) => {
    const newSelectedSourcesMap = new Map(selectedSourcesMap);
    newSelectedSourcesMap.get(source.name)!.iocConfigMap = {
      ...source.iocConfigMap,
      [toggledIoc]: {
        ...source.iocConfigMap[toggledIoc],
        enabled,
      },
    };

    setSelectedSourcesMap(newSelectedSourcesMap);
    updateSources?.(Array.from(newSelectedSourcesMap.values()));
  };

  const onFieldAliasRemove = (source: ThreatIntelLogSource, ioc: string, alias: string) => {
    const aliasesSet = new Set(source.iocConfigMap[ioc]?.fieldAliases || []);
    aliasesSet.delete(alias);

    updateAliases(source, ioc, Array.from(aliasesSet));
  };

  const onFieldAliasesAdd = (source: ThreatIntelLogSource, ioc: string) => {
    const newFieldAliasesSet = new Set([...(source.iocConfigMap[ioc]?.fieldAliases || [])]);
    if (iocInfoWithAddFieldOpen && iocInfoWithAddFieldOpen.selectedFields.length > 0) {
      iocInfoWithAddFieldOpen.selectedFields.forEach((field) => newFieldAliasesSet.add(field));
      updateAliases(source, ioc, Array.from(newFieldAliasesSet));
    }

    setIocInfoWithAddFieldOpen(undefined);
  };

  const onFieldAliasesSelect = (aliases: string[]) => {
    setIocInfoWithAddFieldOpen({
      ...iocInfoWithAddFieldOpen!,
      selectedFields: aliases,
    });
  };

  const updateAliases = (source: ThreatIntelLogSource, ioc: string, fieldAliases: string[]) => {
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
    });

    getLogFields(options.map(({ label }) => label));

    setSelectedSourcesMap(newSelectedSourcesMap);
    updateSources?.(Array.from(newSelectedSourcesMap.values()));
  };

  return (
    <EuiPanel>
      <EuiTitle size="s">
        <h2>Configure logs scan</h2>
      </EuiTitle>
      <EuiSpacer />
      <EuiCompressedFormRow
        label="Select Indexes/Aliases"
        helpText={
          <span>
            <a href="https://opensearch.org/docs/latest/im-plugin/index-alias" target="_blank">
              Aliases
            </a>
            {' and '}
            <a href="https://opensearch.org/docs/latest/im-plugin/data-streams/" target="_blank">
              data streams
            </a>{' '}
            are recommended for optimal threat intel scans.
          </span>
        }
      >
        <EuiCompressedComboBox
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
      </EuiCompressedFormRow>
      <EuiSpacer size="xxl" />
      <EuiFlexGroup gutterSize="none" justifyContent="flexStart" alignItems="center">
        <EuiFlexItem grow={false}>
          <EuiTitle size="s">
            <h4>Select fields to scan</h4>
          </EuiTitle>
        </EuiFlexItem>
        {sources.length > 0 && (
          <EuiFlexItem>
            <EuiText size="s">
              <i>&nbsp; - Required</i>
            </EuiText>
          </EuiFlexItem>
        )}
      </EuiFlexGroup>
      <EuiText color="subdued">
        <p>Map at least one IoC type with a log field to perform threat intel scan.</p>
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
                  {iocTypes.map((iocType) => {
                    const iocEnabled = iocConfigMap[iocType]?.enabled;
                    const [ioc, config]: [string, LogSourceIocConfig] = [
                      iocType,
                      iocConfigMap[iocType] ?? {
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
                              <EuiText>{renderIoCType(ioc)}</EuiText>
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
                                  <EuiSmallButtonEmpty
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
                                  </EuiSmallButtonEmpty>
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
                                    <EuiCompressedComboBox
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
                                    <EuiSmallButtonEmpty
                                      onClick={() => onFieldAliasesAdd(source, ioc)}
                                    >
                                      Done
                                    </EuiSmallButtonEmpty>
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
