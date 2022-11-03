/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useContext, useEffect } from 'react';
import { ruleTypes, ruleStatus } from '../../../../../lib/helpers';
import { Formik, Field, Form, ErrorMessage, FieldArray } from 'formik';
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

  console.log('PROPS', props);
  const onChange = (selectedOptions: any) => {
    setSelected(selectedOptions);
  };

  let ruleTags = Array.from(selectedOptions.map(({ label }) => ({ value: label })));

  const onCreateOption = (searchValue: string) => {
    if (!searchValue) {
      return;
    }
    const newOption = {
      label: searchValue,
    };
    setSelected((prevSelected) => [...prevSelected, newOption]);
  };

  let initialValues;

  if (!props.props.editProps) {
    initialValues = {
      ruleName: '',
      ruleType: '',
      ruleDescription: '',
      ruleAuthor: '',
      ruleStatus: '',
      ruleDetection: '',
      securityLevel: '',
      references: [
        {
          value: '',
        },
      ],
      tags: ruleTags,
      falsepositives: [
        {
          value: '',
        },
      ],
    };
  }

  let detectionValue: string;

  if (props.props.editProps) {
    detectionValue = `${props.props.editProps.rule.queries.map((query, i) => `${query.value}`)}`;
    initialValues = {
      ruleName: props.props.editProps.rule.title,
      ruleType: props.props.editProps.rule.category,
      ruleDescription: props.props.editProps.rule.description,
      ruleAuthor: props.props.editProps.rule.author,
      ruleStatus: props.props.editProps.rule.status,
      ruleDetection: props.props.editProps.rule.queries,
      securityLevel: props.props.editProps.rule.level,
      references: props.props.editProps.rule.references,
      tags: ruleTags,
      falsepositives: props.props.editProps.rule.falsepositives,
      status: props.props.editProps.rule.status,
    };
  }

  return (
    <div>
      <Formik
        validateOnMount
        initialValues={{
          ruleName: '',
          ruleType: '',
          ruleDescription: '',
          ruleAuthor: '',
          ruleStatus: '',
          ruleDetection: '',
          securityLevel: '',
          references: '',
          tags: '',
          falsepositives: '',
          status: '',
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
          console.log('Submit', values);
          services?.ruleService
            .updateRule({
              id: '25b9c01c-350d-4b95-bed1-836d04a4f324',
              title: values.ruleName,
              description: values.ruleDescription,
              status: values.ruleStatus,
              author: values.ruleAuthor,
              references: values.references,
              tags: ruleTags,
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
              category: values.category,
            })
            .then((res) => {
              if (res.ok) {
                console.log(res.response);
              } else {
                alert('error creating rule');
              }
            });
        }}
      >
        {(Formikprops) => {
          return (
            <Form id="editForm">
              <EuiSpacer />
              <EuiFlexGroup component="span">
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
                helpText={Formikprops.touched.ruleDescription && Formikprops.errors.ruleDescription}
              >
                <EuiTextArea
                  name="ruleDescription"
                  value={Formikprops.values.ruleDescription}
                  onChange={Formikprops.handleChange}
                  onBlur={Formikprops.handleBlur}
                />
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
                    { value: 'critical', text: 'Critical' },
                    { value: 'high', text: 'High' },
                    { value: 'medium', text: 'Medium' },
                    { value: 'low', text: 'Low' },
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
                        <div key={index}>
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
                        <div key={index}>
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

              <EuiSpacer />

              <EuiFormRow
                label="Detection"
                fullWidth
                // helpText={Formikprops.touched.ruleDetection && Formikprops.errors.ruleDetection}
              >
                <EuiCodeEditor mode="yaml" width="100%" value={detectionValue}></EuiCodeEditor>
              </EuiFormRow>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
};
