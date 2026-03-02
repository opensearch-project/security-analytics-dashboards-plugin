/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useCallback, useState } from 'react';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiSpacer,
  EuiText,
  EuiPanel,
  EuiSmallButton,
  EuiInMemoryTable,
  EuiEmptyPrompt,
} from '@elastic/eui';
import { BREADCRUMBS, ROUTES } from '../../../utils/constants';
import { DataStore } from '../../../store/DataStore';
import {
  getCorrelationRulesTableColumns,
  getCorrelationRulesTableSearchConfig,
} from '../utils/helpers';
import { CorrelationRule, CorrelationRuleTableItem, DataSourceProps } from '../../../../types';
import { RouteComponentProps } from 'react-router-dom';
import { DeleteCorrelationRuleModal } from '../components/DeleteModal';
import { setBreadcrumbs } from '../../../utils/helpers';
import { PageHeader } from '../../../components/PageHeader/PageHeader';
import { getUseUpdatedUx } from '../../../services/utils/constants';

export interface CorrelationRulesProps extends RouteComponentProps, DataSourceProps {}

export const CorrelationRules: React.FC<CorrelationRulesProps> = (props: CorrelationRulesProps) => {
  const [allRules, setAllRules] = useState<CorrelationRuleTableItem[]>([]);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [selectedRule, setSelectedRule] = useState<CorrelationRule | undefined>(undefined);

  const getCorrelationRules = useCallback(async () => {
    const allRuleItems: CorrelationRule[] = await DataStore.correlations.getCorrelationRules();
    const allRuleTableItems: CorrelationRuleTableItem[] = allRuleItems.map((item) => {
      const logTypes = item.queries.map((q) => q.logType).join(', ');
      return {
        ...item,
        logTypes,
      };
    });
    setAllRules(allRuleTableItems);
  }, [DataStore.correlations.getCorrelationRules]);

  useEffect(() => {
    // Wazuh Customization: Breadcrumbs for Correlation Rules
    setBreadcrumbs([BREADCRUMBS.DETECTION, BREADCRUMBS.CORRELATION_RULES]);

    // if (getUseUpdatedUx()) {
    //   setBreadcrumbs([BREADCRUMBS.DETECTION, BREADCRUMBS.CORRELATION_RULES]);
    // } else {
    //   setBreadcrumbs([BREADCRUMBS.DETECTION, BREADCRUMBS.CORRELATION_RULES]);
    // }
  }, [getUseUpdatedUx()]);

  useEffect(() => {
    getCorrelationRules();
  }, [getCorrelationRules, props.dataSource]);

  const createRuleAction = useMemo(
    () => (
      <EuiSmallButton
        href={`#${ROUTES.CORRELATION_RULE_CREATE}`}
        data-test-subj={'create_rule_button'}
        fill={true}
      >
        Create correlation rule
      </EuiSmallButton>
    ),
    []
  );

  const onRuleNameClick = useCallback((rule: CorrelationRule) => {
    props.history.push({
      pathname: `${ROUTES.CORRELATION_RULE_EDIT}/${rule.id}`,
      state: { rule, isReadOnly: false },
    });
  }, []);

  const closeDeleteModal = () => {
    setIsDeleteModalVisible(false);
  };

  const onDeleteRuleConfirmed = async () => {
    if (selectedRule) {
      const response = await DataStore.correlations.deleteCorrelationRule(selectedRule.id);

      if (response) {
        closeDeleteModal();
        setSelectedRule(undefined);
        await getCorrelationRules();
      }
    }
  };

  const deleteModal = useMemo(
    () =>
      selectedRule ? (
        <DeleteCorrelationRuleModal
          title={selectedRule.name}
          onCancel={closeDeleteModal}
          onConfirm={onDeleteRuleConfirmed}
        />
      ) : null,
    [closeDeleteModal, onDeleteRuleConfirmed]
  );

  return (
    <>
      {isDeleteModalVisible && deleteModal ? deleteModal : null}
      <EuiFlexGroup direction="column" gutterSize={'m'}>
        <PageHeader appRightControls={[{ renderComponent: createRuleAction }]}>
          <EuiFlexItem grow={false}>
            <EuiFlexGroup gutterSize={'s'} justifyContent={'spaceBetween'}>
              <EuiFlexItem>
                <EuiText size="s">
                  <h1>Correlation rules</h1>
                </EuiText>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>{createRuleAction}</EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
        </PageHeader>
        <EuiFlexItem>
          <EuiPanel>
            {allRules.length ? (
              <EuiInMemoryTable
                columns={getCorrelationRulesTableColumns(onRuleNameClick, (rule) => {
                  setIsDeleteModalVisible(true);
                  setSelectedRule(rule);
                })}
                items={allRules}
                pagination={true}
                sorting={true}
                search={getCorrelationRulesTableSearchConfig()}
              />
            ) : (
              <EuiEmptyPrompt
                title={
                  <EuiText size="s">
                    <h2>No correlation rules found</h2>
                  </EuiText>
                }
                body={
                  <EuiText size="s">
                    {/* Replace log types with integrations by Wazuh */}
                    <p>
                      Create a correlation rule based on specified fields to generate correlations
                      across all findings between different integrations.
                    </p>
                  </EuiText>
                }
                actions={[
                  <EuiSmallButton
                    fill={true}
                    color="primary"
                    href={`#${ROUTES.CORRELATION_RULE_CREATE}`}
                  >
                    Create correlation rule
                  </EuiSmallButton>,
                ]}
              />
            )}
          </EuiPanel>
        </EuiFlexItem>
      </EuiFlexGroup>
    </>
  );
};
