/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ruleTypes } from '../../../../../../lib/helpers';
import { Formik } from 'formik';
import * as Yup from 'yup';
import {
  EuiForm,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiFieldText,
  EuiSelect,
  EuiButton,
  EuiSpacer,
  EuiCodeBlock,
  EuiTextArea,
  EuiCodeEditor,
  EuiIcon,
  EuiComboBox,
} from '@elastic/eui';

export const ImportEdit = (props: any) => {
  const [selectedOptions, setSelected] = useState([]);
  const [options, setOptions] = useState<any>([]);
  const { importedTitle, importedDescription, importedLevel } = props.props;

  const onChange = (selectedOptions: any) => {
    setSelected(selectedOptions);
  };

  const onCreateOption = (searchValue: string, flattenedOptions = []) => {
    if (!searchValue) {
      return;
    }

    const normalizedSearchValue = searchValue.trim().toLowerCase();

    if (!normalizedSearchValue) {
      return;
    }

    const newOption = {
      label: searchValue,
    };

    // Create the option if it doesn't exist.
    if (
      flattenedOptions.findIndex(
        (option) => option.label.trim().toLowerCase() === normalizedSearchValue
      ) === -1
    ) {
      setOptions([...options, newOption]);
    }

    // Select the option.
    setSelected((prevSelected) => [...prevSelected, newOption]);
  };

  return (
    <Formik
      validateOnMount
      initialValues={{
        ruleName: importedTitle,
        ruleType: '',
        ruleDescription: importedDescription,
        ruleDetection: '',
        securityLevel: importedLevel,
        tag1: '',
        tag2: '',
        tag3: '',
        tag4: '',
      }}
      validationSchema={Yup.object({
        ruleName: Yup.string().required('Required'),
        ruleType: Yup.string().required(),
        ruleDescription: Yup.string().required('Required'),
        ruleDetection: Yup.string().required('Required'),
        securityLevel: Yup.string().required(),
        tag1: Yup.string(),
        tag2: Yup.string(),
        tag3: Yup.string(),
        tag4: Yup.string(),
      })}
      onSubmit={(values) => {
        console.log('SUBMIT', values);
      }}
    >
      {(Formikprops) => {
        return (
          <EuiForm component="form" onSubmit={Formikprops.handleSubmit}>
            <EuiSpacer />
            <EuiFlexGroup>
              <EuiFlexItem>
                <EuiFormRow
                  label="Rule name"
                  helpText={Formikprops.touched.ruleName && Formikprops.errors.ruleName}
                >
                  <EuiFieldText
                    name="ruleName"
                    value={Formikprops.values.ruleName}
                    onChange={Formikprops.handleChange}
                    onBlur={Formikprops.handleBlur}
                  />
                </EuiFormRow>
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiFormRow label="Rule type">
                  <EuiSelect
                    name="ruleType"
                    hasNoInitialSelection={true}
                    options={ruleTypes.map((type: object) => ({ value: type, text: type }))}
                    onChange={Formikprops.handleChange}
                    value={Formikprops.values.ruleType}
                  />
                </EuiFormRow>
              </EuiFlexItem>
            </EuiFlexGroup>
            <EuiSpacer />
            <EuiFormRow
              label="Description"
              fullWidth
              helpText={Formikprops.touched.ruleDescription && Formikprops.errors.ruleDescription}
            >
              <EuiTextArea
                name="ruleDescription"
                fullWidth
                value={Formikprops.values.ruleDescription}
                onChange={Formikprops.handleChange}
                onBlur={Formikprops.handleBlur}
              />
            </EuiFormRow>

            <EuiSpacer />

            <EuiTextArea
              fullWidth
              name="ruleDetection"
              value={Formikprops.values.ruleDetection}
              onChange={Formikprops.handleChange}
              onBlur={Formikprops.handleBlur}
            />
            <EuiSpacer />

            <EuiSpacer />

            <EuiFormRow
              label="Security level"
              helpText={Formikprops.touched.securityLevel && Formikprops.errors.securityLevel}
            >
              <EuiSelect
                name="securityLevel"
                hasNoInitialSelection={true}
                options={[
                  { value: 'Critical', text: 'Critical' },
                  { value: 'High', text: 'High' },
                  { value: 'Medium', text: 'Medium' },
                  { value: 'Low', text: 'Low' },
                ]}
                onChange={Formikprops.handleChange}
                value={Formikprops.values.securityLevel}
              />
            </EuiFormRow>

            <EuiSpacer />
            <EuiFormRow label="Tags">
              <EuiComboBox
                placeholder="Select or create options"
                selectedOptions={selectedOptions}
                onChange={onChange}
                onCreateOption={onCreateOption}
              />
            </EuiFormRow>

            <EuiSpacer />

            <EuiFlexGroup responsive={false} gutterSize="s" alignItems="center">
              <EuiFlexItem grow={false}>
                <EuiButton fill color="ghost">
                  Cancel
                </EuiButton>
              </EuiFlexItem>

              <EuiFlexItem grow={false}>
                <EuiButton
                  type="submit"
                  fill
                  disabled={!Boolean(Object.keys(Formikprops.errors).length === 0)}
                >
                  Save
                </EuiButton>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiForm>
        );
      }}
    </Formik>
  );
};
