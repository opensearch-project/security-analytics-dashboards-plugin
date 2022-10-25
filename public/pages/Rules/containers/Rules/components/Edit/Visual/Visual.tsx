/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useContext } from 'react';
import { ruleTypes, ruleStatus } from '../../../../../lib/helpers';
import { Formik } from 'formik';
import AceEditor from 'react-ace';
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
import { BrowserServices } from '../../../../../../../models/interfaces';
import { ServicesContext } from '../../../../../../../services';

export const Visual = (props: any) => {
  const services: BrowserServices | null = useContext(ServicesContext);
  const [selectedOptions, setSelected] = useState([]);
  const [references, setReferences] = useState<string[]>([]);
  const [options, setOptions] = useState<any>([]);
  const [falsePositiveRows, setFalsePositiveRows] = useState(0);
  const [ReferencesRows, setReferencesRows] = useState(0);

  console.log('PROPS', props.props);

  const onChange = (selectedOptions: any) => {
    setSelected(selectedOptions);
  };

  const onEditorChange = (Value: string) => {
    console.log('VALUE', Value);
  };

  const falsePositiveIncrease = () => {
    setFalsePositiveRows(falsePositiveRows + 1);
  };

  const falsePositiveDecrease = () => {
    setFalsePositiveRows(falsePositiveRows - 1);
  };

  const referencesIncrease = () => {
    setReferencesRows(ReferencesRows + 1);
  };

  const referencesDecrease = () => {
    setReferencesRows(ReferencesRows - 1);
  };

  let importedDetectionValue = `Title: ${props.props.title ? props.props.title : ''}
    - This is a title
    `;

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
        (option: any) => option.label.trim().toLowerCase() === normalizedSearchValue
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
        ruleName: props.props.title ? props.props.title : '',
        ruleType: props.props.product ? props.props.product : '',
        ruleDescription: props.props.description ? props.props.description : '',
        ruleAuthor: props.props.author ? props.props.author : '',
        ruleStatus: props.props.status ? props.props.status : '',
        ruleDetection: '',
        securityLevel: props.props.level ? props.props.level : '',
        references: [],
      }}
      validationSchema={Yup.object({
        ruleName: Yup.string().required('Required'),
        ruleType: Yup.string().required(),
        ruleDescription: Yup.string().required('Required'),
        ruleDetection: Yup.string().required('Required'),
        ruleAuthor: Yup.string(),
        ruleStatus: Yup.string(),
        securityLevel: Yup.string().required(),
        references: Yup.array(),
      })}
      onSubmit={(values) => {
        console.log('SUBMIT', values);
        services?.ruleService
          .createRule({
            title: 'Moriya Rootkit',
            description:
              "Detects the use of Moriya rootkit as described in the securelist's Operation TunnelSnake report",
            status: 'experimental',
            author: 'Bhabesh Raj',
            references: [
              { value: 'https://securelist.com/operation-tunnelsnake-and-moriya-rootkit/101831' },
            ],
            tags: [
              { value: 'attack.persistence' },
              { value: 'attack.privilege_escalation' },
              { value: 'attack.t1543.003' },
            ],
            log_source: 'system',
            detection: JSON.stringify({
              selection: {
                Provider_Name: 'Service Control Manager',
                EventID: 7045,
                ServiceName: 'ZzNetSvc',
              },
              condition: 'selection',
            }),
            level: 'critical',
            false_positives: [{ value: 'Unknown' }],
            category: 'windows',
          })
          .then((res) => {
            if (res.ok) {
              alert(res.response._id);
            } else {
              alert('error creating rule');
            }
          });
      }}
    >
      {(Formikprops) => {
        return (
          <EuiForm component="form" onSubmit={Formikprops.handleSubmit}>
            <EuiSpacer />
            <EuiFlexGroup alignItems="center">
              <EuiFlexItem>
                <EuiFormRow
                  label="Rule name"
                  helpText={Formikprops.touched.ruleName && Formikprops.errors.ruleName}
                >
                  <EuiFieldText
                    name="ruleName"
                    max-width="300px"
                    value={Formikprops.values.ruleName}
                    onChange={Formikprops.handleChange}
                    onBlur={Formikprops.handleBlur}
                  />
                </EuiFormRow>
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiFormRow label="Log type">
                  <EuiSelect
                    name="ruleType"
                    hasNoInitialSelection={true}
                    options={ruleTypes.map((type: string) => ({ value: type, text: type }))}
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

            <EuiFormRow
              label="Detection"
              fullWidth
              helpText={Formikprops.touched.ruleDetection && Formikprops.errors.ruleDetection}
            >
              <div>
                {props.props.type === 'new' && (
                  <AceEditor
                    name="ruleDetection"
                    mode="yaml"
                    theme="github"
                    onChange={onEditorChange}
                  />
                )}
                {props.props.type === 'import' && (
                  <AceEditor
                    name="ruleDetection"
                    mode="yaml"
                    theme="github"
                    readOnly
                    onChange={onEditorChange}
                    value={importedDetectionValue}
                  />
                )}
              </div>
            </EuiFormRow>

            <EuiSpacer />

            <EuiFormRow
              label="Rule level"
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
            <EuiFormRow
              label="References"
              helpText={Formikprops.touched.ruleName && Formikprops.errors.ruleName}
            >
              <EuiFieldText
                name="ruleName"
                value={Formikprops.values.ruleName}
                onChange={Formikprops.handleChange}
                onBlur={Formikprops.handleBlur}
              />
            </EuiFormRow>

            <EuiSpacer />

            {Array.from(Array(ReferencesRows)).map((index) => (
              <div>
                <div key={index} style={{ display: 'flex', flexDirection: 'row' }}>
                  <EuiFieldText
                    name="ruleName"
                    value={Formikprops.values.ruleName}
                    onChange={Formikprops.handleChange}
                    onBlur={Formikprops.handleBlur}
                  />
                  <EuiButton
                    fill
                    color="ghost"
                    onClick={() => referencesDecrease()}
                    style={{ marginLeft: '15px' }}
                  >
                    Remove
                  </EuiButton>
                </div>
                <EuiSpacer />
              </div>
            ))}

            <EuiButton fill color="ghost" onClick={() => referencesIncrease()}>
              Add another URL
            </EuiButton>

            <EuiSpacer />

            <EuiFormRow
              label="Falsepositives"
              helpText={Formikprops.touched.ruleName && Formikprops.errors.ruleName}
            >
              <EuiFieldText
                name="ruleName"
                value={Formikprops.values.ruleName}
                onChange={Formikprops.handleChange}
                onBlur={Formikprops.handleBlur}
              />
            </EuiFormRow>

            <EuiSpacer />

            {Array.from(Array(falsePositiveRows)).map((index) => (
              <div>
                <div key={index} style={{ display: 'flex', flexDirection: 'row' }}>
                  <EuiFieldText
                    name="ruleName"
                    value={Formikprops.values.ruleName}
                    onChange={Formikprops.handleChange}
                    onBlur={Formikprops.handleBlur}
                  />
                  <EuiButton
                    fill
                    color="ghost"
                    onClick={() => falsePositiveDecrease()}
                    style={{ marginLeft: '15px' }}
                  >
                    Remove
                  </EuiButton>
                </div>
                <EuiSpacer />
              </div>
            ))}

            <EuiButton fill color="ghost" onClick={() => falsePositiveIncrease()}>
              Add another case
            </EuiButton>

            <EuiSpacer />

            <EuiFormRow
              label="Author"
              helpText={Formikprops.touched.ruleAuthor && Formikprops.errors.ruleAuthor}
            >
              <EuiFieldText
                name="ruleAuthor"
                value={Formikprops.values.ruleAuthor}
                onChange={Formikprops.handleChange}
                onBlur={Formikprops.handleBlur}
              />
            </EuiFormRow>

            <EuiSpacer />

            <EuiFormRow
              label="Rule Status"
              helpText={Formikprops.touched.ruleStatus && Formikprops.errors.ruleStatus}
            >
              <EuiSelect
                name="ruleStatus"
                options={ruleStatus.map((status: string) => ({ value: status, text: status }))}
                onChange={Formikprops.handleChange}
                value={Formikprops.values.ruleStatus}
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
