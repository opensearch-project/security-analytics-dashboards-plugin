/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useContext, useEffect, useRef, useState } from 'react';
import { Formik, Form, FormikErrors } from 'formik';
import { NotificationsStart } from 'opensearch-dashboards/public';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiCompressedFormRow,
  EuiCompressedFieldText,
  EuiSmallButton,
  EuiSpacer,
  EuiAccordion,
  EuiComboBox,
  EuiButtonGroup,
  EuiText,
  EuiTitle,
  EuiPanel,
  EuiIcon,
} from '@elastic/eui';
import { ContentPanel } from '../../../../components/ContentPanel';
import { FieldTextArray } from './components/FieldTextArray';
import { ruleSeverity, ruleStatus, ruleTypes } from '../../utils/constants';
import {
  AUTHOR_REGEX,
  RULE_DESCRIPTION_REGEX,
  RULE_NAME_REGEX,
  detectionRuleNameError,
  detectionRuleDescriptionError,
  validateDescription,
  validateName,
} from '../../../../utils/validation';
import { RuleEditorFormModel } from './RuleEditorFormModel';
import { FormSubmissionErrorToastNotification } from './FormSubmitionErrorToastNotification';
import { YamlRuleEditorComponent } from './components/YamlRuleEditorComponent/YamlRuleEditorComponent';
import { mapFormToRule, mapRuleToForm } from './mappers';
import { DetectionVisualEditor } from './DetectionVisualEditor';
import { useCallback } from 'react';
import { getLogTypeOptions } from '../../../../utils/helpers';
import { getLogTypeLabel } from '../../../LogTypes/utils/helpers';
import { getSeverityLabel } from '../../../Correlations/utils/constants';
import { DataSourceContext } from '../../../../services/DataSourceContext';

export interface VisualRuleEditorProps {
  initialValue: RuleEditorFormModel;
  notifications?: NotificationsStart;
  validateOnMount?: boolean;
  submit: (values: RuleEditorFormModel) => void;
  cancel: () => void;
  mode: 'create' | 'edit';
  title: string | JSX.Element;
}

const editorTypes = [
  {
    id: 'visual',
    label: 'Visual Editor',
  },
  {
    id: 'yaml',
    label: 'YAML Editor',
  },
];

export const TAGS_PREFIX = 'attack.';

export const RuleEditorForm: React.FC<VisualRuleEditorProps> = ({
  initialValue,
  notifications,
  submit,
  cancel,
  mode,
  title,
  validateOnMount,
}) => {
  const [selectedEditorType, setSelectedEditorType] = useState('visual');
  const [isDetectionInvalid, setIsDetectionInvalid] = useState(false);
  const resetLogType = useRef(false);
  const [logTypeOptions, setLogTypeOptions] = useState<any[]>([]);
  const dataSourceContext = useContext(DataSourceContext);

  // This is used to avoid refreshing the log type options on first render since that clears the
  // selected log type when importing log types.
  const firstUpdate = useRef(true);

  const onEditorTypeChange = (optionId: string) => {
    setSelectedEditorType(optionId);
  };

  const refreshLogTypeOptions = useCallback(async () => {
    const logTypeOptions = await getLogTypeOptions();
    setLogTypeOptions(logTypeOptions);
  }, []);

  useEffect(() => {
    const shouldResetLogTypeOptions = mode !== 'edit' && !firstUpdate.current;
    if (!shouldResetLogTypeOptions) {
      return;
    }

    refreshLogTypeOptions();
    resetLogType.current = true;
    firstUpdate.current = false;
  }, [dataSourceContext.dataSource]);

  const validateTags = (fields: string[]) => {
    let isValid = true;
    let tag;
    for (let i = 0; i < fields.length; i++) {
      tag = fields[i];
      if (tag.length && !(tag.startsWith(TAGS_PREFIX) && tag.length > TAGS_PREFIX.length)) {
        isValid = false;
        break;
      }
    }

    return isValid;
  };

  return (
    <Formik
      initialValues={initialValue}
      validateOnMount={validateOnMount}
      validate={(values) => {
        const errors: FormikErrors<RuleEditorFormModel> = {};

        if (!values.name) {
          errors.name = 'Rule name is required';
        } else {
          if (!validateName(values.name, RULE_NAME_REGEX)) {
            errors.name = 'Invalid rule name.';
          }
        }

        if (
          values.description &&
          !validateDescription(values.description, RULE_DESCRIPTION_REGEX)
        ) {
          errors.description = detectionRuleDescriptionError;
        }

        if (!values.logType) {
          errors.logType = 'Log type is required';
        } else if (!ruleTypes.some((type) => type.value === values.logType)) {
          errors.logType = `Invalid log type`;
        }

        if (!values.detection) {
          errors.detection = 'Detection is required';
        }

        if (!values.level) {
          errors.level = 'Rule level is required';
        } else if (!ruleSeverity.some((sev) => sev.value === values.level)) {
          errors.level = `Invalid rule level. Should be one of critical, high, medium, low, informational`;
        }

        if (!validateName(values.author, AUTHOR_REGEX)) {
          errors.author = 'Invalid author.';
        }

        if (!values.status) {
          errors.status = 'Rule status is required';
        } else if (!ruleStatus.includes(values.status)) {
          errors.status = `Invalid rule status. Should be one of experimental, test, stable`;
        }

        if (!validateTags(values.tags)) {
          errors.tags = `Tags must start with '${TAGS_PREFIX}'`;
        }

        return errors;
      }}
      onSubmit={(values, { setSubmitting }) => {
        if (isDetectionInvalid) {
          return;
        }

        setSubmitting(false);
        submit(values);
      }}
    >
      {(props) => {
        if (resetLogType.current) {
          resetLogType.current = false;
          props.setFieldValue('logType', '');
        }

        return (
          <Form>
            <ContentPanel title={title} className={'rule-editor-form'}>
              <EuiButtonGroup
                data-test-subj="change-editor-type"
                legend="This is editor type selector"
                options={editorTypes}
                idSelected={selectedEditorType}
                onChange={(id) => onEditorTypeChange(id)}
              />

              <EuiSpacer size="xl" />

              {selectedEditorType === 'yaml' && (
                <YamlRuleEditorComponent
                  rule={mapFormToRule(props.values)}
                  isInvalid={Object.keys(props.errors).length > 0}
                  errors={Object.keys(props.errors).map(
                    (key) => props.errors[key as keyof RuleEditorFormModel] as string
                  )}
                  change={(e) => {
                    const formState = mapRuleToForm(e);
                    props.setValues(formState);
                  }}
                ></YamlRuleEditorComponent>
              )}
              <FormSubmissionErrorToastNotification notifications={notifications} />
              {selectedEditorType === 'visual' && (
                <>
                  <EuiTitle>
                    <EuiText>
                      <h2>Rule overview</h2>
                    </EuiText>
                  </EuiTitle>

                  <EuiSpacer />

                  <EuiCompressedFormRow
                    label={
                      <EuiText size={'s'}>
                        <strong>Rule name</strong>
                      </EuiText>
                    }
                    isInvalid={(validateOnMount || props.touched.name) && !!props.errors?.name}
                    error={props.errors.name}
                    helpText={detectionRuleNameError}
                  >
                    <EuiCompressedFieldText
                      isInvalid={(validateOnMount || props.touched.name) && !!props.errors?.name}
                      placeholder="My custom rule"
                      data-test-subj={'rule_name_field'}
                      onChange={(e) => {
                        props.handleChange('name')(e);
                      }}
                      onBlur={props.handleBlur('name')}
                      value={props.values.name}
                    />
                  </EuiCompressedFormRow>

                  <EuiSpacer size={'m'} />

                  <EuiCompressedFormRow
                    label={
                      <EuiText size={'s'}>
                        <strong>Description </strong>
                        <i>- optional</i>
                      </EuiText>
                    }
                    isInvalid={
                      (validateOnMount || props.touched.description) && !!props.errors?.description
                    }
                    error={props.errors.description}
                  >
                    <EuiCompressedFieldText
                      data-test-subj={'rule_description_field'}
                      onChange={(e) => {
                        props.handleChange('description')(e.target.value);
                      }}
                      onBlur={props.handleBlur('description')}
                      value={props.values.description}
                      placeholder={'Detects ...'}
                    />
                  </EuiCompressedFormRow>

                  <EuiSpacer size={'m'} />

                  <EuiCompressedFormRow
                    label={
                      <EuiText size={'s'}>
                        <strong>Author</strong>
                      </EuiText>
                    }
                    helpText="Combine multiple authors separated with a comma"
                    isInvalid={(validateOnMount || props.touched.author) && !!props.errors?.author}
                    error={props.errors.author}
                  >
                    <EuiCompressedFieldText
                      isInvalid={
                        (validateOnMount || props.touched.author) && !!props.errors?.author
                      }
                      placeholder="Enter author name"
                      data-test-subj={'rule_author_field'}
                      onChange={(e) => {
                        props.handleChange('author')(e);
                      }}
                      onBlur={props.handleBlur('author')}
                      value={props.values.author}
                    />
                  </EuiCompressedFormRow>

                  <EuiSpacer size={'xl'} />

                  <EuiTitle>
                    <EuiText>
                      <h2>Details</h2>
                    </EuiText>
                  </EuiTitle>

                  <EuiSpacer />

                  <EuiFlexGroup alignItems="flexStart">
                    <EuiFlexItem style={{ maxWidth: 400 }}>
                      <EuiCompressedFormRow
                        label={
                          <EuiText size={'s'}>
                            <strong>Log type</strong>
                          </EuiText>
                        }
                        isInvalid={
                          (validateOnMount || props.touched.logType) && !!props.errors?.logType
                        }
                        error={props.errors.logType}
                      >
                        <EuiComboBox
                          isInvalid={
                            (validateOnMount || props.touched.logType) && !!props.errors?.logType
                          }
                          placeholder="Select a log type"
                          data-test-subj={'rule_type_dropdown'}
                          options={logTypeOptions}
                          singleSelection={{ asPlainText: true }}
                          onChange={(e) => {
                            props.handleChange('logType')(e[0]?.value ? e[0].value : '');
                          }}
                          onFocus={refreshLogTypeOptions}
                          onBlur={props.handleBlur('logType')}
                          selectedOptions={
                            props.values.logType
                              ? [
                                  {
                                    value: props.values.logType,
                                    label: getLogTypeLabel(props.values.logType),
                                  },
                                ]
                              : []
                          }
                        />
                      </EuiCompressedFormRow>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false} style={{ marginTop: 36 }}>
                      <EuiSmallButton
                        href={'opensearch_security_analytics_dashboards#/log-types'}
                        target="_blank"
                      >
                        Manage <EuiIcon type={'popout'} />
                      </EuiSmallButton>
                    </EuiFlexItem>
                  </EuiFlexGroup>

                  <EuiSpacer />

                  <EuiCompressedFormRow
                    label={
                      <EuiText size={'s'}>
                        <strong>Rule level (severity)</strong>
                      </EuiText>
                    }
                    isInvalid={(validateOnMount || props.touched.level) && !!props.errors?.level}
                    error={props.errors.level}
                  >
                    <EuiComboBox
                      isInvalid={(validateOnMount || props.touched.level) && !!props.errors?.level}
                      placeholder="Select a rule level"
                      data-test-subj={'rule_severity_dropdown'}
                      options={ruleSeverity.map(({ name, value }) => ({ label: name, value }))}
                      singleSelection={{ asPlainText: true }}
                      onChange={(e) => {
                        props.handleChange('level')(e[0]?.value ? e[0].value : '');
                      }}
                      onBlur={props.handleBlur('level')}
                      selectedOptions={
                        props.values.level
                          ? [
                              {
                                value: props.values.level,
                                label: getSeverityLabel(props.values.level),
                              },
                            ]
                          : []
                      }
                    />
                  </EuiCompressedFormRow>

                  <EuiSpacer />

                  <EuiCompressedFormRow
                    label={
                      <EuiText size={'s'}>
                        <strong>Rule Status</strong>
                      </EuiText>
                    }
                    isInvalid={(validateOnMount || props.touched.status) && !!props.errors?.status}
                    error={props.errors.status}
                  >
                    <EuiComboBox
                      isInvalid={
                        (validateOnMount || props.touched.status) && !!props.errors?.status
                      }
                      placeholder="Select a rule status"
                      data-test-subj={'rule_status_dropdown'}
                      options={ruleStatus.map((type: string) => ({ value: type, label: type }))}
                      singleSelection={{ asPlainText: true }}
                      onChange={(e) => {
                        props.handleChange('status')(e[0]?.value ? e[0].value : '');
                      }}
                      onBlur={props.handleBlur('status')}
                      selectedOptions={
                        props.values.status
                          ? [{ value: props.values.status, label: props.values.status }]
                          : []
                      }
                    />
                  </EuiCompressedFormRow>

                  <EuiSpacer size={'xxl'} />

                  <EuiTitle>
                    <EuiText>
                      <h2>Detection</h2>
                    </EuiText>
                  </EuiTitle>
                  <EuiText size="s">
                    <p>Define the detection criteria for the rule</p>
                  </EuiText>

                  <EuiSpacer />

                  <DetectionVisualEditor
                    isInvalid={(validateOnMount || props.touched.detection) && isDetectionInvalid}
                    detectionYml={props.values.detection}
                    goToYamlEditor={setSelectedEditorType}
                    setIsDetectionInvalid={(isInvalid: boolean) => {
                      if (isInvalid) {
                        props.errors.detection = 'Invalid detection entries';
                      } else {
                        delete props.errors.detection;
                      }

                      setIsDetectionInvalid(isInvalid);
                    }}
                    onChange={(detection: string) => {
                      props.handleChange('detection')(detection);
                    }}
                  />

                  <EuiSpacer size={'xl'} />

                  <EuiPanel style={{ maxWidth: 1000 }}>
                    <EuiAccordion
                      id={'additional-details'}
                      initialIsOpen={true}
                      buttonContent={
                        <>
                          Additional details <i>- optional</i>
                        </>
                      }
                    >
                      <div className={'rule-editor-form-additional-details-panel-body'}>
                        <EuiSpacer />

                        <FieldTextArray
                          name="tags"
                          placeholder={'tag'}
                          label={
                            <>
                              <EuiText size={'m'}>
                                <strong>Tags </strong>
                                <i>- optional</i>
                              </EuiText>

                              <EuiSpacer size={'m'} />

                              <EuiText size={'xs'}>
                                <strong>Tag</strong>
                              </EuiText>
                            </>
                          }
                          addButtonName="Add tag"
                          fields={props.values.tags}
                          error={props.errors.tags}
                          isInvalid={(validateOnMount || props.touched.tags) && !!props.errors.tags}
                          onChange={(tags) => {
                            props.touched.tags = true;
                            props.setFieldValue('tags', tags);
                          }}
                          data-test-subj={'rule_tags_field'}
                        />

                        <FieldTextArray
                          name="references"
                          placeholder={'http://'}
                          label={
                            <>
                              <EuiText size={'m'}>
                                <strong>References </strong>
                                <i>- optional</i>
                              </EuiText>

                              <EuiSpacer size={'m'} />

                              <EuiText size={'xs'}>
                                <strong>URL</strong>
                              </EuiText>
                            </>
                          }
                          addButtonName="Add URL"
                          fields={props.values.references}
                          error={props.errors.references}
                          isInvalid={
                            (validateOnMount || props.touched.references) &&
                            !!props.errors?.references
                          }
                          onChange={(references) => {
                            props.touched.references = true;
                            props.setFieldValue('references', references);
                          }}
                          data-test-subj={'rule_references_field'}
                        />

                        <FieldTextArray
                          name="false_positives"
                          placeholder={'format?'}
                          label={
                            <>
                              <EuiText size={'m'}>
                                <strong>False positive cases </strong>
                                <i>- optional</i>
                              </EuiText>

                              <EuiSpacer size={'m'} />

                              <EuiText size={'xs'}>
                                <strong>Description</strong>
                              </EuiText>
                            </>
                          }
                          addButtonName="Add false positive"
                          fields={props.values.falsePositives}
                          error={props.errors.falsePositives}
                          isInvalid={
                            (validateOnMount || props.touched.falsePositives) &&
                            !!props.errors?.falsePositives
                          }
                          onChange={(falsePositives) => {
                            props.touched.falsePositives = true;
                            props.setFieldValue('falsePositives', falsePositives);
                          }}
                          data-test-subj={'rule_falsePositives_field'}
                        />
                      </div>
                    </EuiAccordion>
                  </EuiPanel>
                </>
              )}
            </ContentPanel>

            <EuiSpacer />

            <EuiFlexGroup justifyContent="flexEnd">
              <EuiFlexItem grow={false}>
                <EuiSmallButton onClick={cancel}>Cancel</EuiSmallButton>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiSmallButton
                  onClick={() => props.handleSubmit()}
                  data-test-subj={'submit_rule_form_button'}
                  fill
                >
                  {mode === 'create' ? 'Create detection rule' : 'Save changes'}
                </EuiSmallButton>
              </EuiFlexItem>
            </EuiFlexGroup>
          </Form>
        );
      }}
    </Formik>
  );
};
