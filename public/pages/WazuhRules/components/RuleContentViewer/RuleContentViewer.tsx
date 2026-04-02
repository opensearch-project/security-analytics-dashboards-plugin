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
  EuiLink,
  EuiModalBody,
  EuiSpacer,
  EuiText,
} from '@elastic/eui';
import { EnabledHealth } from '../../../../components/Utility/EnabledHealth';
import React, { useState } from 'react';
import { DEFAULT_EMPTY_DATA } from '../../../../utils/constants';
import { RuleItemInfoBase } from '../../../../../types';
import { getLogTypeLabel } from '../../../LogTypes/utils/helpers';
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

interface BadgeGroupProps {
  label: string;
  values: string[];
}

const BadgeGroup: React.FC<BadgeGroupProps> = ({ label, values }) => {
  if (!values.length) return null;
  return (
    <div>
      <EuiText size="xs" color="subdued">
        <strong>{label}</strong>
      </EuiText>
      <EuiSpacer size="xs" />
      <EuiFlexGroup gutterSize="xs" wrap responsive={false}>
        {values.map((v, i) => (
          <EuiFlexItem grow={false} key={i}>
            <EuiBadge>{v}</EuiBadge>
          </EuiFlexItem>
        ))}
      </EuiFlexGroup>
    </div>
  );
};

export const RuleContentViewer: React.FC<RuleContentViewerProps> = ({ rule }) => {
  const { prePackaged, _source: ruleData, _id: ruleId } = rule;
  if (!ruleData.id) {
    ruleData.id = ruleId;
  }
  const [selectedEditorType, setSelectedEditorType] = useState('visual');

  const mitreData = parseMitreYml(ruleData.mitre);
  const hasMitre = MITRE_SECTIONS.some((s) => mitreData[s.field].length > 0);

  const complianceData = parseComplianceYml(ruleData.compliance);
  const hasCompliance = COMPLIANCE_KEYS.some((k) => complianceData[k].length > 0);

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
                {rule.integration && typeof rule.integration.document?.metadata?.title === 'string'
                  ? rule.integration.document?.metadata?.title
                  : '-' }
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
                        <EuiBadge>{support}</EuiBadge>
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
              <EuiFormLabel>Space</EuiFormLabel>
              <EuiText size="s">{prePackaged ? 'Standard' : 'Custom'}</EuiText>
            </EuiFlexItem>
            <EuiFlexItem data-test-subj={'rule_flyout_rule_severity'}>
              <EuiFormLabel>Rule level</EuiFormLabel>
              <div>{getSeverityBadge(ruleData.level)}</div>
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
              <EuiFormLabel>Date</EuiFormLabel>
              <EuiText size="s">{ruleData.metadata?.date || DEFAULT_EMPTY_DATA}</EuiText>
            </EuiFlexItem>
          </EuiFlexGroup>

          <EuiSpacer />

          <EuiFlexGroup>
            <EuiFlexItem>
              <EuiFormLabel>Modified</EuiFormLabel>
              <EuiText size="s">{ruleData.last_update_time || DEFAULT_EMPTY_DATA}</EuiText>
            </EuiFlexItem>
          </EuiFlexGroup>

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
          <EuiFlexGroup direction="column">
            <EuiFlexItem>
              <EuiFormLabel>References</EuiFormLabel>
              {ruleData.references.length > 0 ? (
                ruleData.references.map((reference: any, i: number) => (
                  <div key={i} style={{ wordBreak: 'break-all' }}>
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
