import React, { useState, Fragment, useContext } from 'react';
import {
  EuiFilePicker,
  EuiFlexGroup,
  EuiFlexItem,
  EuiText,
  EuiSpacer,
  EuiCodeBlock,
  EuiGlobalToastList,
  EuiForm,
  EuiFormRow,
  EuiFieldText,
  EuiSelect,
  EuiButton,
  EuiTextArea,
  EuiCodeEditor,
  EuiIcon,
  EuiComboBox,
  EuiFormLabel,
} from '@elastic/eui';
import { load } from 'js-yaml';
import { Formik, Field, Form, ErrorMessage, FieldArray } from 'formik';
import * as Yup from 'yup';
import { ruleTypes, ruleStatus } from '../../../../lib/helpers';
import { BrowserServices } from '../../../../../../models/interfaces';
import { ServicesContext } from '../../../../../../services';
import { ROUTES } from '../../../../../../utils/constants';
import { RouteComponentProps } from 'react-router-dom';

export const Import = ({ history }: RouteComponentProps) => {
  const services: BrowserServices | null = useContext(ServicesContext);
  const [files, setFiles] = useState([]);
  const [large, setLarge] = useState(true);
  const [userFiles, setUserFiles] = useState([]);
  const [fileErrors, setErrors] = useState('');
  const filePickerId = 'filepicker';
  const [importedTitle, setImportedTitle] = useState<string>('');
  const [importedDescription, setImportedDescription] = useState<string>('');
  const [importedLevel, setImportedLevel] = useState<string>('');
  const [importedProduct, setImportedProduct] = useState<string | undefined>('');
  const [importedStatus, setImportedStatus] = useState<string>('');
  const [importedAuthor, setImportedAuthor] = useState<string>('');
  const [importedReferences, setImportedReferences] = useState<string[]>([]);
  const [importedFalsepositives, setImportedFalsepositives] = useState<string[]>([]);
  const [importedDetection, setImportedDetection] = useState([]);
  const [selectedOptions, setSelected] = useState([]);

  const onChange = (files: any) => {
    let acceptedFileTyes: any = [];
    if (files[0].type === 'application/x-yaml') {
      acceptedFileTyes.push(files[0]);
    } else {
      setErrors('Only yaml files are accepted');
    }
    let file = files[0];
    let reader = new FileReader();
    reader.readAsText(file);
    let yamlFile;
    reader.onload = function () {
      let content: any = reader.result;
      yamlFile = load(content);
      setYamlContent(yamlFile);
    };
    setUserFiles(files.length > 0 ? Array.from(files) : []);
    setFiles(files.length > 0 ? acceptedFileTyes : []);
  };

  const setYamlContent = (yaml) => {
    setImportedTitle(yaml.title);
    setImportedDescription(yaml.description);
    setImportedLevel(yaml.level);
    setImportedAuthor(yaml.author);
    setImportedStatus(yaml.status);
    setReferences(yaml.references);
    setFalsepositives(yaml.falsepositives);
    setTags(yaml.tags);
    setImportedDetection(yaml.detection);
  };

  const TagChange = (selectedOptions: any) => {
    setSelected(selectedOptions);
  };

  const setTags = (yaml) => {
    let tags = [];
    for (let i = 0; i < yaml.length; i++) {
      tags.push({ label: yaml[i] });
    }
    setSelected(tags);
  };

  const setReferences = (yaml) => {
    let references = Array.from(importedReferences);
    for (let i = 0; i < yaml.length; i++) {
      references.push(yaml[i]);
    }
    setImportedReferences(references);
  };

  const setFalsepositives = (yaml) => {
    let falsepositives = Array.from(importedFalsepositives);
    for (let i = 0; i < yaml.length; i++) {
      falsepositives.push(yaml[i]);
    }
    setImportedFalsepositives(falsepositives);
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

  const onTagChange = (selectedOptions: any) => {
    setSelected(selectedOptions);
  };

  return (
    <Formik
      validateOnMount
      enableReinitialize
      initialValues={{
        ruleName: importedTitle,
        ruleType: '',
        ruleDescription: importedDescription,
        ruleAuthor: importedAuthor,
        ruleStatus: importedStatus,
        ruleDetection: JSON.stringify(importedDetection),
        securityLevel: importedLevel,
        references: importedReferences,
        tags: selectedOptions,
        falsepositives: importedFalsepositives,
        status: importedStatus,
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
            detection: values.ruleDetection,
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
          <Fragment>
            <EuiFlexGroup>
              <EuiFlexItem grow={2}>
                {files.length === 0 && (
                  <div>
                    <EuiFilePicker
                      id={filePickerId}
                      isInvalid={Boolean(fileErrors.length > 0 && userFiles.length > 0)}
                      fullWidth
                      initialPromptText="Select or drag yml file"
                      onChange={onChange}
                      display={large ? 'large' : 'default'}
                      aria-label="file picker"
                    />
                    {fileErrors.length > 0 && userFiles.length > 0 && (
                      <div>Errors: {fileErrors}</div>
                    )}
                  </div>
                )}
              </EuiFlexItem>
            </EuiFlexGroup>
            {files.length > 0 && (
              <Form id="importForm">
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
                  helpText={
                    Formikprops.touched.ruleDescription && Formikprops.errors.ruleDescription
                  }
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
                    onChange={TagChange}
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
                              <Field
                                name={`references.${index}.value`}
                                type="text"
                                value={reference}
                              />
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
                            <Field
                              name={`falsepositives.${index}.value`}
                              type="text"
                              value={falsepositive}
                            />
                            {Formikprops.values.falsepositives.length > 1 && (
                              <EuiButton onClick={() => remove(index)}>Remove</EuiButton>
                            )}
                          </div>
                        ))}
                      <EuiSpacer />
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
                  <EuiCodeEditor
                    mode="yaml"
                    width="100%"
                    value={Formikprops.values.ruleDetection}
                  ></EuiCodeEditor>
                </EuiFormRow>
                <EuiSpacer />
                <EuiFlexGroup direction="row" justifyContent="flexEnd">
                  <div style={{ marginRight: '10px' }}>
                    <EuiButton type="submit" fill form="importForm" onClick={() => onsubmit}>
                      Import
                    </EuiButton>
                  </div>
                </EuiFlexGroup>
              </Form>
            )}
          </Fragment>
        );
      }}
    </Formik>
  );
};
