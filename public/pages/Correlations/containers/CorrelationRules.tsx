/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useCallback, useState } from 'react';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiSpacer,
  EuiTitle,
  EuiPanel,
  EuiButton,
  EuiInMemoryTable,
  EuiEmptyPrompt,
} from '@elastic/eui';
import { BREADCRUMBS, PLUGIN_NAME, ROUTES } from '../../../utils/constants';
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
    setBreadcrumbs([BREADCRUMBS.CORRELATIONS, BREADCRUMBS.CORRELATION_RULES]);
  }, []);

  useEffect(() => {
    getCorrelationRules();
  }, [getCorrelationRules, props.dataSource]);

  const createRuleAction = useMemo(
    () => (
      <EuiButton
        href={`${PLUGIN_NAME}#${ROUTES.CORRELATION_RULE_CREATE}`}
        data-test-subj={'create_rule_button'}
        fill={true}
      >
        Create correlation rule
      </EuiButton>
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
      <EuiFlexGroup direction="column">
        <PageHeader appRightControls={[{ renderComponent: createRuleAction }]}>
          <EuiFlexItem>
            <EuiFlexGroup gutterSize={'s'} justifyContent={'spaceBetween'}>
              <EuiFlexItem>
                <EuiTitle size="m">
                  <h1>Correlation rules</h1>
                </EuiTitle>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>{createRuleAction}</EuiFlexItem>
            </EuiFlexGroup>
            <EuiSpacer size={'m'} />
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
                  <EuiTitle>
                    <h1>No correlation rules found</h1>
                  </EuiTitle>
                }
                body={
                  <p>
                    Create a correlation rule based on specified fields to generate correlations
                    across all findings between different log types.
                  </p>
                }
                actions={[
                  <EuiButton
                    fill={true}
                    color="primary"
                    href={`#${ROUTES.CORRELATION_RULE_CREATE}`}
                  >
                    Create correlation rule
                  </EuiButton>,
                ]}
              />
            )}
          </EuiPanel>
        </EuiFlexItem>
      </EuiFlexGroup>
    </>
  );
};
