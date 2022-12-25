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
              <EuiFormRow label="Log type">
                <EuiComboBox
                  onKeyDown={(e) => e.stopPropagation()}
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

          <EuiFormRow label="Description" fullWidth>
            <EuiTextArea
              data-test-subj={'rule_description_field'}
              onChange={(e) => {
                props.setFieldValue('description', e.target.value);
                setRuleEditorFormState({ ...props.values, description: e.target.value });
              }}
              value={props.values.description}
            />
          </EuiFormRow>
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
