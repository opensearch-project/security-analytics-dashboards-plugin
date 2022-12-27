/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
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
} from '@elastic/eui';
import { FieldTextArray } from './FieldTextArray';
import { ruleStatus, ruleTypes } from '../../utils/constants';
import {
  authorErrorString,
  AUTHOR_REGEX,
  descriptionErrorString,
  nameErrorString,
  validateDescription,
  validateName,
} from '../../../../utils/validation';
import { RuleEditorFormState } from './RuleEditorFormState';
import { FormSubmitionErrorToastNotification } from './FormSubmitionErrorToastNotification';

export interface VisualRuleEditorProps {
  ruleEditorFormState: RuleEditorFormState;
  setRuleEditorFormState: React.Dispatch<React.SetStateAction<RuleEditorFormState>>;
  notifications?: NotificationsStart;
  submit: () => void;
  cancel: () => void;
  mode: 'create' | 'edit';
}

export const VisualRuleEditor: React.FC<VisualRuleEditorProps> = ({
  ruleEditorFormState,
  setRuleEditorFormState,
  notifications,
  submit,
  cancel,
  mode,
}) => {
  return (
    <Formik
      initialValues={ruleEditorFormState}
      validate={(values) => {
        const errors: FormikErrors<RuleEditorFormState> = {};

        if (!values.name) {
          errors.name = 'Rule name is required';
        } else {
          if (!validateName(values.name)) {
            errors.name = nameErrorString;
          }
        }

        if (!validateDescription(values.description)) {
          errors.description = descriptionErrorString;
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
            errors.author = authorErrorString;
          }
        }

        if (!values.status) {
          errors.status = 'Rule status is required';
        }

        return errors;
      }}
      onSubmit={(values, { setSubmitting }) => {
        setSubmitting(false);
        submit();
      }}
    >
      {(props) => (
        <Form>
          <FormSubmitionErrorToastNotification notifications={notifications} />
          <EuiFlexGroup component="span">
            <EuiFlexItem grow={false} style={{ minWidth: 400 }}>
              <EuiFormRow
                label="Rule name"
                isInvalid={props.touched.name && !!props.errors?.name}
                error={props.errors.name}
              >
                <EuiFieldText
                  isInvalid={props.touched.name && !!props.errors.name}
                  placeholder="Enter rule name"
                  data-test-subj={'rule_name_field'}
                  onChange={(e) => {
                    props.handleChange('name')(e);
                    setRuleEditorFormState({ ...props.values, name: e.target.value });
                  }}
                  onBlur={props.handleBlur('name')}
                  value={props.values.name}
                />
              </EuiFormRow>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiFormRow
                label="Log type"
                isInvalid={props.touched.logType && !!props.errors?.logType}
                error={props.errors.logType}
              >
                <EuiComboBox
                  isInvalid={props.touched.logType && !!props.errors.logType}
                  placeholder="Select a log type"
                  data-test-subj={'rule_type_dropdown'}
                  options={ruleTypes.map((type: string) => ({ value: type, label: type }))}
                  singleSelection={{ asPlainText: true }}
                  onChange={(e) => {
                    props.handleChange('logType')(e[0]?.value ? e[0].value : '');
                    setRuleEditorFormState({ ...props.values, logType: e[0]?.value || '' });
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
            label="Description - optional"
            fullWidth
            isInvalid={!!props.errors?.description}
            error={props.errors.description}
          >
            <EuiTextArea
              data-test-subj={'rule_description_field'}
              onChange={(e) => {
                props.handleChange('description')(e.target.value);
                setRuleEditorFormState({ ...props.values, description: e.target.value });
              }}
              onBlur={props.handleBlur('description')}
              value={props.values.description}
            />
          </EuiFormRow>

          <EuiSpacer />

          <EuiFormRow
            label="Detection"
            isInvalid={props.touched.detection && !!props.errors?.detection}
            error={props.errors.detection}
          >
            <EuiCodeEditor
              mode="yaml"
              width="100%"
              value={ruleEditorFormState.detection}
              onChange={(value) => {
                props.handleChange('detection')(value);
                setRuleEditorFormState({ ...props.values, detection: value });
              }}
              onBlur={props.handleBlur('detection')}
              data-test-subj={'rule_detection_field'}
            />
          </EuiFormRow>
          <EuiSpacer />

          <EuiFormRow
            label="Rule level"
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
                setRuleEditorFormState({ ...props.values, level: e[0]?.value || '' });
              }}
              onBlur={props.handleBlur('level')}
              selectedOptions={
                props.values.level ? [{ value: props.values.level, label: props.values.level }] : []
              }
            />
          </EuiFormRow>

          <EuiSpacer />

          <EuiFormRow label="Tags - optional">
            <EuiComboBox
              placeholder="Select or create options"
              onChange={(value) => {
                const tags = value.map((option) => ({ label: option.label }));
                props.setFieldValue('tags', tags);
                setRuleEditorFormState({
                  ...props.values,
                  tags,
                });
              }}
              onCreateOption={(newTag) => {
                props.setFieldValue('tags', [...props.values.tags, { label: newTag }]);
                setRuleEditorFormState((prevState) => ({
                  ...prevState,
                  tags: [...prevState.tags, { label: newTag }],
                }));
              }}
              onBlur={props.handleBlur('tags')}
              data-test-subj={'rule_tags_dropdown'}
              selectedOptions={props.values.tags}
            />
          </EuiFormRow>

          <EuiSpacer />
          <FieldTextArray
            label="References - optional"
            addButtonName="Add another URL"
            fields={props.values.references}
            onFieldAdd={() => {
              props.setFieldValue('references', [...props.values.references, '']);
              setRuleEditorFormState((prevState) => ({
                ...prevState,
                references: [...prevState.references, ''],
              }));
            }}
            onFieldEdit={(value: string, index: number) => {
              props.setFieldValue('references', [
                ...props.values.references.slice(0, index),
                value,
                ...props.values.references.slice(index + 1),
              ]);
              setRuleEditorFormState((prevState) => ({
                ...prevState,
                references: [
                  ...prevState.references.slice(0, index),
                  value,
                  ...prevState.references.slice(index + 1),
                ],
              }));
            }}
            onFieldRemove={(index: number) => {
              const newRefs = [...props.values.references];
              newRefs.splice(index, 1);

              props.setFieldValue('references', newRefs);
              setRuleEditorFormState((prevState) => ({
                ...prevState,
                references: newRefs,
              }));
            }}
            data-test-subj={'rule_references_field'}
          />

          <FieldTextArray
            label="False positive cases - optional"
            addButtonName="Add another case"
            fields={props.values.falsePositives}
            onFieldAdd={() => {
              props.setFieldValue('falsePositives', [...props.values.falsePositives, '']);
              setRuleEditorFormState((prevState) => ({
                ...prevState,
                falsePositives: [...prevState.falsePositives, ''],
              }));
            }}
            onFieldEdit={(value: string, index: number) => {
              props.setFieldValue('falsePositives', [
                ...props.values.falsePositives.slice(0, index),
                value,
                ...props.values.falsePositives.slice(index + 1),
              ]);
              setRuleEditorFormState((prevState) => ({
                ...prevState,
                falsePositives: [
                  ...prevState.falsePositives.slice(0, index),
                  value,
                  ...prevState.falsePositives.slice(index + 1),
                ],
              }));
            }}
            onFieldRemove={(index: number) => {
              const newCases = [...props.values.falsePositives];
              newCases.splice(index, 1);

              props.setFieldValue('falsePositives', newCases);
              setRuleEditorFormState((prevState) => ({
                ...prevState,
                falsePositives: newCases,
              }));
            }}
            data-test-subj={'rule_falsePositives_field'}
          />

          <EuiFormRow
            label="Author"
            isInvalid={props.touched.author && !!props.errors?.author}
            error={props.errors.author}
          >
            <EuiFieldText
              isInvalid={props.touched.author && !!props.errors.author}
              placeholder="Enter author name"
              data-test-subj={'rule_author_field'}
              onChange={(e) => {
                props.handleChange('author')(e);
                setRuleEditorFormState({ ...props.values, author: e.target.value });
              }}
              onBlur={props.handleBlur('author')}
              value={props.values.author}
            />
          </EuiFormRow>

          <EuiSpacer />

          <EuiFormRow
            label="Rule Status"
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
                setRuleEditorFormState({ ...props.values, status: e[0]?.value || '' });
              }}
              onBlur={props.handleBlur('status')}
              selectedOptions={
                props.values.status
                  ? [{ value: props.values.status, label: props.values.status }]
                  : []
              }
            />
          </EuiFormRow>

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
