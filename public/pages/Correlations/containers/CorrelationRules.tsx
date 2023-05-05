/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useContext, useEffect, useMemo, useCallback, useState } from 'react';
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
import { CoreServicesContext } from '../../../components/core_services';
import {
  getCorrelationRulesTableColumns,
  getCorrelationRulesTableSearchConfig,
} from '../utils/helpers';
import { CorrelationRule } from '../../../../types';
import { RouteComponentProps } from 'react-router-dom';
import { CorrelationsExperimentalBanner } from '../components/ExperimentalBanner';
import { DeleteCorrelationRuleModal } from '../components/DeleteModal';

export const CorrelationRules: React.FC<RouteComponentProps> = (props: RouteComponentProps) => {
  const context = useContext(CoreServicesContext);
  const [allRules, setAllRules] = useState<CorrelationRule[]>([]);
  const [filteredRules, setFilteredRules] = useState<CorrelationRule[]>([]);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [selectedRule, setSelectedRule] = useState<CorrelationRule | undefined>(undefined);

  const getCorrelationRules = useCallback(async () => {
    const allRuleItems: CorrelationRule[] = await DataStore.correlations.getCorrelationRules();
    setAllRules(allRuleItems);
    setFilteredRules(allRuleItems);
  }, [DataStore.correlations.getCorrelationRules]);

  useEffect(() => {
    context?.chrome.setBreadcrumbs([
      BREADCRUMBS.SECURITY_ANALYTICS,
      BREADCRUMBS.CORRELATIONS,
      BREADCRUMBS.CORRELATION_RULES,
    ]);

    getCorrelationRules();
  }, [getCorrelationRules]);

  const headerActions = useMemo(
    () => [
      <EuiButton
        href={`${PLUGIN_NAME}#${ROUTES.CORRELATION_RULE_CREATE}`}
        data-test-subj={'create_rule_button'}
        fill={true}
      >
        Create correlation rule
      </EuiButton>,
    ],
    []
  );

  const onLogTypeFilterChange = useCallback(
    (logTypes?: string[]) => {
      if (!logTypes) {
        setFilteredRules(allRules);
        return;
      }

      const logTypesSet = new Set(logTypes);
      const filteredRules = allRules.filter((rule) => {
        return rule.queries.some((query) => logTypesSet.has(query.logType));
      });
      setFilteredRules(filteredRules);
    },
    [allRules]
  );

  const onRuleNameClick = useCallback((rule: CorrelationRule) => {
    props.history.push({
      pathname: ROUTES.CORRELATION_RULE_CREATE,
      state: { rule, isReadOnly: true },
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
      <CorrelationsExperimentalBanner />
      <EuiFlexGroup direction="column">
        <EuiFlexItem>
          <EuiFlexGroup gutterSize={'s'} justifyContent={'spaceBetween'}>
            <EuiFlexItem>
              <EuiTitle size="m">
                <h1>Correlation rules</h1>
              </EuiTitle>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiFlexGroup justifyContent="flexEnd">
                {headerActions.map((action, idx) => (
                  <EuiFlexItem key={idx} grow={false}>
                    {action}
                  </EuiFlexItem>
                ))}
              </EuiFlexGroup>
            </EuiFlexItem>
          </EuiFlexGroup>
          <EuiSpacer size={'m'} />
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiPanel>
            {allRules.length ? (
              <EuiInMemoryTable
                columns={getCorrelationRulesTableColumns(onRuleNameClick, (rule) => {
                  setIsDeleteModalVisible(true);
                  setSelectedRule(rule);
                })}
                items={filteredRules}
                pagination={true}
                sorting={true}
                search={getCorrelationRulesTableSearchConfig(onLogTypeFilterChange)}
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
