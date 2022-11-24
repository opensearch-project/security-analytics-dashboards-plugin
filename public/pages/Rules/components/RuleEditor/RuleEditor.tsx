/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ChangeEvent, useState } from 'react';
import { ContentPanel } from '../../../../components/ContentPanel';
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
import { Rule } from '../../../../../models/interfaces';
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

export interface RuleEditorProps {
  title: string;
  FooterActions: React.FC<{ rule: Rule }>;
  rule?: Rule;
}

export interface VisualEditorFormState {
  id: string;
  log_source: string;

  logType: string;
  name: string;
  description: string;
  status: string;
  author: string;
  references: string[];
  tags: EuiComboBoxOptionOption<string>[];
  detection: string;
  level: string;
  falsePositives: string[];
}

export interface VisualEditorFormErrorsState {
  nameError: string | null;
  descriptionError: string | null;
  authorError: string | null;
}

const mapFormToRule = (formState: VisualEditorFormState): Rule => {
  return {
    id: formState.id,
    category: formState.logType,
    title: formState.name,
    description: formState.description,
    status: formState.status,
    author: formState.author,
    references: formState.references.map((ref) => ({ value: ref })),
    tags: formState.tags.map((tag) => ({ value: tag.label })),
    log_source: formState.log_source,
    detection: formState.detection,
    level: formState.level,
    false_positives: formState.falsePositives.map((falsePositive) => ({
      value: falsePositive,
    })),
  };
};

const mapRuleToForm = (rule: Rule): VisualEditorFormState => {
  return {
    id: rule.id,
    log_source: rule.log_source,
    logType: rule.category,
    name: rule.title,
    description: rule.description,
    status: rule.status,
    author: rule.author,
    references: rule.references.map((ref) => ref.value),
    tags: rule.tags.map((tag) => ({ label: tag.value })),
    detection: rule.detection,
    level: rule.level,
    falsePositives: rule.false_positives.map((falsePositive) => falsePositive.value),
  };
};

const newRuyleDefaultState: VisualEditorFormState = {
  id: '25b9c01c-350d-4b95-bed1-836d04a4f324',
  log_source: '',
  logType: '',
  name: '',
  description: '',
  status: '',
  author: '',
  references: [''],
  tags: [],
  detection: '',
  level: '',
  falsePositives: [''],
};

export const RuleEditor: React.FC<RuleEditorProps> = ({ title, rule, FooterActions }) => {
  const [visualEditorFormState, setVisualEditorFormState] = useState<VisualEditorFormState>(
    rule ? mapRuleToForm(rule) : newRuyleDefaultState
  );

  const [visualEditorErrors, setVisualEditorErrors] = useState<VisualEditorFormErrorsState>({
    nameError: null,
    descriptionError: null,
    authorError: null,
  });

  const getRule = (): Rule => {
    return mapFormToRule(visualEditorFormState);
  };

  const onNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value: name } = e.target;
    setVisualEditorFormState((prevState) => ({ ...prevState, name }));
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
    setVisualEditorFormState((prevState) => ({ ...prevState, logType }));
  };

  const onDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const { value: description } = e.target;
    setVisualEditorFormState((prevState) => ({ ...prevState, description }));
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
    setVisualEditorFormState((prevState) => ({ ...prevState, level }));
  };

  const onTagsChange = (selectedOptions: EuiComboBoxOptionOption<string>[]) => {
    const tags = selectedOptions.map((option) => ({ label: option.label }));
    setVisualEditorFormState((prevState) => ({ ...prevState, tags }));
  };
  const onCreateTag = (value: string) => {
    setVisualEditorFormState((prevState) => ({
      ...prevState,
      tags: [...prevState.tags, { label: value }],
    }));
  };

  const onAuthorChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value: author } = e.target;
    setVisualEditorFormState((prevState) => ({ ...prevState, author }));
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
    setVisualEditorFormState((prevState) => ({ ...prevState, status }));
  };

  const onDetectionChange = (value: string) => {
    setVisualEditorFormState((prevState) => ({ ...prevState, detection: value }));
  };

  const onReferenceAdd = () => {
    setVisualEditorFormState((prevState) => ({
      ...prevState,
      references: [...prevState.references, ''],
    }));
  };
  const onReferenceEdit = (value: string, index: number) => {
    setVisualEditorFormState((prevState) => ({
      ...prevState,
      references: [
        ...prevState.references.slice(0, index),
        value,
        ...prevState.references.slice(index + 1),
      ],
    }));
  };
  const onReferenceRemove = (index: number) => {
    setVisualEditorFormState((prevState) => {
      const newRefs = [...prevState.references];
      newRefs.splice(index, 1);
      return {
        ...prevState,
        references: newRefs,
      };
    });
  };

  const onFalsePositiveAdd = () => {
    setVisualEditorFormState((prevState) => ({
      ...prevState,
      falsePositives: [...prevState.falsePositives, ''],
    }));
  };
  const onFalsePositiveEdit = (value: string, index: number) => {
    setVisualEditorFormState((prevState) => ({
      ...prevState,
      falsePositives: [
        ...prevState.falsePositives.slice(0, index),
        value,
        ...prevState.falsePositives.slice(index + 1),
      ],
    }));
  };
  const onFalsePositiveRemove = (index: number) => {
    setVisualEditorFormState((prevState) => {
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
      <ContentPanel title={title}>
        <EuiFlexGroup component="span">
          <EuiFlexItem grow={false} style={{ minWidth: 400 }}>
            <EuiFormRow
              label="Rule name"
              isInvalid={!!visualEditorErrors.nameError}
              error={visualEditorErrors.nameError}
            >
              <EuiFieldText
                placeholder="Enter rule name"
                value={visualEditorFormState.name}
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
                value={visualEditorFormState.logType}
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
            value={visualEditorFormState.description}
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
            value={visualEditorFormState.detection}
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
            value={visualEditorFormState.level}
            required
            data-test-subj={'rule_severity_dropdown'}
          />
        </EuiFormRow>

        <EuiSpacer />

        <EuiFormRow label="Tags">
          <EuiComboBox
            placeholder="Select or create options"
            selectedOptions={visualEditorFormState.tags}
            onChange={onTagsChange}
            onCreateOption={onCreateTag}
            data-test-subj={'rule_tags_dropdown'}
          />
        </EuiFormRow>

        <EuiSpacer />
        <FieldTextArray
          label="References"
          addButtonName="Add another URL"
          fields={visualEditorFormState.references}
          onFieldAdd={onReferenceAdd}
          onFieldEdit={onReferenceEdit}
          onFieldRemove={onReferenceRemove}
          data-test-subj={'rule_references_field'}
        />

        <FieldTextArray
          label="False positive cases"
          addButtonName="Add another case"
          fields={visualEditorFormState.falsePositives}
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
            value={visualEditorFormState.author}
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
            value={visualEditorFormState.status}
            required
            data-test-subj={'rule_status_dropdown'}
          />
        </EuiFormRow>

        <EuiSpacer />
      </ContentPanel>
      <EuiSpacer size="xl" />
      <FooterActions rule={getRule()} />
    </>
  );
};
