/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  EuiBadge,
  EuiButtonGroup,
  EuiCodeBlock,
  EuiCompressedFormRow,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormLabel,
  EuiHealth,
  EuiLink,
  EuiModalBody,
  EuiSpacer,
  EuiText,
} from '@elastic/eui';
import React, { useState } from 'react';
import { DEFAULT_EMPTY_DATA } from '../../../../utils/constants';
import { RuleItemInfoBase } from '../../../../../types';
import { getLogTypeLabel } from '../../../LogTypes/utils/helpers';
import { RuleContentYamlViewer } from './RuleContentYamlViewer';

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
          <EuiFlexGroup>
            <EuiFlexItem>
              <EuiFormLabel>Rule Name</EuiFormLabel>
              <EuiText data-test-subj={'rule_flyout_rule_name'} size="s">
                {ruleData.title}
              </EuiText>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiFormLabel>Integration</EuiFormLabel>
              <EuiText data-test-subj={'rule_flyout_rule_log_type'} size="s">
                {getLogTypeLabel(ruleData.category)}
              </EuiText>
            </EuiFlexItem>
          </EuiFlexGroup>

          <EuiSpacer />

          <EuiFlexGroup>
            <EuiFlexItem>
              <EuiFormLabel>Description</EuiFormLabel>
              <EuiText data-test-subj={'rule_flyout_rule_description'} size="s">
                {ruleData.description || DEFAULT_EMPTY_DATA}
              </EuiText>
            </EuiFlexItem>
            <EuiFlexItem data-test-subj={'rule_flyout_rule_author'}>
              <EuiFormLabel>Author</EuiFormLabel>
              <EuiText size="s">{ruleData.author}</EuiText>
            </EuiFlexItem>
          </EuiFlexGroup>

          <EuiSpacer />

          <EuiFlexGroup>
            <EuiFlexItem>
              <EuiFormLabel>Documentation</EuiFormLabel>
              <EuiText size="s" data-test-subj={'rule_flyout_rule_documentation'}>
                {ruleData.metadata?.documentation || DEFAULT_EMPTY_DATA}
              </EuiText>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiFormLabel>Supports</EuiFormLabel>
              <div data-test-subj={'rule_flyout_rule_supports'}>
                {ruleData.metadata?.supports?.length ? (
                  <EuiFlexGroup
                    direction="row"
                    wrap
                    gutterSize="s"
                    data-test-subj={'rule_flyout_rule_supports_list'}
                  >
                    {ruleData.metadata.supports.map((support: string, i: number) => (
                      <EuiFlexItem grow={false} key={i}>
                        <EuiBadge color={'#DDD'}>{support}</EuiBadge>
                      </EuiFlexItem>
                    ))}
                  </EuiFlexGroup>
                ) : (
                  <div>{DEFAULT_EMPTY_DATA}</div>
                )}
              </div>
            </EuiFlexItem>
          </EuiFlexGroup>

          <EuiSpacer />

          <EuiFlexGroup>
            <EuiFlexItem data-test-subj={'rule_flyout_rule_source'}>
              <EuiFormLabel>Source</EuiFormLabel>
              <EuiText size="s">{prePackaged ? 'Standard' : 'Custom'}</EuiText>
            </EuiFlexItem>
            <EuiFlexItem data-test-subj={'rule_flyout_rule_severity'}>
              <EuiFormLabel>Rule level</EuiFormLabel>
              <EuiText size="s">{ruleData.level}</EuiText>
            </EuiFlexItem>
          </EuiFlexGroup>

          <EuiSpacer />

          <EuiFlexGroup>
            <EuiFlexItem>
              <EuiFormLabel>Rule Status</EuiFormLabel>
              <div data-test-subj={'rule_flyout_rule_status'}>
                <EuiText size="s">{ruleData.status}</EuiText>
              </div>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiFormLabel>Enabled</EuiFormLabel>
              <div data-test-subj={'rule_flyout_rule_enabled'}>
                <EuiHealth color={ruleData.enabled !== false ? 'success' : 'subdued'}>
                  {ruleData.enabled !== false ? 'Enabled' : 'Disabled'}
                </EuiHealth>
              </div>
            </EuiFlexItem>
          </EuiFlexGroup>

          <EuiSpacer />

          <EuiFlexGroup>
            {prePackaged && (
              <EuiFlexItem>
                <EuiFormLabel>License</EuiFormLabel>
                <EuiText size="s">
                  <EuiLink
                    target={'_blank'}
                    href={'https://github.com/SigmaHQ/sigma/blob/master/LICENSE.Detection.Rules.md'}
                  >
                    Detection Rule License (DLR)
                  </EuiLink>
                </EuiText>
              </EuiFlexItem>
            )}
            <EuiFlexItem>
              <EuiFormLabel>Last Updated</EuiFormLabel>
              <EuiText size="s">{ruleData.last_update_time || DEFAULT_EMPTY_DATA}</EuiText>
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

          <EuiFlexGroup>
            <EuiFlexItem>
              <EuiFormLabel>References</EuiFormLabel>
              {ruleData.references.length > 0 ? (
                ruleData.references.map((reference: any, i: number) => (
                  <div key={i} className="eui-textTruncate">
                    <EuiText size="s">
                      <EuiLink
                        href={reference.value}
                        target="_blank"
                        data-test-subj={'rule_flyout_rule_references'}
                      >
                        {reference.value}
                      </EuiLink>
                    </EuiText>
                  </div>
                ))
              ) : (
                <div>{DEFAULT_EMPTY_DATA}</div>
              )}
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiFormLabel>False positive cases</EuiFormLabel>
              <div data-test-subj={'rule_flyout_rule_false_positives'}>
                {ruleData.false_positives.length > 0 ? (
                  ruleData.false_positives.map((falsepositive: any, i: number) => (
                    <EuiText size="s" key={i}>
                      {falsepositive.value}
                    </EuiText>
                  ))
                ) : (
                  <div>{DEFAULT_EMPTY_DATA}</div>
                )}
              </div>
            </EuiFlexItem>
          </EuiFlexGroup>

          <EuiSpacer />

          <EuiCompressedFormRow label="Detection" fullWidth>
            <EuiCodeBlock language="yaml" data-test-subj={'rule_flyout_rule_detection'}>
              {ruleData.detection}
            </EuiCodeBlock>
          </EuiCompressedFormRow>

          {ruleData.mitre ? (
            <>
              <EuiSpacer />
              <EuiCompressedFormRow label="MITRE ATT&CK" fullWidth>
                <EuiCodeBlock language="yaml" data-test-subj={'rule_flyout_rule_mitre'}>
                  {ruleData.mitre}
                </EuiCodeBlock>
              </EuiCompressedFormRow>
            </>
          ) : null}

          {ruleData.compliance ? (
            <>
              <EuiSpacer />
              <EuiCompressedFormRow label="Compliance" fullWidth>
                <EuiCodeBlock language="yaml" data-test-subj={'rule_flyout_rule_compliance'}>
                  {ruleData.compliance}
                </EuiCodeBlock>
              </EuiCompressedFormRow>
            </>
          ) : null}
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
