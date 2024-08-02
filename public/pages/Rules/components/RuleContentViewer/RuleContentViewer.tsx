/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiBadge,
  EuiCodeBlock,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormLabel,
  EuiCompressedFormRow,
  EuiLink,
  EuiModalBody,
  EuiSpacer,
  EuiText,
  EuiButtonGroup,
} from '@elastic/eui';
import { DEFAULT_EMPTY_DATA } from '../../../../utils/constants';
import React, { useState } from 'react';
import { RuleContentYamlViewer } from './RuleContentYamlViewer';
import { RuleItemInfoBase } from '../../../../../types';
import { getLogTypeLabel } from '../../../LogTypes/utils/helpers';

export interface RuleContentViewerProps {
  rule: RuleItemInfoBase;
}

const editorTypes = [
  {
    id: 'visual',
    label: 'Visual',
  },
  {
    id: 'yaml',
    label: 'YAML',
  },
];

export const RuleContentViewer: React.FC<RuleContentViewerProps> = ({
  rule: { prePackaged, _source: ruleData, _id: ruleId },
}) => {
  if (!ruleData.id) {
    ruleData.id = ruleId;
  }
  const [selectedEditorType, setSelectedEditorType] = useState('visual');

  const onEditorTypeChange = (optionId: string) => {
    setSelectedEditorType(optionId);
  };

  return (
    <EuiModalBody>
      <EuiButtonGroup
        data-test-subj="change-editor-type"
        legend="This is editor type selector"
        options={editorTypes}
        idSelected={selectedEditorType}
        onChange={(id) => onEditorTypeChange(id)}
      />
      <EuiSpacer size="xl" />
      {selectedEditorType === 'visual' && (
        <>
          <EuiFlexGroup justifyContent="flexEnd">
            <EuiFlexItem>
              <EuiFormLabel>Rule Name</EuiFormLabel>
              <EuiText data-test-subj={'rule_flyout_rule_name'}>{ruleData.title}</EuiText>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiFormLabel>Log Type</EuiFormLabel>
              <EuiText data-test-subj={'rule_flyout_rule_log_type'}>
                {getLogTypeLabel(ruleData.category)}
              </EuiText>
            </EuiFlexItem>
          </EuiFlexGroup>

          <EuiSpacer />

          <EuiFormLabel>Description</EuiFormLabel>
          <EuiText data-test-subj={'rule_flyout_rule_description'}>
            {ruleData.description || DEFAULT_EMPTY_DATA}
          </EuiText>
          <EuiSpacer />

          <EuiFlexGroup justifyContent="flexEnd">
            <EuiFlexItem>
              <EuiFormLabel>Last Updated</EuiFormLabel>
              {ruleData.last_update_time}
            </EuiFlexItem>
            <EuiFlexItem data-test-subj={'rule_flyout_rule_author'}>
              <EuiFormLabel>Author</EuiFormLabel>
              {ruleData.author}
            </EuiFlexItem>
          </EuiFlexGroup>

          <EuiSpacer />

          <EuiFlexGroup justifyContent="flexEnd">
            <EuiFlexItem data-test-subj={'rule_flyout_rule_source'}>
              <EuiFormLabel>Source</EuiFormLabel>
              {prePackaged ? 'Standard' : 'Custom'}
            </EuiFlexItem>
            {prePackaged ? (
              <EuiFlexItem>
                <EuiFormLabel>License</EuiFormLabel>
                <EuiLink
                  target={'_blank'}
                  href={'https://github.com/SigmaHQ/sigma/blob/master/LICENSE.Detection.Rules.md'}
                >
                  Detection Rule License (DLR)
                </EuiLink>
              </EuiFlexItem>
            ) : null}
          </EuiFlexGroup>

          <EuiSpacer />

          <EuiFlexGroup justifyContent="flexEnd">
            <EuiFlexItem data-test-subj={'rule_flyout_rule_severity'}>
              <EuiFormLabel>Rule level</EuiFormLabel>
              {ruleData.level}
            </EuiFlexItem>
          </EuiFlexGroup>

          <EuiSpacer />

          <EuiFormLabel>Tags</EuiFormLabel>
          {ruleData.tags.length > 0 ? (
            <EuiFlexGroup
              direction="row"
              wrap
              gutterSize="s"
              data-test-subj={'rule_flyout_rule_tags'}
            >
              {ruleData.tags.map((tag: { value: string }, i: number) => {
                const isLinkable = !!tag.value.match(/attack\.t[0-9]+/);
                let tagComponent: React.ReactNode = tag.value;

                if (isLinkable) {
                  const link = `https://attack.mitre.org/techniques/${tag.value
                    .split('.')
                    .slice(1)
                    .join('/')
                    .toUpperCase()}`;
                  tagComponent = (
                    <EuiLink href={link} target="_blank">
                      {tag.value}
                    </EuiLink>
                  );
                }

                return (
                  <EuiFlexItem grow={false} key={i}>
                    <EuiBadge color={'#DDD'}>{tagComponent}</EuiBadge>
                  </EuiFlexItem>
                );
              })}
            </EuiFlexGroup>
          ) : (
            <div>{DEFAULT_EMPTY_DATA}</div>
          )}

          <EuiSpacer />
          <EuiSpacer />

          <EuiFormLabel>References</EuiFormLabel>
          {ruleData.references.length > 0 ? (
            ruleData.references.map((reference: any, i: number) => (
              <div key={i} className="eui-textTruncate">
                <EuiLink
                  href={reference.value}
                  target="_blank"
                  key={reference}
                  data-test-subj={'rule_flyout_rule_references'}
                >
                  {reference.value}
                </EuiLink>
                <EuiSpacer />
              </div>
            ))
          ) : (
            <div>{DEFAULT_EMPTY_DATA}</div>
          )}

          <EuiSpacer />

          <EuiFormLabel>False positive cases</EuiFormLabel>
          <div data-test-subj={'rule_flyout_rule_false_positives'}>
            {ruleData.false_positives.length > 0 ? (
              ruleData.false_positives.map((falsepositive: any, i: number) => (
                <div key={i}>
                  {falsepositive.value}
                  <EuiSpacer />
                </div>
              ))
            ) : (
              <div>{DEFAULT_EMPTY_DATA}</div>
            )}
          </div>

          <EuiSpacer />

          <EuiFormLabel>Rule Status</EuiFormLabel>
          <div data-test-subj={'rule_flyout_rule_status'}>{ruleData.status}</div>

          <EuiSpacer />

          <EuiCompressedFormRow label="Detection" fullWidth>
            <EuiCodeBlock language="yaml" data-test-subj={'rule_flyout_rule_detection'}>
              {ruleData.detection}
            </EuiCodeBlock>
          </EuiCompressedFormRow>
        </>
      )}
      {selectedEditorType === 'yaml' && (
        <EuiCompressedFormRow label="Rule" fullWidth>
          <RuleContentYamlViewer rule={ruleData} />
        </EuiCompressedFormRow>
      )}
    </EuiModalBody>
  );
};
