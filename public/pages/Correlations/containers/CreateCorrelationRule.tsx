/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Form, Formik, FormikErrors, FormikTouched } from 'formik';
import { ContentPanel } from '../../../components/ContentPanel';
import { DataStore } from '../../../store/DataStore';
import { correlationRuleStateDefaultValue } from './CorrelationRuleFormModel';
import { NotificationsStart } from 'opensearch-dashboards/public';

import {
  EuiSmallButton,
  EuiFlexGroup,
  EuiFlexItem,
  EuiCompressedFormRow,
  EuiText,
  EuiComboBox,
  EuiCompressedFieldText,
  EuiSpacer,
  EuiTitle,
  EuiPanel,
  EuiAccordion,
  EuiSmallButtonIcon,
  EuiToolTip,
  EuiButtonGroup,
  EuiCompressedSelect,
  EuiSelectOption,
  EuiCompressedFieldNumber,
  EuiCheckableCard,
  htmlIdGenerator,
  EuiComboBoxOptionOption,
  EuiCompressedSwitch,
  EuiCompressedTextArea,
} from '@elastic/eui';
import { ruleTypes } from '../../Rules/utils/constants';
import {
  CorrelationRule,
  CorrelationRuleAction,
  CorrelationRuleModel,
  CorrelationRuleQuery,
  DataSourceProps,
  NotificationChannelOption,
  NotificationChannelTypeOptions,
} from '../../../../types';
import {
  BREADCRUMBS,
  NOTIFICATIONS_HREF,
  OS_NOTIFICATION_PLUGIN,
  ROUTES,
} from '../../../utils/constants';
import { CoreServicesContext } from '../../../components/core_services';
import { RouteComponentProps, useParams } from 'react-router-dom';
import { validateName } from '../../../utils/validation';
import {
  FieldMappingService,
  IndexService,
  OpenSearchService,
  NotificationsService,
} from '../../../services';
import {
  errorNotificationToast,
  getDataSources,
  getFieldsForIndex,
  getLogTypeOptions,
  getPlugins,
} from '../../../utils/helpers';
import { severityOptions } from '../../../pages/Alerts/utils/constants';
import {
  getEmptyAlertCondition,
  getNotificationChannels,
  parseAlertSeverityToOption,
  parseNotificationChannelsToOptions,
} from '../../CreateDetector/components/ConfigureAlerts/utils/helpers';
import { NotificationsCallOut } from '../../../../public/components/NotificationsCallOut';
import { ExperimentalBanner } from '../components/ExperimentalBanner';
import { ALERT_SEVERITY_OPTIONS } from '../../CreateDetector/components/ConfigureAlerts/utils/constants';
import uuid from 'uuid';

export interface CreateCorrelationRuleProps extends DataSourceProps {
  indexService: IndexService;
  fieldMappingService: FieldMappingService;
  history: RouteComponentProps<
    any,
    any,
    { rule: CorrelationRuleModel; isReadOnly: boolean }
  >['history'];
  notifications: NotificationsStart | null;
  notificationsService: NotificationsService;
  opensearchService: OpenSearchService;
}

export interface CorrelationOption {
  label: string;
  value?: string;
  index?: string;
  options?: CorrelationOption[];
}

const parseTime = (time: number) => {
  const minutes = Math.floor(time / 60000);
  const hours = Math.floor(minutes / 60);

  if (hours > 0 && minutes % 60 === 0) {
    return {
      interval: hours,
      unit: 'HOURS',
    };
  } else {
    return {
      interval: minutes,
      unit: 'MINUTES',
    };
  }
};

const unitOptions: EuiSelectOption[] = [
  { value: 'MINUTES', text: 'Minutes' },
  { value: 'HOURS', text: 'Hours' },
];

const ruleSeverityComboBoxOptions = severityOptions.map((option) => ({
  label: option.text,
  value: option.value,
}));

export const CreateCorrelationRule: React.FC<CreateCorrelationRuleProps> = (
  props: CreateCorrelationRuleProps
) => {
  const correlationStore = DataStore.correlations;
  const [indices, setIndices] = useState<CorrelationOption[]>([]);
  const [logFieldsByIndex, setLogFieldsByIndex] = useState<{
    [index: string]: CorrelationOption[];
  }>({});
  const params = useParams<{ ruleId: string }>();
  const [initialValues, setInitialValues] = useState({
    ...correlationRuleStateDefaultValue,
  });
  const [action, setAction] = useState<CorrelationRuleAction>('Create');
  const [hasNotificationPlugin, setHasNotificationPlugin] = useState<Boolean>(false);
  const [loadingNotifications, setLoadingNotifications] = useState<Boolean>(true);
  const [notificationChannels, setNotificationChannels] = useState<
    NotificationChannelTypeOptions[]
  >([]);
  const [logTypeOptions, setLogTypeOptions] = useState<any[]>([]);
  const [period, setPeriod] = useState({ interval: 1, unit: 'MINUTES' });
  const [dataFilterEnabled, setDataFilterEnabled] = useState(false);
  const [groupByEnabled, setGroupByEnabled] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showNotificationDetails, setShowNotificationDetails] = useState(false);
  const resetForm = useRef(false);
  const [selectedNotificationChannelOption, setSelectedNotificationChannelOption] = useState<
    NotificationChannelOption[]
  >([]);

  const validateCorrelationRule = useCallback(
    (rule: CorrelationRuleModel) => {
      if (!rule.name) {
        return 'Invalid rule name';
      }

      if (
        Number.isNaN(rule.time_window) ||
        rule.time_window > 86400000 ||
        rule.time_window < 60000
      ) {
        return 'Invalid time window.';
      }

      let error = '';
      const invalidQuery = rule.queries.some((query, index) => {
        const invalidIndex = !query.index;
        if (invalidIndex) {
          error = `Invalid index for query ${index + 1}.`;
          return true;
        }

        const invalidlogType = !query.logType;
        if (invalidlogType) {
          error = `Invalid log type for query ${index + 1}`;
          return true;
        }

        if (!dataFilterEnabled && !groupByEnabled) {
          error = 'Select at least one query type';
          return true;
        }

        const invalidDataFilter =
          dataFilterEnabled &&
          query.conditions.some((cond) => {
            const invalid = !cond.name || !cond.value;
            if (invalid) {
              error = `Invalid fields for query ${index + 1}`;
              return true;
            }

            return false;
          });

        if (invalidDataFilter) {
          return true;
        }

        if (groupByEnabled && rule.queries.some((q) => !q.field)) {
          error = 'Select valid field for group by';
          return true;
        }

        return false;
      });

      if (invalidQuery) {
        return error;
      }

      return undefined;
    },
    [dataFilterEnabled, groupByEnabled]
  );

  useEffect(() => {
    const setInitalNotificationValues = async () => {
      const plugins = await getPlugins(props.opensearchService);
      if (plugins) {
        setHasNotificationPlugin(plugins.includes(OS_NOTIFICATION_PLUGIN));
      }
    };
    const setNotificationChannelValues = async () => {
      const channels = await getNotificationChannels(props.notificationsService);
      const parsedChannels = parseNotificationChannelsToOptions(channels);
      setNotificationChannels(parsedChannels);
      setLoadingNotifications(false);
    };
    if (props.history.location.state?.rule) {
      setAction('Edit');
      setInitialValues(props.history.location.state?.rule);
    } else if (params.ruleId) {
      const setInitialRuleValues = async () => {
        const ruleRes = await correlationStore.getCorrelationRule(params.ruleId);
        if (ruleRes) {
          setInitialValues(ruleRes);
        }
      };

      setAction('Edit');
      setInitialRuleValues();
    }
    const setupLogTypeOptions = async () => {
      const options = await getLogTypeOptions();
      setLogTypeOptions(options);
    };
    setupLogTypeOptions();
    setInitalNotificationValues();
    setNotificationChannelValues();

    resetForm.current = true;
  }, [props.dataSource]);

  useEffect(() => {
    const alertCondition = initialValues.trigger;
    if (alertCondition && alertCondition.actions) {
      if (alertCondition.actions.length == 0)
        alertCondition.actions = getEmptyAlertCondition().actions;

      const channelId = alertCondition?.actions[0].destination_id;
      const selectedNotificationChannelOption: NotificationChannelOption[] = [];
      if (channelId) {
        notificationChannels.forEach((typeOption) => {
          const matchingChannel = typeOption.options.find((option) => option.value === channelId);
          if (matchingChannel) selectedNotificationChannelOption.push(matchingChannel);
        });
      }
      setSelectedNotificationChannelOption(selectedNotificationChannelOption);
    }
    setPeriod(parseTime(initialValues.time_window));
    setGroupByEnabled(initialValues.queries.some((q) => !!q.field));
    setDataFilterEnabled(initialValues.queries.some((q) => q.conditions.length > 0));

    initialValues.queries.forEach(({ index }) => {
      updateLogFieldsForIndex(index);
    });
  }, [initialValues, notificationChannels]);

  const onMessageSubjectChange = (subject: string) => {
    const newActions = initialValues?.trigger?.actions;
    if (newActions) {
      newActions[0].name = subject;
      newActions[0].subject_template.source = subject;
      setInitialValues((prevState) => ({
        ...prevState,
        trigger: {
          ...prevState.trigger!,
          newActions,
        },
      }));
    }
  };

  const onMessageBodyChange = (message: string) => {
    const newActions = [...(initialValues?.trigger?.actions ?? [])];
    newActions[0].message_template.source = message;
    setInitialValues((prevState) => ({
      ...prevState,
      trigger: {
        ...prevState.trigger!,
        newActions,
      },
    }));
  };

  const prepareMessage = (updateMessage: boolean = false, onMount: boolean = false) => {
    const alertCondition = initialValues?.trigger;
    if (alertCondition) {
      const lineBreak = '\n';
      const lineBreakAndTab = '\n\t';

      const alertConditionName = `Triggered alert condition: ${alertCondition.name}`;
      const alertConditionSeverity = `Severity: ${
        parseAlertSeverityToOption(alertCondition.severity)?.label || alertCondition.severity
      }`;
      const correlationRuleName = `Correlation Rule name: ${initialValues.name}`;
      const defaultSubject = [alertConditionName, alertConditionSeverity, correlationRuleName].join(
        ' - '
      );

      if (alertCondition.actions) {
        if (updateMessage || !alertCondition.actions[0]?.subject_template.source)
          onMessageSubjectChange(defaultSubject);

        if (updateMessage || !alertCondition.actions[0]?.message_template.source) {
          const selectedNames = alertCondition.ids;
          const corrRuleQueries = `Detector data sources:${lineBreakAndTab}${initialValues.queries.join(
            `,${lineBreakAndTab}`
          )}`;
          const ruleNames = `Rule Names:${lineBreakAndTab}${
            selectedNames?.join(`,${lineBreakAndTab}`) ?? ''
          }`;
          const ruleSeverities = `Rule Severities:${lineBreakAndTab}${alertCondition.sev_levels.join(
            `,${lineBreakAndTab}`
          )}`;

          const alertConditionSelections = [];
          if (selectedNames?.length) {
            alertConditionSelections.push(ruleNames);
            alertConditionSelections.push(lineBreak);
          }
          if (alertCondition.sev_levels.length) {
            alertConditionSelections.push(ruleSeverities);
            alertConditionSelections.push(lineBreak);
          }

          const alertConditionDetails = [
            alertConditionName,
            alertConditionSeverity,
            correlationRuleName,
            corrRuleQueries,
          ];
          let defaultMessageBody = alertConditionDetails.join(lineBreak);
          if (alertConditionSelections.length)
            defaultMessageBody =
              defaultMessageBody + lineBreak + lineBreak + alertConditionSelections.join(lineBreak);
          onMessageBodyChange(defaultMessageBody);
        }
      }
    }
  };

  const submit = async (values: CorrelationRuleModel) => {
    const randomTriggerId = uuid();
    const randomActionId = uuid();
    let error;
    if ((error = validateCorrelationRule(values))) {
      errorNotificationToast(props.notifications, action, 'rule', error);
      return;
    }

    if (!dataFilterEnabled) {
      values.queries.forEach((query) => {
        query.conditions = [];
      });
    }

    if (!groupByEnabled) {
      values.queries.forEach((query) => {
        query.field = '';
      });
    }

    // Modify or set default values for trigger if present
    if (values.trigger) {
      // Set default values for ids
      values.trigger.id = randomTriggerId;
      values.trigger.ids?.push(randomTriggerId);
      if (!values.trigger.severity) {
        values.trigger.severity = ALERT_SEVERITY_OPTIONS.HIGHEST.value;
      }
      // Set default values for actions if present
      if (values.trigger.actions) {
        values.trigger.actions.forEach((action) => {
          action.id = randomActionId;
          action.name = randomActionId;
        });
      }
    }

    if (action === 'Edit') {
      await correlationStore.updateCorrelationRule(values as CorrelationRule);
    } else {
      await correlationStore.createCorrelationRule(values as CorrelationRule);
    }

    props.history.push(ROUTES.CORRELATION_RULES);
  };

  const context = useContext(CoreServicesContext);
  const getIndices = useCallback(async () => {
    try {
      const dataSourcesRes = await getDataSources(props.indexService, props.notifications);
      if (dataSourcesRes.ok) {
        setIndices(dataSourcesRes.dataSources);
      }
    } catch (error: any) {}
  }, [props.indexService, props.notifications]);

  useEffect(() => {
    getIndices();
  }, [props.indexService, props.dataSource]);

  const getLogFields = useCallback(
    async (indexName: string) => {
      return getFieldsForIndex(props.fieldMappingService, indexName);
    },
    [props.indexService.getIndexFields]
  );

  const updateLogFieldsForIndex = (index: string) => {
    if (!index) {
      return;
    }
    getLogFields(index).then((fields) => {
      setLogFieldsByIndex((prevState) => ({
        ...prevState,
        [index]: fields,
      }));
    });
  };

  const createForm = (
    correlationQueries: CorrelationRuleQuery[],
    touchedInputs: FormikTouched<CorrelationRuleModel>,
    formikErrors: FormikErrors<CorrelationRuleModel>,
    props: any
  ) => {
    return (
      <>
        <EuiTitle size="s">
          <h5>Query type</h5>
        </EuiTitle>
        <EuiSpacer size="s" />
        <EuiFlexGroup>
          <EuiFlexItem style={{ maxWidth: 400 }}>
            <EuiCheckableCard
              className="eui-fullHeight"
              id={htmlIdGenerator('corr-rule-filter')()}
              label={
                <>
                  <EuiTitle size="s">
                    <h4>Data filter</h4>
                  </EuiTitle>
                  <EuiText size="s">
                    <p>
                      A correlation will be created for the matching findings narrowed down with
                      data filter.
                    </p>
                  </EuiText>
                </>
              }
              checkableType="checkbox"
              checked={dataFilterEnabled}
              onChange={() => {
                setDataFilterEnabled(!dataFilterEnabled);
              }}
            />
          </EuiFlexItem>
          <EuiFlexItem style={{ maxWidth: 400 }}>
            <EuiCheckableCard
              className="eui-fullHeight"
              id={htmlIdGenerator('corr-rule-group-by')()}
              label={
                <>
                  <EuiTitle size="s">
                    <h4>Group by field values</h4>
                  </EuiTitle>
                  <EuiText size="s">
                    <p>
                      A correlation will be created when the values for the field values for each
                      data source match between the findings.
                    </p>
                  </EuiText>
                </>
              }
              checkableType="checkbox"
              checked={groupByEnabled}
              onChange={() => {
                setGroupByEnabled(!groupByEnabled);
              }}
            />
          </EuiFlexItem>
        </EuiFlexGroup>
        {!dataFilterEnabled && !groupByEnabled && (
          <EuiText color="danger" size="s">
            <p>Select at least one query type</p>
          </EuiText>
        )}
        <EuiSpacer size="xl" />

        {correlationQueries.map((query, queryIdx) => {
          const fieldOptions = logFieldsByIndex[query.index] || [];
          const isInvalidInputForQuery = (field: 'logType' | 'index' | 'field'): boolean => {
            return (
              !!touchedInputs.queries?.[queryIdx]?.[field] &&
              !!(formikErrors.queries?.[queryIdx] as FormikErrors<CorrelationRuleQuery>)?.[field]
            );
          };

          return (
            <>
              <EuiPanel>
                <EuiAccordion
                  id={`query-${queryIdx}`}
                  buttonContent={
                    <EuiTitle size="s">
                      <p>Data source {queryIdx + 1}</p>
                    </EuiTitle>
                  }
                  extraAction={
                    correlationQueries.length > 2 ? (
                      <EuiToolTip title={'Delete query'}>
                        <EuiSmallButtonIcon
                          iconType={'trash'}
                          color="danger"
                          onClick={() => {
                            const newQueries = [...correlationQueries];
                            newQueries.splice(queryIdx, 1);
                            props.setFieldValue('queries', newQueries);
                          }}
                        />
                      </EuiToolTip>
                    ) : null
                  }
                  initialIsOpen={true}
                >
                  <EuiSpacer size="m" />
                  <EuiTitle size="xs">
                    <h3>Data source</h3>
                  </EuiTitle>
                  <EuiSpacer size="m" />
                  <EuiCompressedFormRow
                    label={<EuiText size={'s'}>Select index</EuiText>}
                    isInvalid={isInvalidInputForQuery('index')}
                    error={
                      (formikErrors.queries?.[queryIdx] as FormikErrors<CorrelationRuleQuery>)
                        ?.index
                    }
                  >
                    <EuiComboBox
                      isInvalid={isInvalidInputForQuery('index')}
                      placeholder="Select index or index pattern"
                      data-test-subj={'index_dropdown'}
                      options={indices}
                      singleSelection={{ asPlainText: true }}
                      onCreateOption={(val: string) => {
                        props.handleChange(`queries[${queryIdx}].index`)(val);
                      }}
                      onChange={(e) => {
                        props.handleChange(`queries[${queryIdx}].index`)(
                          e[0]?.value ? e[0].value : ''
                        );
                        updateLogFieldsForIndex(e[0]?.value || '');
                      }}
                      renderOption={(option: CorrelationOption) => {
                        return option.index ? `${option.label} (${option.index})` : option.label;
                      }}
                      onBlur={props.handleBlur(`queries[${queryIdx}].index`)}
                      selectedOptions={
                        query.index ? [{ value: query.index, label: query.index }] : []
                      }
                      isClearable={true}
                    />
                  </EuiCompressedFormRow>
                  <EuiSpacer size="m" />
                  <EuiCompressedFormRow
                    label={<EuiText size={'s'}>Log type</EuiText>}
                    isInvalid={isInvalidInputForQuery('logType')}
                    error={
                      (formikErrors.queries?.[queryIdx] as FormikErrors<CorrelationRuleQuery>)
                        ?.logType
                    }
                  >
                    <EuiComboBox
                      isInvalid={isInvalidInputForQuery('logType')}
                      placeholder="Select a log type"
                      data-test-subj={'rule_type_dropdown'}
                      options={logTypeOptions}
                      singleSelection={{ asPlainText: true }}
                      onChange={(e) => {
                        props.handleChange(`queries[${queryIdx}].logType`)(
                          e[0]?.value ? e[0].value : ''
                        );
                      }}
                      onBlur={props.handleBlur(`queries[${queryIdx}].logType`)}
                      selectedOptions={
                        query.logType
                          ? [
                              {
                                value: query.logType,
                                label:
                                  ruleTypes.find(
                                    (logType) =>
                                      logType.value.toLowerCase() === query.logType.toLowerCase()
                                  )?.label || query.logType,
                              },
                            ]
                          : []
                      }
                      isClearable={true}
                      onCreateOption={(e) => {
                        props.handleChange(`queries[${queryIdx}].logType`)(e);
                      }}
                    />
                  </EuiCompressedFormRow>
                  {!dataFilterEnabled && !groupByEnabled && (
                    <>
                      <EuiSpacer />
                      <EuiText color="danger" size="s">
                        <p>Select at least one query type</p>
                      </EuiText>
                    </>
                  )}
                  {dataFilterEnabled && (
                    <>
                      <EuiSpacer size="l" />
                      <EuiTitle size="xs">
                        <h3>Data filter</h3>
                      </EuiTitle>
                      <EuiSpacer size="xs" />
                      {query.conditions.map((condition, conditionIdx) => {
                        const fieldNameInput = (
                          <EuiComboBox
                            placeholder="Select a field"
                            data-test-subj={'field_dropdown'}
                            options={fieldOptions}
                            singleSelection={{ asPlainText: true }}
                            onChange={(e) => {
                              props.handleChange(
                                `queries[${queryIdx}].conditions[${conditionIdx}].name`
                              )(e[0]?.value ? e[0].value : '');
                            }}
                            onBlur={props.handleBlur(
                              `queries[${queryIdx}].conditions[${conditionIdx}].name`
                            )}
                            selectedOptions={
                              condition.name
                                ? [{ value: condition.name, label: condition.name }]
                                : []
                            }
                            onCreateOption={(e) => {
                              props.handleChange(
                                `queries[${queryIdx}].conditions[${conditionIdx}].name`
                              )(e);
                            }}
                            isClearable={true}
                          />
                        );

                        const fieldValueInput = (
                          <EuiCompressedFieldText
                            placeholder="Enter field value"
                            data-test-subj={'rule_name_field'}
                            onChange={(e) => {
                              props.handleChange(
                                `queries[${queryIdx}].conditions[${conditionIdx}].value`
                              )(e);
                            }}
                            onBlur={props.handleBlur(
                              `queries[${queryIdx}].conditions[${conditionIdx}].value`
                            )}
                            value={condition.value}
                          />
                        );

                        const conditionToggleButtons = [{ id: 'AND', label: 'AND' }];
                        const conditionButtonGroup = (
                          <EuiButtonGroup
                            legend=""
                            options={conditionToggleButtons}
                            idSelected={condition.condition}
                            onChange={(e) => {
                              props.handleChange(
                                `queries[${queryIdx}].conditions[${conditionIdx}].condition`
                              )(e);
                            }}
                            className={'correlation_rule_field_condition'}
                          />
                        );

                        const firstFieldRow = (
                          <EuiFlexGroup alignItems="center">
                            <EuiFlexItem grow={false} style={{ minWidth: 200 }}>
                              <EuiCompressedFormRow label={<EuiText size={'s'}>Field</EuiText>}>
                                {fieldNameInput}
                              </EuiCompressedFormRow>
                            </EuiFlexItem>
                            <EuiFlexItem grow={false} style={{ minWidth: 200 }}>
                              <EuiCompressedFormRow label={<EuiText size={'s'}>Field value</EuiText>}>
                                {fieldValueInput}
                              </EuiCompressedFormRow>
                            </EuiFlexItem>
                            <EuiFlexItem>
                              <EuiCompressedFormRow label={<p style={{ visibility: 'hidden' }}>_</p>}>
                                <EuiSmallButtonIcon
                                  iconType={'trash'}
                                  color="danger"
                                  onClick={() => {
                                    const newCases = [...query.conditions];
                                    newCases.splice(conditionIdx, 1);
                                    props.setFieldValue(
                                      `queries[${queryIdx}].conditions`,
                                      newCases
                                    );
                                  }}
                                />
                              </EuiCompressedFormRow>
                            </EuiFlexItem>
                          </EuiFlexGroup>
                        );

                        const fieldRowWithCondition = (
                          <EuiFlexGroup direction="column">
                            <EuiFlexItem grow={false} style={{ minWidth: 120 }}>
                              {conditionButtonGroup}
                            </EuiFlexItem>
                            <EuiFlexItem>{firstFieldRow}</EuiFlexItem>
                          </EuiFlexGroup>
                        );

                        return (
                          <>
                            <EuiSpacer size="m" />
                            {conditionIdx === 0 ? firstFieldRow : fieldRowWithCondition}
                            <EuiSpacer size="l" />
                          </>
                        );
                      })}
                      <EuiSmallButton
                        style={{ width: 125 }}
                        onClick={() => {
                          props.setFieldValue(`queries[${queryIdx}].conditions`, [
                            ...query.conditions,
                            ...correlationRuleStateDefaultValue.queries[0].conditions,
                          ]);
                        }}
                        iconType={'plusInCircle'}
                      >
                        Add field
                      </EuiSmallButton>
                    </>
                  )}

                  {groupByEnabled && (
                    <>
                      <EuiSpacer />
                      <EuiTitle size="xs">
                        <h3>Group by field</h3>
                      </EuiTitle>
                      <EuiSpacer size="s" />
                      <EuiCompressedFormRow
                        label={<EuiText size={'s'}>Field</EuiText>}
                        isInvalid={isInvalidInputForQuery('field')}
                        error={
                          (formikErrors.queries?.[queryIdx] as FormikErrors<CorrelationRuleQuery>)
                            ?.field
                        }
                      >
                        <EuiComboBox
                          placeholder="Select a field"
                          data-test-subj={'field_dropdown'}
                          options={fieldOptions}
                          singleSelection={{ asPlainText: true }}
                          onChange={(e) => {
                            props.handleChange(`queries[${queryIdx}].field`)(
                              e[0]?.value ? e[0].value : ''
                            );
                          }}
                          onBlur={props.handleBlur(`queries[${queryIdx}].field`)}
                          selectedOptions={
                            query.field ? [{ value: query.field, label: query.field }] : []
                          }
                          onCreateOption={(e) => {
                            props.handleChange(`queries[${queryIdx}].field`)(e);
                          }}
                          isClearable={true}
                        />
                      </EuiCompressedFormRow>
                    </>
                  )}
                </EuiAccordion>
              </EuiPanel>
              <EuiSpacer />
            </>
          );
        })}
        <EuiSpacer />
        <EuiSmallButton
          onClick={() => {
            props.setFieldValue('queries', [
              ...correlationQueries,
              { ...correlationRuleStateDefaultValue.queries[0] },
            ]);
          }}
          iconType={'plusInCircle'}
          fullWidth={true}
        >
          Add query
        </EuiSmallButton>
      </>
    );
  };

  useEffect(() => {
    context?.chrome.setBreadcrumbs([
      BREADCRUMBS.SECURITY_ANALYTICS,
      BREADCRUMBS.CORRELATIONS,
      BREADCRUMBS.CORRELATION_RULES,
      BREADCRUMBS.CORRELATIONS_RULE_CREATE,
    ]);
  }, []);

  return (
    <>
      <EuiTitle>
        <h1>{`${action} correlation rule`}</h1>
      </EuiTitle>
      <EuiText size="s" color="subdued">
        {action === 'Create' ? 'Create a' : 'Edit'} correlation rule to define threat scenarios of
        interest between different log sources.
      </EuiText>
      <EuiSpacer size="l" />
      <Formik
        initialValues={initialValues}
        validate={(values) => {
          const errors: FormikErrors<CorrelationRuleModel> = {};
          if (!values.name) {
            errors.name = 'Rule name is required';
          } else {
            if (!validateName(values.name)) {
              errors.name = 'Invalid rule name.';
            }
          }
          if (
            Number.isNaN(values.time_window) ||
            values.time_window > 86400000 ||
            values.time_window < 60000
          ) {
            errors.time_window = 'Invalid time window.';
          }

          if (groupByEnabled) {
            values.queries.forEach((query, idx) => {
              if (!query.field) {
                if (!errors.queries) {
                  errors.queries = Array(values.queries.length).fill(null);
                }

                (errors.queries as Array<{ field: string }>)[idx] = { field: 'Field is required.' };
              }
            });
          }

          return errors;
        }}
        onSubmit={(values, { setSubmitting }) => {
          setSubmitting(false);
          submit(values);
        }}
        enableReinitialize={true}
      >
        {({ values: { name, queries, time_window, trigger }, touched, errors, ...props }) => {
          if (resetForm.current) {
            resetForm.current = false;
            props.resetForm();
          }

          return (
            <Form>
              <ContentPanel
                title={'Correlation rule details'}
                panelStyles={{ paddingLeft: 10, paddingRight: 10 }}
              >
                <EuiCompressedFormRow
                  label={
                    <EuiText size={'s'}>
                      <strong>Name</strong>
                    </EuiText>
                  }
                  isInvalid={touched.name && !!errors?.name}
                  error={errors.name}
                  helpText={
                    'Rule name must contain 5-50 characters. Valid characters are a-z, A-Z, 0-9, hyphens, spaces, and underscores.'
                  }
                >
                  <EuiCompressedFieldText
                    isInvalid={touched.name && !!errors.name}
                    placeholder="Enter rule name"
                    data-test-subj={'rule_name_field'}
                    onChange={(e) => {
                      props.handleChange('name')(e);
                    }}
                    onBlur={props.handleBlur('name')}
                    value={name}
                  />
                </EuiCompressedFormRow>
                <EuiSpacer />
                <EuiCompressedFormRow
                  label={
                    <>
                      <EuiText size={'s'}>
                        <strong>Time window</strong>
                      </EuiText>
                      <EuiText size="xs" color="subdued">
                        <p>The period during which the findings are considered correlated.</p>
                      </EuiText>
                    </>
                  }
                  isInvalid={!!errors?.time_window}
                  error={errors.time_window}
                  helpText={
                    'A valid time window is between 1 minute and 24 hours. Consider keeping time window to the minimum for more accurate correlations.'
                  }
                >
                  <EuiFlexGroup gutterSize="none">
                    <EuiFlexItem>
                      <EuiCompressedFieldNumber
                        isInvalid={!!errors.time_window}
                        min={1}
                        max={period.unit === 'HOURS' ? 24 : 1440}
                        icon={'clock'}
                        value={period.interval}
                        onChange={(e) => {
                          const newInterval = e.target.valueAsNumber;
                          const newTimeWindow =
                            newInterval * (period.unit === 'HOURS' ? 3600000 : 60000);
                          props.setFieldValue('time_window', newTimeWindow);
                          setPeriod({ ...period, interval: newInterval });
                        }}
                        data-test-subj={'detector-schedule-number-select'}
                        required={true}
                      />
                    </EuiFlexItem>
                    <EuiFlexItem>
                      <EuiCompressedSelect
                        options={unitOptions}
                        onChange={(e) => {
                          const newUnit = e.target.value;
                          const newTimeWindow =
                            period.interval * (newUnit === 'HOURS' ? 3600000 : 60000);
                          props.setFieldValue('time_window', newTimeWindow);
                          setPeriod({ ...period, unit: newUnit });
                        }}
                        value={period.unit}
                        data-test-subj={'detector-schedule-unit-select'}
                      />
                    </EuiFlexItem>
                  </EuiFlexGroup>
                </EuiCompressedFormRow>
              </ContentPanel>
              <EuiSpacer size="l" />
              <ContentPanel
                title="Correlation queries"
                subTitleText={
                  'Configure two or more queries to set the conditions for correlating findings.'
                }
                panelStyles={{ paddingLeft: 10, paddingRight: 10 }}
                hideHeaderBorder
              >
                {createForm(queries, touched, errors, props)}
              </ContentPanel>
              <EuiSpacer size="l" />
              <ContentPanel panelStyles={{ paddingLeft: 10, paddingRight: 10 }} hideHeaderBorder>
                <ExperimentalBanner />
                <EuiTitle size="m">
                  <h2>Alert Trigger </h2>
                </EuiTitle>
                <EuiSpacer size="s" />
                <EuiText>
                  <p>Get an alert on the correlation between the findings.</p>
                </EuiText>
                <EuiSpacer size="m" />
                <EuiCompressedFormRow>
                  <EuiFlexGroup>
                    <EuiFlexItem grow={false}>
                      <EuiSmallButton onClick={() => setShowForm(!showForm)}>
                        Add Alert Trigger
                      </EuiSmallButton>
                    </EuiFlexItem>
                  </EuiFlexGroup>
                </EuiCompressedFormRow>
                {showForm && (
                  <>
                    <EuiSpacer size="m" />
                    <EuiFlexGroup alignItems="center">
                      <EuiFlexItem grow={false}>
                        <EuiCompressedFormRow
                          label={
                            <EuiText size="s">
                              <p>Trigger Name</p>
                            </EuiText>
                          }
                        >
                          <EuiCompressedFieldText
                            placeholder="Trigger 1"
                            onChange={(e) => {
                              const triggerName = e.target.value || 'Trigger 1';
                              props.setFieldValue('trigger.name', triggerName);
                            }}
                            value={trigger?.name}
                            required={true}
                            data-test-subj="alert-condition-name"
                          />
                        </EuiCompressedFormRow>
                      </EuiFlexItem>
                      <EuiFlexItem grow={false}>
                        <EuiCompressedFormRow
                          label={
                            <EuiText size="s">
                              <p>Alert Severity</p>
                            </EuiText>
                          }
                        >
                          <EuiComboBox
                            placeholder="Alert Severity"
                            options={ruleSeverityComboBoxOptions}
                            singleSelection={{ asPlainText: true }}
                            onChange={(e) => {
                              const selectedSeverity = e[0]?.value || '';
                              props.setFieldValue('trigger.severity', selectedSeverity); // Update using setFieldValue
                            }}
                            selectedOptions={
                              trigger?.severity
                                ? [parseAlertSeverityToOption(trigger?.severity)]
                                : [ALERT_SEVERITY_OPTIONS.HIGHEST]
                            }
                            isClearable={true}
                            data-test-subj="alert-severity-combo-box"
                          />
                        </EuiCompressedFormRow>
                      </EuiFlexItem>
                      <EuiFlexItem grow={false}>
                        <EuiCompressedFormRow label={<p style={{ visibility: 'hidden' }}>_</p>}>
                          <EuiSmallButtonIcon
                            aria-label="Delete Alert Trigger"
                            data-test-subj="delete-alert-trigger-icon"
                            iconType="trash"
                            color="danger"
                            onClick={() => setShowForm(false)}
                          />
                        </EuiCompressedFormRow>
                      </EuiFlexItem>
                    </EuiFlexGroup>
                    <EuiSpacer size={'l'} />

                    <EuiCompressedSwitch
                      label="Send notification"
                      checked={showNotificationDetails}
                      onChange={(e) => {
                        setShowNotificationDetails(e.target.checked);
                      }}
                    />
                    <EuiSpacer />

                    {showNotificationDetails && (
                      <>
                        <EuiFlexGroup alignItems={'flexEnd'}>
                          <EuiFlexItem style={{ maxWidth: 400 }}>
                            <EuiCompressedFormRow
                              label={
                                <EuiText size="m">
                                  <p>Notification channel</p>
                                </EuiText>
                              }
                            >
                              <EuiComboBox
                                placeholder={'Select notification channel.'}
                                async={true}
                                isLoading={!!loadingNotifications}
                                options={notificationChannels.flatMap((channelType) =>
                                  channelType.options.map((option) => ({
                                    label: option.label,
                                    value: option.value,
                                  }))
                                )}
                                onChange={(selectedOptions) => {
                                  const newDestinationId =
                                    selectedOptions.length > 0
                                      ? selectedOptions[0].value || ''
                                      : '';
                                  props.setFieldValue(
                                    'trigger.actions[0].destination_id',
                                    newDestinationId
                                  );
                                }}
                                selectedOptions={
                                  trigger?.actions &&
                                  trigger.actions.length > 0 &&
                                  trigger.actions[0]?.destination_id
                                    ? ([
                                        notificationChannels.flatMap((channelType) =>
                                          channelType.options.filter(
                                            (option) =>
                                              option.value === trigger.actions?.[0]?.destination_id
                                          )
                                        )[0],
                                      ] as EuiComboBoxOptionOption<string>[])
                                    : []
                                }
                                singleSelection={{ asPlainText: true }}
                                isDisabled={!hasNotificationPlugin}
                              />
                            </EuiCompressedFormRow>
                          </EuiFlexItem>
                          <EuiFlexItem grow={false}>
                            <EuiSmallButton
                              href={NOTIFICATIONS_HREF}
                              iconType={'popout'}
                              target={'_blank'}
                              isDisabled={!hasNotificationPlugin}
                            >
                              Manage channels
                            </EuiSmallButton>
                          </EuiFlexItem>
                        </EuiFlexGroup>

                        {!hasNotificationPlugin && (
                          <>
                            <EuiSpacer size="m" />
                            <NotificationsCallOut />
                          </>
                        )}

                        <EuiSpacer size={'l'} />

                        <EuiAccordion
                          id={`alert-condition-notify-msg-1`}
                          buttonContent={
                            <EuiText size="m">
                              <p>Notification message</p>
                            </EuiText>
                          }
                          paddingSize={'l'}
                          initialIsOpen={false}
                        >
                          <EuiFlexGroup direction={'column'} style={{ width: '75%' }}>
                            <EuiFlexItem>
                              <EuiCompressedFormRow
                                label={
                                  <EuiText size={'s'}>
                                    <p>Message subject</p>
                                  </EuiText>
                                }
                                fullWidth={true}
                              >
                                <EuiCompressedFieldText
                                  placeholder={'Enter a subject for the notification message.'}
                                  onChange={(e) => {
                                    const subjectBody = e.target.value || '';
                                    props.setFieldValue(
                                      'trigger.actions[0].subject_template.source',
                                      subjectBody
                                    );
                                  }}
                                  value={trigger?.actions?.[0]?.subject_template?.source ?? ''}
                                  required={true}
                                  fullWidth={true}
                                />
                              </EuiCompressedFormRow>
                            </EuiFlexItem>

                            <EuiFlexItem>
                              <EuiCompressedFormRow
                                label={
                                  <EuiText size="s">
                                    <p>Message body</p>
                                  </EuiText>
                                }
                                fullWidth={true}
                              >
                                <EuiCompressedTextArea
                                  placeholder={'Enter the content of the notification message.'}
                                  onChange={(e) => {
                                    const messsageBody = e.target.value || '';
                                    props.setFieldValue(
                                      'trigger.actions[0].message_template.source',
                                      messsageBody
                                    );
                                  }}
                                  value={trigger?.actions?.[0]?.message_template?.source ?? ''}
                                  required={true}
                                  fullWidth={true}
                                />
                              </EuiCompressedFormRow>
                            </EuiFlexItem>
                          </EuiFlexGroup>
                        </EuiAccordion>

                        <EuiSpacer size="xl" />
                      </>
                    )}
                  </>
                )}
              </ContentPanel>
              {action === 'Create' || action === 'Edit' ? (
                <>
                  <EuiSpacer size="xl" />
                  <EuiFlexGroup justifyContent="flexEnd">
                    <EuiFlexItem grow={false}>
                      <EuiSmallButton href={`#${ROUTES.CORRELATION_RULES}`}>Cancel</EuiSmallButton>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiSmallButton
                        onClick={() => {
                          props.handleSubmit();
                        }}
                        fill={true}
                      >
                        {action === 'Edit' ? 'Update' : 'Create '} correlation rule
                      </EuiSmallButton>
                    </EuiFlexItem>
                  </EuiFlexGroup>
                </>
              ) : null}
            </Form>
          );
        }}
      </Formik>
    </>
  );
};
