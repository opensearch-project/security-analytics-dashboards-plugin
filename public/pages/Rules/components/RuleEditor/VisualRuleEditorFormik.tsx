/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Formik, Form, FormikErrors, useFormikContext } from 'formik';
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
  EuiComboBoxOptionOption,
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
import { errorNotificationToast } from '../../../../utils/helpers';
import { ROUTES } from '../../../../utils/constants';

export interface VisualRuleEditorProps {
  ruleEditorFormState: RuleEditorFormState;
  setRuleEditorFormState: React.Dispatch<React.SetStateAction<RuleEditorFormState>>;
  history: RouteComponentProps['history'];
  notifications?: NotificationsStart;
}

export const VisualRuleEditor: React.FC<VisualRuleEditorProps> = ({
  ruleEditorFormState,
  setRuleEditorFormState,
  history,
  notifications,
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

        if (!values.logType) {
          errors.logType = 'Log type is required';
        }

        if (!values.detection) {
          errors.detection = 'Detection is required';
        }

        if (!values.level) {
          errors.level = 'Rule level is required';
        }

        return errors;
      }}
      onSubmit={async (values, { setSubmitting }) => {
        alert(JSON.stringify(values, null, 2));
        setSubmitting(false);
      }}
    >
      {(props) => (
        <Form>
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
                    props.handleChange(e);
                    setRuleEditorFormState({ ...props.values, name: e.target.value });
                  }}
                  onBlur={props.handleBlur}
                  value={props.values.name}
                  name={'name'}
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
                    props.setFieldValue('logType', e[0]?.value);
                    setRuleEditorFormState({ ...props.values, logType: e[0]?.value || '' });
                  }}
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

          <EuiFormRow label="Description - optional" fullWidth>
            <EuiTextArea
              data-test-subj={'rule_description_field'}
              onChange={(e) => {
                props.setFieldValue('description', e.target.value);
                setRuleEditorFormState({ ...props.values, description: e.target.value });
              }}
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
                props.setFieldValue('detection', value);
                setRuleEditorFormState({ ...props.values, detection: value });
              }}
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
                props.setFieldValue('level', e[0]?.value);
                setRuleEditorFormState({ ...props.values, level: e[0]?.value || '' });
              }}
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

          <EuiFlexGroup justifyContent="flexEnd">
            <EuiFlexItem grow={false}>
              <EuiButton onClick={() => history.replace(ROUTES.RULES)}>Cancel</EuiButton>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiButton type="submit" fill>
                Create
              </EuiButton>
            </EuiFlexItem>
          </EuiFlexGroup>
        </Form>
      )}
    </Formik>
  );
};

// const AutoToastNotification = ({ notifications }: { notifications?: NotificationsStart }) => {
//   const { submitCount, isValid } = useFormikContext();

//   useEffect(() => {
//     console.log(submitCount, isValid);
//     if (isValid) return;

//     errorNotificationToast(
//       notifications!,
//       'create',
//       'rule',
//       'Some fields are invalid. Fix all highlighted error(s) before continuing.'
//     );
//   }, [submitCount, isValid]);
//   return null;
// };
