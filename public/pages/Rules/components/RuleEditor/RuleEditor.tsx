/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserServices } from '../../../../models/interfaces';
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
  services: BrowserServices;
  title: string;
  FooterActions: React.FC<{ rule: Rule }>;
  rule?: Rule;
}

export const RuleEditor: React.FC<RuleEditorProps> = ({ title, rule, FooterActions }) => {
  const [name, setName] = useState(rule?.title || '');
  const onNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };
  const [nameError, setNameError] = useState('');
  const onNameBlur = (e: ChangeEvent<HTMLInputElement>) => {
    if (!validateName(e.target.value)) {
      setNameError(nameErrorString);
    } else {
      setNameError('');
    }
  };

  const [logType, setLogType] = useState(rule?.category || '');
  const onLogTypeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setLogType(e.target.value);
  };

  const [description, setDescription] = useState(rule?.description || '');
  const onDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
  };
  const [descriptionError, setDescriptionError] = useState('');
  const onDescriptionBlur = (e: ChangeEvent<HTMLTextAreaElement>) => {
    if (!validateDescription(e.target.value)) {
      setDescriptionError(descriptionErrorString);
    } else {
      setDescriptionError('');
    }
  };

  const [level, setLevel] = useState(rule?.level || '');
  const onLevelChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setLevel(e.target.value);
  };

  const [tags, setTags] = useState(rule?.tags.map((tag) => ({ label: tag.value })) || []);
  const onTagsChange = (selectedOptions: EuiComboBoxOptionOption<string>[]) => {
    setTags(selectedOptions.map((option) => ({ label: option.label })));
  };
  const onCreateTag = (value: string) => {
    setTags([...tags, { label: value }]);
  };

  const [author, setAuthor] = useState(rule?.author || '');
  const onAuthorChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAuthor(e.target.value);
  };
  const [authorError, setAuthorError] = useState('');
  const onAuthorBlur = (e: ChangeEvent<HTMLInputElement>) => {
    if (!validateName(e.target.value, AUTHOR_REGEX)) {
      setAuthorError(authorErrorString);
    } else {
      setAuthorError('');
    }
  };

  const [status, setRuleStatus] = useState(rule?.status || '');
  const onStatusChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setRuleStatus(e.target.value);
  };

  const [detection, setDetection] = useState(rule?.detection || '');
  const onDetectionChange = (value: string) => {
    setDetection(value);
  };

  const [references, setReferences] = useState<string[]>(
    rule?.references.map((ref) => ref.value) || ['']
  );
  const onReferenceAdd = () => {
    setReferences([...references, '']);
  };
  const onReferenceEdit = (value: string, index: number) => {
    setReferences([...references.slice(0, index), value, ...references.slice(index + 1)]);
  };
  const onReferenceRemove = (index: number) => {
    const newRefs = [...references];
    newRefs.splice(index, 1);
    setReferences(newRefs);
  };

  const [falsePositives, setFalsePositives] = useState<string[]>(
    rule?.false_positives.map((falsePositive) => falsePositive.value) || ['']
  );
  const onFalsePositiveAdd = () => {
    setFalsePositives([...falsePositives, '']);
  };
  const onFalsePositiveEdit = (value: string, index: number) => {
    setFalsePositives([
      ...falsePositives.slice(0, index),
      value,
      ...falsePositives.slice(index + 1),
    ]);
  };
  const onFalsePositiveRemove = (index: number) => {
    const newFalsePositives = [...falsePositives];
    newFalsePositives.splice(index, 1);
    setFalsePositives(newFalsePositives);
  };

  const getRule = (): Rule => {
    return {
      id: '25b9c01c-350d-4b95-bed1-836d04a4f324',
      category: logType,
      title: name,
      description: description,
      status: status,
      author: author,
      references: references.map((ref) => ({ value: ref })),
      tags: tags.map((tag) => ({ value: tag.label })),
      log_source: '',
      detection: detection,
      level: level,
      false_positives: falsePositives.map((falsePositive) => ({ value: falsePositive })),
    };
  };

  return (
    <>
      <ContentPanel title={title}>
        <EuiFlexGroup component="span">
          <EuiFlexItem grow={false} style={{ minWidth: 400 }}>
            <EuiFormRow label="Rule name" isInvalid={!!nameError} error={nameError}>
              <EuiFieldText
                placeholder="Enter rule name"
                value={name}
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
                value={logType}
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
          isInvalid={!!descriptionError}
          error={descriptionError}
        >
          <EuiTextArea
            value={description}
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
            value={detection}
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
            value={level}
            required
            data-test-subj={'rule_severity_dropdown'}
          />
        </EuiFormRow>

        <EuiSpacer />

        <EuiFormRow label="Tags">
          <EuiComboBox
            placeholder="Select or create options"
            selectedOptions={tags}
            onChange={onTagsChange}
            onCreateOption={onCreateTag}
            data-test-subj={'rule_tags_dropdown'}
          />
        </EuiFormRow>

        <EuiSpacer />
        <FieldTextArray
          label="References"
          addButtonName="Add another URL"
          fields={references}
          onFieldAdd={onReferenceAdd}
          onFieldEdit={onReferenceEdit}
          onFieldRemove={onReferenceRemove}
          data-test-subj={'rule_references_field'}
        />

        <FieldTextArray
          label="False positive cases"
          addButtonName="Add another case"
          fields={falsePositives}
          onFieldAdd={onFalsePositiveAdd}
          onFieldEdit={onFalsePositiveEdit}
          onFieldRemove={onFalsePositiveRemove}
        />

        <EuiFormRow label="Author" isInvalid={!!authorError} error={authorError}>
          <EuiFieldText
            placeholder="Enter author name"
            value={author}
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
            value={status}
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
