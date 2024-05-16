/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiButton, EuiFlexGroup, EuiFlexItem, EuiPanel, EuiSpacer, EuiTitle } from '@elastic/eui';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { RulesTable } from '../../components/RulesTable/RulesTable';
import { RuleTableItem } from '../../utils/helpers';
import { RuleViewerFlyout } from '../../components/RuleViewerFlyout/RuleViewerFlyout';
import { BREADCRUMBS, ROUTES } from '../../../../utils/constants';
import { NotificationsStart } from 'opensearch-dashboards/public';
import { CoreServicesContext } from '../../../../components/core_services';
import { DataStore } from '../../../../store/DataStore';
import { DataSourceProps } from '../../../../../types';

export interface RulesProps extends RouteComponentProps, DataSourceProps {
  notifications?: NotificationsStart;
}

export const Rules: React.FC<RulesProps> = (props) => {
  const context = useContext(CoreServicesContext);

  const [allRules, setAllRules] = useState<RuleTableItem[]>([]);
  const [flyoutData, setFlyoutData] = useState<RuleTableItem | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);

  const getRules = useCallback(async () => {
    setLoading(true);

    const allRules = await DataStore.rules.getAllRules();
    const rules = allRules.map((rule) => ({
      title: rule._source.title,
      level: rule._source.level,
      category: rule._source.category,
      description: rule._source.description,
      source: rule.prePackaged ? 'Standard' : 'Custom',
      ruleInfo: rule,
      ruleId: rule._id,
    }));

    setAllRules(rules);

    setLoading(false);
  }, [DataStore.rules.getAllRules]);

  useEffect(() => {
    context?.chrome.setBreadcrumbs([BREADCRUMBS.SECURITY_ANALYTICS, BREADCRUMBS.RULES]);
  }, []);

  useEffect(() => {
    getRules();
  }, [getRules, props.dataSource]);

  const openImportPage = useCallback(() => {
    props.history.push(ROUTES.RULES_IMPORT);
  }, []);

  const openCreatePage = useCallback(() => {
    props.history.push(ROUTES.RULES_CREATE);
  }, []);

  const headerActions = useMemo(
    () => [
      <EuiButton onClick={openImportPage} data-test-subj={'import_rule_button'}>
        Import detection rule
      </EuiButton>,
      <EuiButton onClick={openCreatePage} data-test-subj={'create_rule_button'} fill={true}>
        Create detection rule
      </EuiButton>,
    ],
    []
  );

  const hideFlyout = useCallback(
    (refreshRulesTable?: boolean) => {
      setFlyoutData(undefined);

      if (refreshRulesTable) {
        getRules();
      }
    },
    [getRules]
  );

  return (
    <>
      {flyoutData ? (
        <RuleViewerFlyout
          hideFlyout={hideFlyout}
          history={props.history}
          ruleTableItem={flyoutData}
          notifications={props.notifications}
        />
      ) : null}
      <EuiFlexGroup direction="column">
        <EuiFlexItem>
          <EuiFlexGroup gutterSize={'s'} justifyContent={'spaceBetween'}>
            <EuiFlexItem>
              <EuiTitle size="m">
                <h1>Detection rules</h1>
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
            <RulesTable loading={loading} ruleItems={allRules} showRuleDetails={setFlyoutData} />
          </EuiPanel>
        </EuiFlexItem>
      </EuiFlexGroup>
    </>
  );
};
