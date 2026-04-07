/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  EuiBadge,
  EuiButtonGroup,
  EuiCodeBlock,
  EuiCompressedFormRow,
  EuiFlexGrid,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormLabel,
  EuiLink,
  EuiModalBody,
  EuiSpacer,
  EuiText,
} from '@elastic/eui';
import { EnabledHealth } from '../../../../components/Utility/EnabledHealth';
import React, { useState } from 'react';
import { DEFAULT_EMPTY_DATA } from '../../../../utils/constants';
import { RuleItemInfoBase } from '../../../../../types';
import { Metadata } from '../../../../components/Utility/Metadata';
import { BadgeGroup } from '../../../../components/Utility/BadgeGroup';
import { getSeverityBadge } from '../../../../utils/helpers';
import { RuleContentYamlViewer } from './RuleContentYamlViewer';
import { MITRE_SECTIONS, parseMitreYml } from '../../utils/mitre';
import { COMPLIANCE_FRAMEWORKS, COMPLIANCE_KEYS, parseComplianceYml } from '../../utils/compliance';

export interface RuleContentViewerProps {
  rule: RuleItemInfoBase;
}

const editorTypes = [
  { id: 'visual', label: 'Visual' },
  { id: 'yaml', label: 'YAML' },
  { id: 'json', label: 'JSON' },
];

export const RuleContentViewer: React.FC<RuleContentViewerProps> = ({
  rule: { prePackaged, _source: ruleData, _id: ruleId, integration, space },
}) => {
  if (!ruleData.id) {
    ruleData.id = ruleId;
  }
  const [selectedEditorType, setSelectedEditorType] = useState('visual');

  const mitreData = parseMitreYml(ruleData.mitre);
  const hasMitre = MITRE_SECTIONS.some((s) => mitreData[s.field].length > 0);

  const complianceData = parseComplianceYml(ruleData.compliance);
  const hasCompliance = COMPLIANCE_KEYS.some((k) => complianceData[k].length > 0);

  const metadataFields: Array<{
    label: string;
    value: any;
    type?: 'text' | 'date' | 'url';
  }> = [
    { label: 'Space', value: space },
    { label: 'Integration', value: integration?.document?.metadata?.title },
    { label: 'Title', value: ruleData.title },
    { label: 'ID', value: ruleData.id },
    { label: 'Author', value: ruleData.author },
    { label: 'Description', value: ruleData.description },
    { label: 'Date', value: ruleData.metadata?.date, type: 'date' },
    { label: 'Modified', value: ruleData.last_update_time, type: 'date' },
    { label: 'Rule level', value: getSeverityBadge(ruleData.level) },
    { label: 'Rule status', value: ruleData.status },
    { label: 'Documentation', value: ruleData.metadata?.documentation, type: 'url' },
    {
      label: 'Supports',
      value: <BadgeGroup emptyValue={DEFAULT_EMPTY_DATA} values={ruleData.metadata?.supports} />,
    },
    { label: 'References', value: ruleData.references?.map((r: any) => r.value), type: 'url' },
  ];

  return (
    <EuiModalBody>
      <EuiFlexGroup alignItems="center">
        <EuiFlexItem>
          <EuiButtonGroup
            data-test-subj="change-editor-type"
            legend="This is editor type selector"
            options={editorTypes}
            idSelected={selectedEditorType}
            onChange={(id) => setSelectedEditorType(id)}
          />
        </EuiFlexItem>
        <EuiFlexItem>
          <EnabledHealth enabled={ruleData.enabled} data-test-subj="rule_flyout_enabled" />
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiSpacer size="xl" />
      {selectedEditorType === 'visual' && (
        <>
          <EuiFlexGrid columns={2}>
            {metadataFields.map(({ label, value, type = 'text' }) => (
              <EuiFlexItem key={label}>
                <Metadata label={<EuiFormLabel>{label}</EuiFormLabel>} value={value} type={type} />
              </EuiFlexItem>
            ))}
          </EuiFlexGrid>
          {hasMitre && (
            <>
              <EuiSpacer />
              <EuiFormLabel>MITRE ATT&CK</EuiFormLabel>
              <EuiSpacer size="s" />
              <EuiFlexGroup
                direction="column"
                gutterSize="s"
                data-test-subj={'rule_flyout_rule_mitre'}
              >
                {MITRE_SECTIONS.map((section) => (
                  <EuiFlexItem key={section.field}>
                    <BadgeGroup label={section.title} values={mitreData[section.field]} />
                  </EuiFlexItem>
                ))}
              </EuiFlexGroup>
            </>
          )}
          {hasCompliance && (
            <>
              <EuiSpacer />
              <EuiFormLabel>Compliance</EuiFormLabel>
              <EuiSpacer size="s" />
              <EuiFlexGroup
                direction="column"
                gutterSize="s"
                data-test-subj={'rule_flyout_rule_compliance'}
              >
                {COMPLIANCE_FRAMEWORKS.map((framework) =>
                  complianceData[framework.key].length > 0 ? (
                    <EuiFlexItem key={framework.key}>
                      <BadgeGroup label={framework.label} values={complianceData[framework.key]} />
                    </EuiFlexItem>
                  ) : null
                )}
              </EuiFlexGroup>
            </>
          )}
          <EuiSpacer />
          <EuiFormLabel>Tags</EuiFormLabel>
          <EuiSpacer size="s" />
          {ruleData.tags.length > 0 ? (
            <EuiFlexGroup
              direction="row"
              wrap
              gutterSize="s"
              data-test-subj={'rule_flyout_rule_tags'}
            >
              {ruleData.tags.map((tag: { value: string }, i: number) => (
                <EuiFlexItem grow={false} key={i}>
                  <EuiBadge>
                    {tag.value.match(/attack\.t[0-9]+/) ? (
                      <EuiLink
                        href={`https://attack.mitre.org/techniques/${tag.value
                          .split('.')
                          .slice(1)
                          .join('/')
                          .toUpperCase()}`}
                        target="_blank"
                      >
                        {tag.value}
                      </EuiLink>
                    ) : (
                      tag.value
                    )}
                  </EuiBadge>
                </EuiFlexItem>
              ))}
            </EuiFlexGroup>
          ) : (
            <div>{DEFAULT_EMPTY_DATA}</div>
          )}
          <EuiSpacer />
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
      {selectedEditorType === 'json' && (
        <EuiCodeBlock language="json" isCopyable>
          {JSON.stringify(ruleData, null, 2)}
        </EuiCodeBlock>
      )}
    </EuiModalBody>
  );
};
