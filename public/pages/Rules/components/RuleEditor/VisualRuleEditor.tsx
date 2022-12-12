/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ChangeEvent, useState } from 'react';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiFieldText,
  EuiSelect,
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

export interface VisualRuleEditorProps {
  ruleEditorFormState: RuleEditorFormState;
  setRuleEditorFormState: React.Dispatch<React.SetStateAction<RuleEditorFormState>>;
}

export interface VisualEditorFormErrorsState {
  nameError: string | null;
  descriptionError: string | null;
  authorError: string | null;
}

export const VisualRuleEditor: React.FC<VisualRuleEditorProps> = ({
  ruleEditorFormState,
  setRuleEditorFormState,
}) => {
  const [visualEditorErrors, setVisualEditorErrors] = useState<VisualEditorFormErrorsState>({
    nameError: null,
    descriptionError: null,
    authorError: null,
  });

  const onNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value: name } = e.target;
    setRuleEditorFormState((prevState) => ({ ...prevState, name }));
  };
  const onNameBlur = (e: ChangeEvent<HTMLInputElement>) => {
    if (!validateName(e.target.value)) {
      setVisualEditorErrors((prevState) => ({ ...prevState, nameError: nameErrorString }));
    } else {
      setVisualEditorErrors((prevState) => ({ ...prevState, nameError: null }));
    }
  };

  const onLogTypeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const { value: logType } = e.target;
    setRuleEditorFormState((prevState) => ({ ...prevState, logType }));
  };

  const onDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const { value: description } = e.target;
    setRuleEditorFormState((prevState) => ({ ...prevState, description }));
  };
  const onDescriptionBlur = (e: ChangeEvent<HTMLTextAreaElement>) => {
    if (!validateDescription(e.target.value)) {
      setVisualEditorErrors((prevState) => ({
        ...prevState,
        descriptionError: descriptionErrorString,
      }));
    } else {
      setVisualEditorErrors((prevState) => ({ ...prevState, descriptionError: null }));
    }
  };

  const onLevelChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const { value: level } = e.target;
    setRuleEditorFormState((prevState) => ({ ...prevState, level }));
  };

  const onTagsChange = (selectedOptions: EuiComboBoxOptionOption<string>[]) => {
    const tags = selectedOptions.map((option) => ({ label: option.label }));
    setRuleEditorFormState((prevState) => ({ ...prevState, tags }));
  };
  const onCreateTag = (value: string) => {
    setRuleEditorFormState((prevState) => ({
      ...prevState,
      tags: [...prevState.tags, { label: value }],
    }));
  };

  const onAuthorChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value: author } = e.target;
    setRuleEditorFormState((prevState) => ({ ...prevState, author }));
  };

  const onAuthorBlur = (e: ChangeEvent<HTMLInputElement>) => {
    if (!validateName(e.target.value, AUTHOR_REGEX)) {
      setVisualEditorErrors((prevState) => ({ ...prevState, authorError: authorErrorString }));
    } else {
      setVisualEditorErrors((prevState) => ({ ...prevState, authorError: null }));
    }
  };

  const onStatusChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const { value: status } = e.target;
    setRuleEditorFormState((prevState) => ({ ...prevState, status }));
  };

  const onDetectionChange = (value: string) => {
    setRuleEditorFormState((prevState) => ({ ...prevState, detection: value }));
  };

  const onReferenceAdd = () => {
    setRuleEditorFormState((prevState) => ({
      ...prevState,
      references: [...prevState.references, ''],
    }));
  };
  const onReferenceEdit = (value: string, index: number) => {
    setRuleEditorFormState((prevState) => ({
      ...prevState,
      references: [
        ...prevState.references.slice(0, index),
        value,
        ...prevState.references.slice(index + 1),
      ],
    }));
  };
  const onReferenceRemove = (index: number) => {
    setRuleEditorFormState((prevState) => {
      const newRefs = [...prevState.references];
      newRefs.splice(index, 1);
      return {
        ...prevState,
        references: newRefs,
      };
    });
  };

  const onFalsePositiveAdd = () => {
    setRuleEditorFormState((prevState) => ({
      ...prevState,
      falsePositives: [...prevState.falsePositives, ''],
    }));
  };
  const onFalsePositiveEdit = (value: string, index: number) => {
    setRuleEditorFormState((prevState) => ({
      ...prevState,
      falsePositives: [
        ...prevState.falsePositives.slice(0, index),
        value,
        ...prevState.falsePositives.slice(index + 1),
      ],
    }));
  };
  const onFalsePositiveRemove = (index: number) => {
    setRuleEditorFormState((prevState) => {
      const newFalsePositives = [...prevState.falsePositives];
      newFalsePositives.splice(index, 1);
      return {
        ...prevState,
        falsePositives: newFalsePositives,
      };
    });
  };

  return (
    <>
      <EuiFlexGroup component="span">
        <EuiFlexItem grow={false} style={{ minWidth: 400 }}>
          <EuiFormRow
            label="Rule name"
            isInvalid={!!visualEditorErrors.nameError}
            error={visualEditorErrors.nameError}
          >
            <EuiFieldText
              placeholder="Enter rule name"
              value={ruleEditorFormState.name}
              onChange={onNameChange}
              onBlur={onNameBlur}
              required
              data-test-subj={'rule_name_field'}
            />
          </EuiFormRow>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiFormRow label="Log type">
            <EuiSelect
              hasNoInitialSelection={true}
              options={ruleTypes.map((type: string) => ({ value: type, text: type }))}
              onChange={onLogTypeChange}
              value={ruleEditorFormState.logType}
              required
              data-test-subj={'rule_type_dropdown'}
            />
          </EuiFormRow>
        </EuiFlexItem>
      </EuiFlexGroup>

      <EuiSpacer />

      <EuiFormRow
        label="Description"
        fullWidth
        isInvalid={!!visualEditorErrors.descriptionError}
        error={visualEditorErrors.descriptionError}
      >
        <EuiTextArea
          value={ruleEditorFormState.description}
          onChange={onDescriptionChange}
          onBlur={onDescriptionBlur}
          data-test-subj={'rule_description_field'}
        />
      </EuiFormRow>

      <EuiSpacer />

      <EuiFormRow label="Detection">
        <EuiCodeEditor
          mode="yaml"
          width="100%"
          value={ruleEditorFormState.detection}
          onChange={onDetectionChange}
          data-test-subj={'rule_detection_field'}
        />
      </EuiFormRow>
      <EuiSpacer />

      <EuiFormRow label="Rule level">
        <EuiSelect
          name="securityLevel"
          hasNoInitialSelection={true}
          options={[
            { value: 'critical', text: 'Critical' },
            { value: 'high', text: 'High' },
            { value: 'medium', text: 'Medium' },
            { value: 'low', text: 'Low' },
          ]}
          onChange={onLevelChange}
          value={ruleEditorFormState.level}
          required
          data-test-subj={'rule_severity_dropdown'}
        />
      </EuiFormRow>

      <EuiSpacer />

      <EuiFormRow label="Tags">
        <EuiComboBox
          placeholder="Select or create options"
          selectedOptions={ruleEditorFormState.tags}
          onChange={onTagsChange}
          onCreateOption={onCreateTag}
          data-test-subj={'rule_tags_dropdown'}
        />
      </EuiFormRow>

      <EuiSpacer />
      <FieldTextArray
        label="References"
        addButtonName="Add another URL"
        fields={ruleEditorFormState.references}
        onFieldAdd={onReferenceAdd}
        onFieldEdit={onReferenceEdit}
        onFieldRemove={onReferenceRemove}
        data-test-subj={'rule_references_field'}
      />

      <FieldTextArray
        label="False positive cases"
        addButtonName="Add another case"
        fields={ruleEditorFormState.falsePositives}
        onFieldAdd={onFalsePositiveAdd}
        onFieldEdit={onFalsePositiveEdit}
        onFieldRemove={onFalsePositiveRemove}
      />

      <EuiFormRow
        label="Author"
        isInvalid={!!visualEditorErrors.authorError}
        error={visualEditorErrors.authorError}
      >
        <EuiFieldText
          placeholder="Enter author name"
          value={ruleEditorFormState.author}
          onChange={onAuthorChange}
          onBlur={onAuthorBlur}
          required
          data-test-subj={'rule_author_field'}
        />
      </EuiFormRow>

      <EuiSpacer />

      <EuiFormRow label="Rule Status">
        <EuiSelect
          hasNoInitialSelection={true}
          options={ruleStatus.map((status: string) => ({ value: status, text: status }))}
          onChange={onStatusChange}
          value={ruleEditorFormState.status}
          required
          data-test-subj={'rule_status_dropdown'}
        />
      </EuiFormRow>

      <EuiSpacer />
    </>
  );
};
