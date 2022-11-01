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

export const Import = () => {
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
    setUserFiles(files.length > 0 ? Array.from(files) : []);
    let acceptedFileTyes: any = [];
    if (files[0].type === 'application/x-yaml') {
      acceptedFileTyes.push(files[0]);
    } else {
      setErrors('Only yaml files are accepted');
    }
    setFiles(files.length > 0 ? acceptedFileTyes : []);
    let file = files[0];
    let reader = new FileReader();
    reader.readAsText(file);
    let yamlFile;
    reader.onload = function () {
      let content: any = reader.result;
      yamlFile = load(content);
      setYamlContent(yamlFile);
    };
  };

  const setYamlContent = (yaml) => {
    console.log(Object.entries(yaml.detection));
    setImportedTitle(yaml.title);
    setImportedDescription(yaml.description);
    setImportedLevel(yaml.level);
    setImportedAuthor(yaml.author);
    setImportedStatus(yaml.status);
    setReferences(yaml.references);
    setFalsepositives(yaml.falsepositives);
    setTags(yaml.tags);
    setImportedDetection(Object.entries(yaml.detection));
    console.log('ID', importedDetection);
  };

  const setTags = (yaml) => {
    let tags = [];
    for (let i = 0; i < yaml.length; i++) {
      tags.push({ label: yaml[i] });
    }
    setSelected(tags);
  };

  const addReference = () => {
    let references = Array.from(importedReferences);
    references.push('');
    setImportedReferences(references);
  };

  const setReferences = (yaml) => {
    let references = Array.from(importedReferences);
    for (let i = 0; i < yaml.length; i++) {
      references.push(yaml[i]);
    }
    setImportedReferences(references);
  };

  const removeReference = (reference) => {
    let references = Array.from(importedReferences);
    let index = references.indexOf(reference);
    if (index !== -1) {
      references.splice(index, 1);
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

  const addFalsepositive = () => {
    let falsepositives = Array.from(importedFalsepositives);
    falsepositives.push('');
    setImportedFalsepositives(falsepositives);
  };

  const removeFalsepositives = (falsepositive) => {
    let falsepositives = Array.from(importedFalsepositives);
    let index = falsepositives.indexOf(falsepositive);
    if (index !== -1) {
      falsepositives.splice(index, 1);
    }
    setImportedFalsepositives(falsepositives);
  };

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
              {fileErrors.length > 0 && userFiles.length > 0 && <div>Errors: {fileErrors}</div>}
            </div>
          )}
        </EuiFlexItem>
      </EuiFlexGroup>
      {files.length > 0 && (
        <EuiForm component="form">
          <EuiFlexGroup component="span">
            <EuiFlexItem>
              <EuiFormRow label="Rule name">
                <EuiFieldText
                  name="ruleName"
                  max-width="300px"
                  value={importedTitle}
                  onChange={(e) => setImportedTitle(e.target.value)}
                />
              </EuiFormRow>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiFormRow label="Log type">
                <EuiSelect
                  name="ruleType"
                  hasNoInitialSelection={true}
                  options={ruleTypes.map((type: string) => ({ value: type, text: type }))}
                />
              </EuiFormRow>
            </EuiFlexItem>
          </EuiFlexGroup>

          <EuiSpacer />

          <EuiFormRow label="Description">
            <EuiTextArea
              name="ruleDescription"
              value={importedDescription}
              onChange={(e) => setImportedDescription(e.target.value)}
            />
          </EuiFormRow>

          <EuiSpacer />

          <EuiFormRow label="Rule level">
            <EuiSelect
              name="securityLevel"
              hasNoInitialSelection={true}
              options={[
                { value: 'Critical', text: 'Critical' },
                { value: 'High', text: 'High' },
                { value: 'Medium', text: 'Medium' },
                { value: 'Low', text: 'Low' },
              ]}
              value={importedLevel}
              onChange={(e) => setImportedLevel(e.target.value)}
            />
          </EuiFormRow>

          <EuiSpacer />

          <EuiFormRow label="Tags">
            <EuiComboBox
              placeholder="Select or create options"
              selectedOptions={selectedOptions}
              onChange={onTagChange}
              onCreateOption={onCreateOption}
            />
          </EuiFormRow>

          <EuiSpacer />
          <EuiFormLabel>References</EuiFormLabel>
          <div>
            {importedReferences.length > 0 &&
              importedReferences.map((reference, index) => (
                <div key={index}>
                  <EuiFlexGroup>
                    <EuiFlexItem>
                      <EuiFieldText
                        name="reference"
                        max-width="300px"
                        value={reference}
                        onChange={(e) => console.log(e.target.value)}
                      />
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiButton onClick={() => removeReference(reference)}>Remove</EuiButton>
                    </EuiFlexItem>
                  </EuiFlexGroup>
                </div>
              ))}
            <EuiSpacer />
            <EuiButton
              type="button"
              className="secondary"
              onClick={() => addReference()}
              disabled={importedReferences.includes('')}
            >
              Add another URL
            </EuiButton>
          </div>
          <EuiSpacer />

          <EuiFormLabel>Falsepositives</EuiFormLabel>
          <div>
            {importedFalsepositives.length > 0 &&
              importedFalsepositives.map((falsepositive, index) => (
                <div key={index}>
                  <EuiFlexGroup>
                    <EuiFlexItem>
                      <EuiFieldText
                        name="falsepositive"
                        max-width="300px"
                        value={falsepositive}
                        onChange={(e) => setFalsepositives(falsepositive)}
                      />
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiButton onClick={() => removeFalsepositives(falsepositive)}>
                        Remove
                      </EuiButton>
                    </EuiFlexItem>
                  </EuiFlexGroup>
                </div>
              ))}
            <EuiSpacer />
            <EuiButton type="button" className="secondary" onClick={() => addFalsepositive()}>
              Add another Case
            </EuiButton>
          </div>

          <EuiSpacer />

          <EuiFormRow label="Author">
            <EuiFieldText
              name="ruleAuthor"
              value={importedAuthor}
              onChange={(e) => setImportedAuthor(e.target.value)}
            />
          </EuiFormRow>

          <EuiSpacer />

          <EuiFormRow label="Rule Status">
            <EuiSelect
              name="ruleStatus"
              hasNoInitialSelection={true}
              options={[
                { value: 'select', text: 'Select a security level' },
                { value: 'experimental', text: 'Experimental' },
                { value: 'test', text: 'test' },
                { value: 'stable', text: 'stable' },
              ]}
              value={importedStatus}
              onChange={(e) => setImportedStatus(e.target.value)}
            />
          </EuiFormRow>
          <EuiSpacer />

          <EuiFormRow label="Detection" fullWidth>
            <EuiCodeEditor mode="yaml" width="100%" value={''}></EuiCodeEditor>
          </EuiFormRow>

          <EuiButton type="submit" fill>
            Save form
          </EuiButton>
        </EuiForm>
      )}
    </Fragment>
  );
};
