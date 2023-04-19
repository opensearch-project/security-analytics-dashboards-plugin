/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useContext, useEffect, useState } from 'react';
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
  EuiHorizontalRule,
} from '@elastic/eui';
import { ruleTypes } from '../../Rules/utils/constants';
import { CorrelationRuleModel, CorrelationRuleQuery } from '../../../../types';
import { BREADCRUMBS, ROUTES } from '../../../utils/constants';
import { CoreServicesContext } from '../../../components/core_services';
import { RouteComponentProps } from 'react-router-dom';
import { CorrelationsExperimentalBanner } from '../components/ExperimentalBanner';
import { validateName } from '../../../utils/validation';
import { FieldMappingService, IndexService } from '../../../services';
import { errorNotificationToast } from '../../../utils/helpers';

export interface CreateCorrelationRuleProps {
  indexService: IndexService;
  fieldMappingService: FieldMappingService;
  history: RouteComponentProps<any, any, { rule: CorrelationRuleModel }>['history'];
  notifications: NotificationsStart | null;
}

export interface CorrelationOptions {
  label: string;
  value: string;
}

export const CreateCorrelationRule: React.FC<CreateCorrelationRuleProps> = (
  props: CreateCorrelationRuleProps
) => {
  const correlationStore = DataStore.correlationsStore;
  const validateCorrelationRule = useCallback((rule: CorrelationRuleModel) => {
    if (!rule.name) {
      return 'Invalid rule name';
    }

    let error = '';
    const invalidQuery = rule.queries.some((query, index) => {
      const invalidIndex = !query.index;
      if (invalidIndex) {
        error = `Invalid index for query ${index + 1}`;
        return true;
      }

      const invalidlogType = !query.logType;
      if (invalidlogType) {
        error = `Invalid log type for query ${index + 1}`;
        return true;
      }

      return query.conditions.some((cond) => {
        const invalid = !cond.name || !cond.value;
        if (invalid) {
          error = `Invalid fields for query ${index + 1}`;
          return true;
        }

        return false;
      });
    });

    if (invalidQuery) {
      return error;
    }

    return undefined;
  }, []);

  const submit = async (values: any) => {
    let error;
    if ((error = validateCorrelationRule(values))) {
      errorNotificationToast(props.notifications, 'Create', 'rule', error);
      return;
    }

    await correlationStore.createCorrelationRule(values);

    props.history.push(ROUTES.CORRELATION_RULES);
  };

  const context = useContext(CoreServicesContext);
  const isEdit = !!props.history.location.state?.rule;
  const initialValues = props.history.location.state?.rule || {
    ...correlationRuleStateDefaultValue,
  };

  const [indices, setIndices] = useState<CorrelationOptions[]>([]);
  const [logFields, setLogFields] = useState<CorrelationOptions[]>([]);

  const parseOptions = (indices: string[]) => {
    return indices.map(
      (index: string): CorrelationOptions => ({
        label: index,
        value: index,
      })
    );
  };

  const getIndices = useCallback(async () => {
    try {
      const indicesResponse = await props.indexService.getIndices();
      if (indicesResponse.ok) {
        const indicesNames = parseOptions(
          indicesResponse.response.indices.map((index) => index.index)
        );
        setIndices(indicesNames);
      }
    } catch (error: any) {}
  }, [props.indexService.getIndices]);

  useEffect(() => {
    getIndices();
  }, [props.indexService]);

  const getLogFields = useCallback(
    async (indexName: string, logType: string) => {
      if (indexName && logType) {
        const result = await props.fieldMappingService?.getMappingsView(indexName, logType);
        if (result?.ok) {
          let fields: {
            label: string;
            value: string;
          }[] =
            result.response?.unmapped_field_aliases?.map((field) => ({
              label: field,
              value: field,
            })) || [];
          fields = fields?.concat(
            Object.keys(result.response.properties).map((field) => ({
              label: field,
              value: field,
            }))
          );

          setLogFields(fields);
        }
      }
    },
    [props.fieldMappingService?.getMappingsView]
  );

  const createForm = (
    correlationQueries: CorrelationRuleQuery[],
    touchedInputs: FormikTouched<CorrelationRuleModel>,
    formikErrors: FormikErrors<CorrelationRuleModel>,
    props: any
  ) => {
    return (
      <>
        {correlationQueries.map((query, queryIdx) => {
          const isInvalidInputForQuery = (field: 'logType' | 'index'): boolean => {
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
                      <p>Query {queryIdx + 1}</p>
                    </EuiTitle>
                  }
                  extraAction={
                    queryIdx > 1 ? (
                      <EuiToolTip title={'Delete query'}>
                        <EuiButtonIcon iconType={'trash'} color="danger" />
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
                        getLogFields(e[0]?.value ? e[0].value : '', query.logType);
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
                      options={ruleTypes.map(({ value, label }) => ({ value, label }))}
                      singleSelection={{ asPlainText: true }}
                      onChange={(e) => {
                        props.handleChange(`queries[${queryIdx}].logType`)(
                          e[0]?.value ? e[0].value : ''
                        );
                        getLogFields(query.index, e[0]?.value ? e[0].value : '');
                      }}
                      onBlur={props.handleBlur(`queries[${queryIdx}].logType`)}
                      selectedOptions={
                        query.logType ? [{ value: query.logType, label: query.logType }] : []
                      }
                    />
                  </EuiFormRow>
                  <EuiSpacer size="xl" />
                  <EuiTitle size="xs">
                    <h3>Fields</h3>
                  </EuiTitle>
                  <EuiSpacer size="m" />
                  {query.conditions.map((condition, conditionIdx) => {
                    const fieldNameInput = (
                      <EuiComboBox
                        // isInvalid={isInvalidInputForQuery('logType')}
                        placeholder="Select a field"
                        data-test-subj={'field_dropdown'}
                        options={logFields}
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
                          condition.name ? [{ value: condition.name, label: condition.name }] : []
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
                        // isInvalid={props.touched.name && !!props.errors.name}
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

                    const conditionToggleButtons = [
                      { id: 'AND', label: 'AND' },
                      { id: 'OR', label: 'OR' },
                    ];
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
                      <EuiFlexGroup>
                        <EuiFlexItem grow={false} style={{ minWidth: 200 }}>
                          <EuiFormRow
                            label={<EuiText size={'s'}>Field</EuiText>}
                            // isInvalid={props.touched.from?.conditions && props.touched.from?.conditions[index].name && !!props.errors?.name}
                            // error={props.errors.name}
                            // helpText="Rule name must contain 5-50 characters. Valid characters are a-z, A-Z, 0-9, hyphens, spaces, and underscores."
                          >
                            {fieldNameInput}
                          </EuiFormRow>
                        </EuiFlexItem>
                        <EuiFlexItem grow={false} style={{ minWidth: 200 }}>
                          <EuiFormRow
                            label={<EuiText size={'s'}>Field value</EuiText>}
                            // isInvalid={props.touched.from?.conditions && props.touched.from?.conditions[index].name && !!props.errors?.name}
                            // error={props.errors.name}
                            // helpText="Rule name must contain 5-50 characters. Valid characters are a-z, A-Z, 0-9, hyphens, spaces, and underscores."
                          >
                            {fieldValueInput}
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
                        <EuiAccordion
                          id={`field-${conditionIdx}`}
                          initialIsOpen={true}
                          buttonContent={`Field ${conditionIdx + 1}`}
                          extraAction={
                            query.conditions.length > 1 ? (
                              <EuiToolTip title={'Delete query'}>
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
                              </EuiToolTip>
                            ) : null
                          }
                          style={{ maxWidth: '500px' }}
                        >
                          <EuiSpacer size="m" />
                          {conditionIdx === 0 ? firstFieldRow : fieldRowWithCondition}
                          <EuiHorizontalRule />
                        </EuiAccordion>
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
                </EuiAccordion>
              </EuiPanel>
              <EuiSpacer />
            </>
          );
        })}
        <EuiSpacer />
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiButton
              onClick={() => {
                props.setFieldValue('queries', [
                  ...correlationQueries,
                  { ...correlationRuleStateDefaultValue.queries[0] },
                ]);
              }}
              iconType={'plusInCircle'}
            >
              Add query
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
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
      <CorrelationsExperimentalBanner />
      <EuiTitle>
        <h1>Create correlation rule</h1>
      </EuiTitle>
      <EuiText size="s" color="subdued">
        Create a correlation rule to define threat scenarios of interest between different log
        sources.
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

          return errors;
        }}
        onSubmit={(values, { setSubmitting }) => {
          setSubmitting(false);
          submit(values);
        }}
      >
        {({ values: { name, queries }, touched, errors, ...props }) => {
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
                  helpText="Rule name must contain 5-50 characters. Valid characters are a-z, A-Z, 0-9, hyphens, spaces, and underscores."
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
              </ContentPanel>
              <EuiSpacer size="l" />
              <ContentPanel
                title="Correlation queries"
                subTitleText={
                  'Configure two or more queries to set the conditions for correlating findings.'
                }
                panelStyles={{ paddingLeft: 10, paddingRight: 10 }}
              >
                {createForm(queries, touched, errors, props)}
              </ContentPanel>
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
                    {isEdit ? 'Update' : 'Create '} correlation rule
                  </EuiButton>
                </EuiFlexItem>
              </EuiFlexGroup>
            </Form>
          );
        }}
      </Formik>
    </>
  );
};
