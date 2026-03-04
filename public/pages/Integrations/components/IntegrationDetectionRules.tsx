/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  EuiBadge,
  EuiBasicTableColumn,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiInMemoryTable,
  EuiLink,
  EuiSmallButton,
  EuiSpacer,
  EuiText,
  EuiToolTip,
} from '@elastic/eui';
import { ContentPanel } from '../../../components/ContentPanel';
import { RuleTableItem } from '../../WazuhRules/utils/helpers';
import { RuleViewerFlyout } from '../../WazuhRules/components/RuleViewerFlyout/RuleViewerFlyout';
import { getSeverityColor, getSeverityLabel } from '../../Correlations/utils/constants';
import { ruleSeverity } from '../../Rules/utils/constants';
import { ROUTES } from '../../../utils/constants';
import { SpaceTypes, SPACE_ACTIONS } from '../../../../common/constants';
import { actionIsAllowedOnSpace, getSpacesAllowAction } from '../../../../common/helpers';
import { Space } from '../../../../types';

export interface IntegrationDetectionRulesProps {
  rules: RuleTableItem[];
  loadingRules: boolean;
  space: string;
  refreshRules: () => void;
}

export const IntegrationDetectionRules: React.FC<IntegrationDetectionRulesProps> = ({
  rules,
  loadingRules,
  space,
  refreshRules,
}) => {
  const [selectedRule, setSelectedRule] = useState<RuleTableItem | undefined>(undefined);

  const closeRuleDetails = useCallback(() => {
    setSelectedRule(undefined);
  }, []);

  const isCreateDisabled = !actionIsAllowedOnSpace(space as Space, SPACE_ACTIONS.CREATE);

  const columns: EuiBasicTableColumn<RuleTableItem>[] = useMemo(
    () => [
      {
        field: 'title',
        name: 'Name',
        sortable: true,
        truncateText: true,
        render: (_: string, rule: RuleTableItem) => (
          <EuiLink onClick={() => setSelectedRule(rule)}>{rule.title}</EuiLink>
        ),
      },
      {
        field: 'level',
        name: 'Severity',
        sortable: true,
        width: '120px',
        render: (level: string) => {
          const { text, background } = getSeverityColor(level);
          return (
            <EuiBadge style={{ color: text }} color={background}>
              {getSeverityLabel(level)}
            </EuiBadge>
          );
        },
      },
      {
        field: 'description',
        name: 'Description',
        sortable: false,
        truncateText: true,
      },
    ],
    []
  );

  const search = {
    box: {
      placeholder: 'Search rules',
      schema: true,
      compressed: true,
    },
    filters: [
      {
        type: 'field_value_selection' as const,
        field: 'level',
        name: 'Severity',
        compressed: true,
        multiSelect: 'or' as const,
        options: ruleSeverity.map((s) => ({ value: s.value, name: s.name })),
      },
    ],
  };

  return (
    <>
      {selectedRule && (
        <RuleViewerFlyout hideFlyout={closeRuleDetails} ruleTableItem={selectedRule} />
      )}
      <ContentPanel
        title="Rules"
        hideHeaderBorder={true}
        actions={[<EuiSmallButton onClick={refreshRules}>Refresh</EuiSmallButton>]}
      >
        {rules.length === 0 && !loadingRules ? (
          <EuiFlexGroup justifyContent="center" alignItems="center" direction="column">
            <EuiFlexItem grow={false}>
              <EuiText color="subdued" size="s">
                {/* By Wazuh */}
                <p>There are no rules associated with this integration.</p>
              </EuiText>
            </EuiFlexItem>
            {space !== SpaceTypes.STANDARD.value && (
              <EuiFlexItem grow={false}>
                {isCreateDisabled ? (
                  <EuiToolTip
                    content={`Rule can only be created in the spaces: ${getSpacesAllowAction(
                      SPACE_ACTIONS.CREATE
                    ).join(', ')}`}
                  >
                    <span>
                      <EuiSmallButton fill disabled>
                        Create rule&nbsp;
                        <EuiIcon type={'popout'} />
                      </EuiSmallButton>
                    </span>
                  </EuiToolTip>
                ) : (
                  <EuiSmallButton fill href={`#${ROUTES.RULES_CREATE}`} target="_blank">
                    Create rule&nbsp;
                    <EuiIcon type={'popout'} />
                  </EuiSmallButton>
                )}
                <EuiSpacer size="xl" />
              </EuiFlexItem>
            )}
          </EuiFlexGroup>
        ) : (
          <EuiInMemoryTable
            items={rules}
            columns={columns}
            loading={loadingRules}
            search={search}
            pagination={{
              initialPageSize: 10,
              pageSizeOptions: [10, 25, 50],
            }}
            sorting={{
              sort: { field: 'title', direction: 'asc' },
            }}
            message="No rules found."
          />
        )}
      </ContentPanel>
    </>
  );
};
