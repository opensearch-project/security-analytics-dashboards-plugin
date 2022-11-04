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
          <EuiText>{ruleData.title}</EuiText>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiFormLabel>Log Type</EuiFormLabel>
          <EuiText>{ruleData.category}</EuiText>
        </EuiFlexItem>
      </EuiFlexGroup>

      <EuiSpacer />

      <EuiFormLabel>Description</EuiFormLabel>
      <EuiText>{ruleData.description || DEFAULT_EMPTY_DATA}</EuiText>
      <EuiSpacer />

      <EuiFlexGroup justifyContent="flexEnd">
        <EuiFlexItem>
          <EuiFormLabel>Last Updated</EuiFormLabel>
          {ruleData.last_update_time}
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiFormLabel>Author</EuiFormLabel>
          {ruleData.author}
        </EuiFlexItem>
      </EuiFlexGroup>

      <EuiSpacer />

      <EuiFlexGroup justifyContent="flexEnd">
        <EuiFlexItem>
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
        <EuiFlexItem>
          <EuiFormLabel>Rule level</EuiFormLabel>
          {ruleData.level}
        </EuiFlexItem>
      </EuiFlexGroup>

      <EuiSpacer />

      <EuiFormLabel>Tags</EuiFormLabel>
      {ruleData.tags.length > 0 ? (
        <EuiFlexGroup direction="row">
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
            <EuiLink href={reference.value} target="_blank" key={reference}>
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
      <div>
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
      <div>{ruleData.status}</div>

      <EuiSpacer />

      <EuiFormRow label="Detection" fullWidth>
        <EuiCodeBlock language="yaml">{ruleData.detection}</EuiCodeBlock>
      </EuiFormRow>
    </EuiModalBody>
  );
};
