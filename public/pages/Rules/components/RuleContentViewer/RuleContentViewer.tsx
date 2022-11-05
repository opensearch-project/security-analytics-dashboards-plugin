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
  EuiFormRow,
  EuiLink,
  EuiModalBody,
  EuiSpacer,
  EuiText,
} from '@elastic/eui';
import { DEFAULT_EMPTY_DATA } from '../../../../utils/constants';
import React from 'react';
import { RuleItemInfoBase } from '../../models/types';

export interface RuleContentViewerProps {
  rule: RuleItemInfoBase;
}

export const RuleContentViewer: React.FC<RuleContentViewerProps> = ({
  rule: { prePackaged, _source: ruleData },
}) => {
  return (
    <EuiModalBody>
      <EuiFlexGroup justifyContent="flexEnd">
        <EuiFlexItem>
          <EuiFormLabel>Rule Name</EuiFormLabel>
          <EuiText data-test-subj={'rule_flyout_rule_name'}>{ruleData.title}</EuiText>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiFormLabel>Log Type</EuiFormLabel>
          <EuiText data-test-subj={'rule_flyout_rule_log_type'}>{ruleData.category}</EuiText>
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
          {prePackaged ? 'Sigma' : 'Custom'}
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
        <EuiFlexGroup direction="row" data-test-subj={'rule_flyout_rule_tags'}>
          {ruleData.tags.map((tag: any, i: number) => (
            <EuiFlexItem grow={false} key={i}>
              <EuiBadge color={'#DDD'}>{tag.value}</EuiBadge>
            </EuiFlexItem>
          ))}
        </EuiFlexGroup>
      ) : (
        <div>{DEFAULT_EMPTY_DATA}</div>
      )}

      <EuiSpacer />
      <EuiSpacer />

      <EuiFormLabel>References</EuiFormLabel>
      {ruleData.references.length > 0 ? (
        ruleData.references.map((reference: any, i: number) => (
          <div key={i}>
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

      <EuiFormRow label="Detection" fullWidth>
        <EuiCodeBlock language="yaml" data-test-subj={'rule_flyout_rule_detection'}>
          {ruleData.detection}
        </EuiCodeBlock>
      </EuiFormRow>
    </EuiModalBody>
  );
};
