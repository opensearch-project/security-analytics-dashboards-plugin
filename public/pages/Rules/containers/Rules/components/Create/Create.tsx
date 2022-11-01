/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useContext, useEffect } from 'react';
import { ruleTypes, ruleStatus } from '../../../../lib/helpers';
import { ContentPanel } from '../../../../../../components/ContentPanel';
import { Formik, Field, Form, ErrorMessage, FieldArray } from 'formik';
import { ROUTES } from '../../../../../../utils/constants';
import { RouteComponentProps } from 'react-router-dom';
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
import { BrowserServices } from '../../../../../../models/interfaces';
import { ServicesContext } from '../../../../../../services';
import './index.scss';

export const Create = ({ history }: RouteComponentProps) => {
  const historyData: any = history.location.state;
  const services: BrowserServices | null = useContext(ServicesContext);
  const [selectedOptions, setSelected] = useState([]);

  const onChange = (selectedOptions: any) => {
    setSelected(selectedOptions);
  };

  useEffect(() => {
    if (historyData != undefined) {
      let tags = [];
      for (let i = 0; i < historyData.rule.tags.length; i++) {
        tags.push({ label: historyData.rule.tags[i].value });
      }
      setSelected(tags);
    }
  }, []);

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

  return (
    <ContentPanel
      title={`${historyData ? historyData.mode : 'Create'} a rule`}
      actions={[
        <EuiIcon
          onClick={() => {
            history.push(ROUTES.RULES);
          }}
          type="cross"
        />,
      ]}
    >
      <Formik
        validateOnMount
        initialValues={{
          ruleName: historyData ? historyData.rule.title : '',
          ruleType: '',
          ruleDescription: historyData ? historyData.rule.description : '',
          ruleAuthor: historyData ? historyData.rule.author : '',
          ruleStatus: historyData ? historyData.rule.status : '',
          ruleDetection: historyData ? JSON.stringify(historyData.rule.queries) : '',
          securityLevel: historyData ? historyData.rule.level : '',
          references: historyData ? historyData.rule.references : '',
          tags: selectedOptions,
          falsepositives: historyData ? historyData.rule.falsepositives : '',
          status: historyData ? historyData.rule.status : status,
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
            .createRule({
              id: '',
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
                () => {
                  history.push(ROUTES.RULES);
                };
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

              <EuiFormRow label="Detection" fullWidth>
                <EuiCodeEditor
                  mode="yaml"
                  width="100%"
                  value={Formikprops.values.ruleDetection}
                ></EuiCodeEditor>
              </EuiFormRow>
              <EuiSpacer />
            </Form>
          );
        }}
      </Formik>
      <EuiFlexGroup direction="row" justifyContent="flexEnd">
        <div style={{ marginRight: '10px' }}>
          <EuiButton
            onClick={() => {
              history.push(ROUTES.RULES);
            }}
          >
            Cancel
          </EuiButton>
        </div>
        <div style={{ marginRight: '10px' }}>
          <EuiButton type="submit" fill form="editForm" onClick={() => onsubmit}>
            Create
          </EuiButton>
        </div>
      </EuiFlexGroup>
    </ContentPanel>
  );
};
