/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Formik, Form, FormikErrors } from 'formik';
import { NotificationsStart } from 'opensearch-dashboards/public';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiFieldText,
  EuiButton,
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
  ruleDescriptionErrorString,
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
  const [logTypeOptions, setLogTypeOptions] = useState<any[]>([]);

  const onEditorTypeChange = (optionId: string) => {
    setSelectedEditorType(optionId);
  };

  const refreshLogTypeOptions = useCallback(async () => {
    const logTypeOptions = await getLogTypeOptions();
    setLogTypeOptions(logTypeOptions);
  }, []);

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
          if (!validateName(values.name)) {
            errors.name = 'Invalid rule name.';
          }
        }

        if (
          values.description &&
          !validateDescription(values.description, RULE_DESCRIPTION_REGEX)
        ) {
          errors.description = ruleDescriptionErrorString;
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

        if (!values.author) {
          errors.author = 'Author name is required';
        } else {
          if (!validateName(values.author, AUTHOR_REGEX)) {
            errors.author = 'Invalid author.';
          }
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
      {(props) => (
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

                <EuiFormRow
                  label={
                    <EuiText size={'s'}>
                      <strong>Rule name</strong>
                    </EuiText>
                  }
                  isInvalid={!!props.errors?.name}
                  error={props.errors.name}
                  helpText="Rule name must contain 5-50 characters. Valid characters are a-z, A-Z, 0-9, hyphens, spaces, and underscores"
                >
                  <EuiFieldText
                    isInvalid={!!props.errors?.name}
                    placeholder="My custom rule"
                    data-test-subj={'rule_name_field'}
                    onChange={(e) => {
                      props.handleChange('name')(e);
                    }}
                    onBlur={props.handleBlur('name')}
                    value={props.values.name}
                  />
                </EuiFormRow>

                <EuiSpacer size={'m'} />

                <EuiFormRow
                  label={
                    <EuiText size={'s'}>
                      <strong>Description </strong>
                      <i>- optional</i>
                    </EuiText>
                  }
                  isInvalid={!!props.errors?.description}
                  error={props.errors.description}
                >
                  <EuiFieldText
                    data-test-subj={'rule_description_field'}
                    onChange={(e) => {
                      props.handleChange('description')(e.target.value);
                    }}
                    onBlur={props.handleBlur('description')}
                    value={props.values.description}
                    placeholder={'Detects ...'}
                  />
                </EuiFormRow>

                <EuiSpacer size={'m'} />

                <EuiFormRow
                  label={
                    <EuiText size={'s'}>
                      <strong>Author</strong>
                    </EuiText>
                  }
                  helpText="Combine multiple authors separated with a comma"
                  isInvalid={!!props.errors?.author}
                  error={props.errors.author}
                >
                  <EuiFieldText
                    isInvalid={!!props.errors?.author}
                    placeholder="Enter author name"
                    data-test-subj={'rule_author_field'}
                    onChange={(e) => {
                      props.handleChange('author')(e);
                    }}
                    onBlur={props.handleBlur('author')}
                    value={props.values.author}
                  />
                </EuiFormRow>

                <EuiSpacer size={'xl'} />

                <EuiTitle>
                  <EuiText>
                    <h2>Details</h2>
                  </EuiText>
                </EuiTitle>

                <EuiSpacer />

                <EuiFlexGroup alignItems="flexStart">
                  <EuiFlexItem style={{ maxWidth: 400 }}>
                    <EuiFormRow
                      label={
                        <EuiText size={'s'}>
                          <strong>Log type</strong>
                        </EuiText>
                      }
                      isInvalid={!!props.errors?.logType}
                      error={props.errors.logType}
                    >
                      <EuiComboBox
                        isInvalid={!!props.errors?.logType}
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
                    </EuiFormRow>
                  </EuiFlexItem>
                  <EuiFlexItem grow={false} style={{ marginTop: 36 }}>
                    <EuiButton
                      href={'opensearch_security_analytics_dashboards#/log-types'}
                      target="_blank"
                    >
                      Manage <EuiIcon type={'popout'} />
                    </EuiButton>
                  </EuiFlexItem>
                </EuiFlexGroup>

                <EuiSpacer />

                <EuiFormRow
                  label={
                    <EuiText size={'s'}>
                      <strong>Rule level (severity)</strong>
                    </EuiText>
                  }
                  isInvalid={!!props.errors?.level}
                  error={props.errors.level}
                >
                  <EuiComboBox
                    isInvalid={!!props.errors?.level}
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
                </EuiFormRow>

                <EuiSpacer />

                <EuiFormRow
                  label={
                    <EuiText size={'s'}>
                      <strong>Rule Status</strong>
                    </EuiText>
                  }
                  isInvalid={!!props.errors?.status}
                  error={props.errors.status}
                >
                  <EuiComboBox
                    isInvalid={!!props.errors?.status}
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
                </EuiFormRow>

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
                  isInvalid={isDetectionInvalid}
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
                        isInvalid={!!props.errors.tags}
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
                        isInvalid={!!props.errors?.references}
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
                        isInvalid={!!props.errors?.falsePositives}
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
              <EuiButton onClick={cancel}>Cancel</EuiButton>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiButton
                onClick={() => props.handleSubmit()}
                data-test-subj={'submit_rule_form_button'}
                fill
              >
                {mode === 'create' ? 'Create detection rule' : 'Save changes'}
              </EuiButton>
            </EuiFlexItem>
          </EuiFlexGroup>
        </Form>
      )}
    </Formik>
  );
};
