/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useContext, Fragment } from 'react';
import { ruleTypes, ruleStatus } from '../../../../../lib/helpers';
import { Formik, Field, Form, ErrorMessage, FieldArray } from 'formik';
import AceEditor from 'react-ace';
import * as Yup from 'yup';
import {
  EuiGlobalToastList,
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
  EuiFormLabel,
} from '@elastic/eui';
import { BrowserServices } from '../../../../../../../models/interfaces';
import { ServicesContext } from '../../../../../../../services';
import './index.scss';

export const Visual = (props: any) => {
  const services: BrowserServices | null = useContext(ServicesContext);
  const [selectedOptions, setSelected] = useState([]);
  const [references, setReferences] = useState<string[]>([]);
  const [options, setOptions] = useState<any>([]);
  const [falsePositiveRows, setFalsePositiveRows] = useState(0);
  const [ReferencesRows, setReferencesRows] = useState(0);
  const [toastError, setToastError] = useState<string>('');

  const onChange = (selectedOptions: any) => {
    setSelected(selectedOptions);
  };

  const onEditorChange = (Value: string) => {
    console.log('VALUE', Value);
  };

  let importedDetectionValue = `
    `;

  const onCreateOption = (searchValue: string) => {
    if (!searchValue) {
      return;
    }

    const newOption = {
      label: searchValue,
    };

    setSelected((prevSelected) => [...prevSelected, newOption]);
  };

  let sample = [
    { value: 'attack.persistence' },
    { value: 'attack.privilege_escalation' },
    { value: 'attack.t1543.003' },
  ];

  const test = Array.from(selectedOptions.map(({ label }) => ({ value: label })));

  return (
    <div>
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
          references: [
            {
              value: '',
            },
          ],
          tags: test,
          falsepositives: [
            {
              value: '',
            },
          ],
        }}
        validationSchema={Yup.object({
          ruleName: Yup.string(),
          ruleType: Yup.string(),
          ruleDescription: Yup.string(),
          ruleDetection: Yup.string(),
          ruleAuthor: Yup.string(),
          ruleStatus: Yup.string(),
          securityLevel: Yup.string(),
          ruleReferences: Yup.array(),
          ruleFalsepositives: Yup.array(),
        })}
        onSubmit={(values) => {
          services?.ruleService
            .createRule({
              id: '25b9c01c-350d-4b95-bed1-836d04a4f324',
              title: values.ruleName,
              description: values.ruleDescription,
              status: values.ruleStatus,
              author: values.ruleAuthor,
              references: values.references,
              tags: test,
              log_source: values.ruleType,
              detection: JSON.stringify({
                selection: {
                  Provider_Name: 'Service Control Manager',
                  EventID: 7045,
                  ServiceName: 'ZzNetSvc',
                },
                condition: 'selection',
              }),
              level: values.securityLevel,
              false_positives: values.falsepositives,
              category: 'windows',
            })
            .then((res) => {
              if (res.ok) {
                console.log(res.response);
                alert(res.response._id);
              } else {
                // alert('error creating rule');
                setToastError(res.error);
              }
            });
        }}
      >
        {(Formikprops) => {
          return (
            <Form>
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
              <EuiFormLabel>References</EuiFormLabel>
              <FieldArray name="references">
                {({ insert, remove, push }) => (
                  <div>
                    {Formikprops.values.references.length > 0 &&
                      Formikprops.values.references.map((reference, index) => (
                        <div>
                          <div>
                            <Field name={`references.${index}.value`} type="text" />
                            {Formikprops.values.references.length > 1 && (
                              <EuiButton onClick={() => remove(index)}>Remove</EuiButton>
                            )}
                          </div>
                        </div>
                      ))}
                    <EuiButton
                      type="button"
                      className="secondary"
                      onClick={() => push({ value: '' })}
                    >
                      Add another URL
                    </EuiButton>
                  </div>
                )}
              </FieldArray>

              <EuiSpacer />

              <EuiFormLabel>Falsepositives</EuiFormLabel>
              <FieldArray name="falsepositives">
                {({ insert, remove, push }) => (
                  <div>
                    {Formikprops.values.falsepositives.length > 0 &&
                      Formikprops.values.falsepositives.map((falsepositive, index) => (
                        <div>
                          <Field name={`falsepositives.${index}.value`} type="text" />
                          {Formikprops.values.falsepositives.length > 1 && (
                            <EuiButton onClick={() => remove(index)}>Remove</EuiButton>
                          )}
                        </div>
                      ))}
                    <EuiButton
                      type="button"
                      className="secondary"
                      onClick={() => push({ value: '' })}
                    >
                      Add another case
                    </EuiButton>
                  </div>
                )}
              </FieldArray>

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
              <EuiButton
                type="submit"
                fill
                // disabled={!Boolean(Object.keys(Formikprops.errors).length === 0)}
              >
                Cancel
              </EuiButton>
              <EuiButton
                type="submit"
                fill
                // disabled={!Boolean(Object.keys(Formikprops.errors).length === 0)}
              >
                Create
              </EuiButton>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
};
