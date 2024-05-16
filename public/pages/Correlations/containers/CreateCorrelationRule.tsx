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
  EuiButton,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiText,
  EuiComboBox,
  EuiFieldText,
  EuiSpacer,
  EuiTitle,
  EuiPanel,
  EuiAccordion,
  EuiButtonIcon,
  EuiToolTip,
  EuiButtonGroup,
  EuiSelect,
  EuiSelectOption,
  EuiFieldNumber,
  EuiCheckableCard,
  htmlIdGenerator,
} from '@elastic/eui';
import { ruleTypes } from '../../Rules/utils/constants';
import {
  CorrelationRule,
  CorrelationRuleAction,
  CorrelationRuleModel,
  CorrelationRuleQuery,
  DataSourceProps,
} from '../../../../types';
import { BREADCRUMBS, ROUTES } from '../../../utils/constants';
import { CoreServicesContext } from '../../../components/core_services';
import { RouteComponentProps, useParams } from 'react-router-dom';
import { validateName } from '../../../utils/validation';
import { FieldMappingService, IndexService } from '../../../services';
import { errorNotificationToast, getDataSources, getLogTypeOptions } from '../../../utils/helpers';
import _ from 'lodash';

export interface CreateCorrelationRuleProps extends DataSourceProps {
  indexService: IndexService;
  fieldMappingService: FieldMappingService;
  history: RouteComponentProps<
    any,
    any,
    { rule: CorrelationRuleModel; isReadOnly: boolean }
  >['history'];
  notifications: NotificationsStart | null;
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
  const [logTypeOptions, setLogTypeOptions] = useState<any[]>([]);
  const [period, setPeriod] = useState({ interval: 1, unit: 'MINUTES' });
  const [dataFilterEnabled, setDataFilterEnabled] = useState(false);
  const [groupByEnabled, setGroupByEnabled] = useState(false);
  const resetForm = useRef(false);

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

    resetForm.current = true;
  }, [props.dataSource]);

  useEffect(() => {
    setPeriod(parseTime(initialValues.time_window));
    setGroupByEnabled(initialValues.queries.some((q) => !!q.field));
    setDataFilterEnabled(initialValues.queries.some((q) => q.conditions.length > 0));

    initialValues.queries.forEach(({ index }) => {
      updateLogFieldsForIndex(index);
    });
  }, [initialValues]);

  const submit = async (values: CorrelationRuleModel) => {
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
      let fields: {
        label: string;
        value: string;
      }[] = [];

      if (indexName) {
        const result = await props.indexService.getIndexFields(indexName);
        if (result?.ok) {
          fields = result.response?.map((field) => ({
            label: field,
            value: field,
          }));
        }

        return fields;
      }

      return fields;
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
                        <EuiButtonIcon
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
                  <EuiFormRow
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
                  </EuiFormRow>
                  <EuiSpacer size="m" />
                  <EuiFormRow
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
                  </EuiFormRow>
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
                          <EuiFieldText
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
                              <EuiFormRow label={<EuiText size={'s'}>Field</EuiText>}>
                                {fieldNameInput}
                              </EuiFormRow>
                            </EuiFlexItem>
                            <EuiFlexItem grow={false} style={{ minWidth: 200 }}>
                              <EuiFormRow label={<EuiText size={'s'}>Field value</EuiText>}>
                                {fieldValueInput}
                              </EuiFormRow>
                            </EuiFlexItem>
                            <EuiFlexItem>
                              <EuiFormRow label={<p style={{ visibility: 'hidden' }}>_</p>}>
                                <EuiButtonIcon
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
                              </EuiFormRow>
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
                      <EuiButton
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
                      </EuiButton>
                    </>
                  )}

                  {groupByEnabled && (
                    <>
                      <EuiSpacer />
                      <EuiTitle size="xs">
                        <h3>Group by field</h3>
                      </EuiTitle>
                      <EuiSpacer size="s" />
                      <EuiFormRow
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
                      </EuiFormRow>
                    </>
                  )}
                </EuiAccordion>
              </EuiPanel>
              <EuiSpacer />
            </>
          );
        })}
        <EuiSpacer />
        <EuiButton
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
        </EuiButton>
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
        {({ values: { name, queries, time_window }, touched, errors, ...props }) => {
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
                <EuiFormRow
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
                  <EuiFieldText
                    isInvalid={touched.name && !!errors.name}
                    placeholder="Enter rule name"
                    data-test-subj={'rule_name_field'}
                    onChange={(e) => {
                      props.handleChange('name')(e);
                    }}
                    onBlur={props.handleBlur('name')}
                    value={name}
                  />
                </EuiFormRow>
                <EuiSpacer />
                <EuiFormRow
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
                      <EuiFieldNumber
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
                      <EuiSelect
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
                </EuiFormRow>
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
              {action === 'Create' || action === 'Edit' ? (
                <>
                  <EuiSpacer size="xl" />
                  <EuiFlexGroup justifyContent="flexEnd">
                    <EuiFlexItem grow={false}>
                      <EuiButton href={`#${ROUTES.CORRELATION_RULES}`}>Cancel</EuiButton>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiButton
                        onClick={() => {
                          props.handleSubmit();
                        }}
                        fill={true}
                      >
                        {action === 'Edit' ? 'Update' : 'Create '} correlation rule
                      </EuiButton>
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
