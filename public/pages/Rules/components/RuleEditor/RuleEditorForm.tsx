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
  EuiTextArea,
  EuiComboBox,
  EuiCodeEditor,
  EuiButtonGroup,
  EuiText,
} from '@elastic/eui';
import { ContentPanel } from '../../../../components/ContentPanel';
import { FieldTextArray } from './FieldTextArray';
import { ruleStatus, ruleTypes } from '../../utils/constants';
import { AUTHOR_REGEX, validateDescription, validateName } from '../../../../utils/validation';
import { RuleEditorFormModel } from './RuleEditorFormModel';
import { FormSubmissionErrorToastNotification } from './FormSubmitionErrorToastNotification';
import { YamlRuleEditorComponent } from './components/YamlRuleEditorComponent/YamlRuleEditorComponent';
import { mapFormToRule, mapRuleToForm } from './mappers';
import { RuleTagsComboBox } from './components/YamlRuleEditorComponent/RuleTagsComboBox';

export interface VisualRuleEditorProps {
  initialValue: RuleEditorFormModel;
  notifications?: NotificationsStart;
  submit: (values: RuleEditorFormModel) => void;
  cancel: () => void;
  mode: 'create' | 'edit';
  title: string;
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

export const RuleEditorForm: React.FC<VisualRuleEditorProps> = ({
  initialValue,
  notifications,
  submit,
  cancel,
  mode,
  title,
}) => {
  const [selectedEditorType, setSelectedEditorType] = useState('visual');

  const onEditorTypeChange = (optionId: string) => {
    setSelectedEditorType(optionId);
  };

  return (
    <Formik
      initialValues={initialValue}
      validate={(values) => {
        const errors: FormikErrors<RuleEditorFormModel> = {};

        if (!values.name) {
          errors.name = 'Rule name is required';
        } else {
          if (!validateName(values.name)) {
            errors.name = 'Invalid rule name.';
          }
        }

        if (values.description && !validateDescription(values.description)) {
          errors.description = 'Invalid description.';
        }

        if (!values.logType) {
          errors.logType = 'Log type is required';
        }

        if (!values.detection) {
          errors.detection = 'Detection is required';
        }

        if (!values.level) {
          errors.level = 'Rule level is required';
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
        }

        return errors;
      }}
      onSubmit={(values, { setSubmitting }) => {
        setSubmitting(false);
        submit(values);
      }}
    >
      {(props) => (
        <Form>
          <ContentPanel title={title}>
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
                <EuiFlexGroup component="span">
                  <EuiFlexItem grow={false} style={{ minWidth: 400 }}>
                    <EuiFormRow
                      label={
                        <EuiText size={'s'}>
                          <strong>Rule name</strong>
                        </EuiText>
                      }
                      isInvalid={props.touched.name && !!props.errors?.name}
                      error={props.errors.name}
                      helpText="Rule name must contain 5-50 characters. Valid characters are a-z, A-Z, 0-9, hyphens, spaces, and underscores."
                    >
                      <EuiFieldText
                        isInvalid={props.touched.name && !!props.errors.name}
                        placeholder="Enter rule name"
                        data-test-subj={'rule_name_field'}
                        onChange={(e) => {
                          props.handleChange('name')(e);
                        }}
                        onBlur={props.handleBlur('name')}
                        value={props.values.name}
                      />
                    </EuiFormRow>
                  </EuiFlexItem>
                  <EuiFlexItem>
                    <EuiFormRow
                      label={
                        <EuiText size={'s'}>
                          <strong>Log type</strong>
                        </EuiText>
                      }
                      isInvalid={props.touched.logType && !!props.errors?.logType}
                      error={props.errors.logType}
                    >
                      <EuiComboBox
                        isInvalid={props.touched.logType && !!props.errors.logType}
                        placeholder="Select a log type"
                        data-test-subj={'rule_type_dropdown'}
                        options={ruleTypes.map(({ value, label }) => ({ value, label }))}
                        singleSelection={{ asPlainText: true }}
                        onChange={(e) => {
                          props.handleChange('logType')(e[0]?.value ? e[0].value : '');
                        }}
                        onBlur={props.handleBlur('logType')}
                        selectedOptions={
                          props.values.logType
                            ? [{ value: props.values.logType, label: props.values.logType }]
                            : []
                        }
                      />
                    </EuiFormRow>
                  </EuiFlexItem>
                </EuiFlexGroup>

                <EuiSpacer />

                <EuiFormRow
                  label={
                    <EuiText size={'s'}>
                      <strong>Description </strong>
                      <i>- optional</i>
                    </EuiText>
                  }
                  helpText="Description must contain 5-500 characters. Valid characters are a-z, A-Z, 0-9, hyphens, spaces, dots, commas, and underscores."
                  isInvalid={!!props.errors?.description}
                  error={props.errors.description}
                >
                  <EuiTextArea
                    data-test-subj={'rule_description_field'}
                    onChange={(e) => {
                      props.handleChange('description')(e.target.value);
                    }}
                    onBlur={props.handleBlur('description')}
                    value={props.values.description}
                  />
                </EuiFormRow>

                <EuiSpacer />

                <EuiFormRow
                  label={
                    <EuiText size={'s'}>
                      <strong>Detection</strong>
                    </EuiText>
                  }
                  isInvalid={props.touched.detection && !!props.errors?.detection}
                  error={props.errors.detection}
                >
                  <EuiCodeEditor
                    mode="yaml"
                    width="100%"
                    value={props.values.detection}
                    onChange={(value) => {
                      props.handleChange('detection')(value);
                    }}
                    onBlur={props.handleBlur('detection')}
                    data-test-subj={'rule_detection_field'}
                  />
                </EuiFormRow>
                <EuiSpacer />

                <EuiFormRow
                  label={
                    <EuiText size={'s'}>
                      <strong>Rule level</strong>
                    </EuiText>
                  }
                  isInvalid={props.touched.level && !!props.errors?.level}
                  error={props.errors.level}
                >
                  <EuiComboBox
                    isInvalid={props.touched.level && !!props.errors.level}
                    placeholder="Select a rule level"
                    data-test-subj={'rule_severity_dropdown'}
                    options={[
                      { value: 'critical', label: 'Critical' },
                      { value: 'high', label: 'High' },
                      { value: 'medium', label: 'Medium' },
                      { value: 'low', label: 'Low' },
                    ]}
                    singleSelection={{ asPlainText: true }}
                    onChange={(e) => {
                      props.handleChange('level')(e[0]?.value ? e[0].value : '');
                    }}
                    onBlur={props.handleBlur('level')}
                    selectedOptions={
                      props.values.level
                        ? [{ value: props.values.level, label: props.values.level }]
                        : []
                    }
                  />
                </EuiFormRow>

                <EuiSpacer />

                <RuleTagsComboBox
                  selectedOptions={props.values.tags}
                  onChange={(value) => {
                    const tags = value.map((option) => ({ label: option.label }));
                    props.setFieldValue('tags', tags);
                  }}
                  onCreateOption={(newTag) => {
                    props.setFieldValue('tags', [...props.values.tags, { label: newTag }]);
                  }}
                  onBlur={props.handleBlur('tags')}
                />

                <EuiSpacer />
                <FieldTextArray
                  name="references"
                  label={
                    <EuiText size={'s'}>
                      <strong>References </strong>
                      <i>- optional</i>
                    </EuiText>
                  }
                  addButtonName="Add another URL"
                  fields={props.values.references}
                  onFieldAdd={() => {
                    props.setFieldValue('references', [...props.values.references, '']);
                  }}
                  onFieldEdit={(value: string, index: number) => {
                    props.setFieldValue('references', [
                      ...props.values.references.slice(0, index),
                      value,
                      ...props.values.references.slice(index + 1),
                    ]);
                  }}
                  onFieldRemove={(index: number) => {
                    const newRefs = [...props.values.references];
                    newRefs.splice(index, 1);

                    props.setFieldValue('references', newRefs);
                  }}
                  data-test-subj={'rule_references_field'}
                />

                <FieldTextArray
                  name="false_positives"
                  label={
                    <EuiText size={'s'}>
                      <strong>False positive cases </strong>
                      <i>- optional</i>
                    </EuiText>
                  }
                  addButtonName="Add another case"
                  fields={props.values.falsePositives}
                  onFieldAdd={() => {
                    props.setFieldValue('falsePositives', [...props.values.falsePositives, '']);
                  }}
                  onFieldEdit={(value: string, index: number) => {
                    props.setFieldValue('falsePositives', [
                      ...props.values.falsePositives.slice(0, index),
                      value,
                      ...props.values.falsePositives.slice(index + 1),
                    ]);
                  }}
                  onFieldRemove={(index: number) => {
                    const newCases = [...props.values.falsePositives];
                    newCases.splice(index, 1);

                    props.setFieldValue('falsePositives', newCases);
                  }}
                  data-test-subj={'rule_falsePositives_field'}
                />

                <EuiFormRow
                  label={
                    <EuiText size={'s'}>
                      <strong>Author</strong>
                    </EuiText>
                  }
                  helpText="Author must contain 5-50 characters. Valid characters are a-z, A-Z, 0-9, hyphens, spaces, commas, and underscores."
                  isInvalid={props.touched.author && !!props.errors?.author}
                  error={props.errors.author}
                >
                  <EuiFieldText
                    isInvalid={props.touched.author && !!props.errors.author}
                    placeholder="Enter author name"
                    data-test-subj={'rule_author_field'}
                    onChange={(e) => {
                      props.handleChange('author')(e);
                    }}
                    onBlur={props.handleBlur('author')}
                    value={props.values.author}
                  />
                </EuiFormRow>

                <EuiSpacer />

                <EuiFormRow
                  label={
                    <EuiText size={'s'}>
                      <strong>Rule Status</strong>
                    </EuiText>
                  }
                  isInvalid={props.touched.status && !!props.errors?.status}
                  error={props.errors.status}
                >
                  <EuiComboBox
                    isInvalid={props.touched.status && !!props.errors.status}
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
                {mode === 'create' ? 'Create' : 'Save changes'}
              </EuiButton>
            </EuiFlexItem>
          </EuiFlexGroup>
        </Form>
      )}
    </Formik>
  );
};
