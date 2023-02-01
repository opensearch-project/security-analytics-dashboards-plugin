/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiButton, EuiFlexGroup, EuiFlexItem, EuiPanel, EuiSpacer, EuiTitle } from '@elastic/eui';
import { ServicesContext } from '../../../../services';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { BrowserServices } from '../../../../models/interfaces';
import { RulesViewModelActor } from '../../models/RulesViewModelActor';
import { RulesTable } from '../../components/RulesTable/RulesTable';
import { RuleTableItem } from '../../utils/helpers';
import { RuleItemInfoBase } from '../../models/types';
import { RuleViewerFlyout } from '../../components/RuleViewerFlyout/RuleViewerFlyout';
import { BREADCRUMBS, ROUTES } from '../../../../utils/constants';
import { NotificationsStart } from 'opensearch-dashboards/public';
import { CoreServicesContext } from '../../../../components/core_services';

export interface RulesProps extends RouteComponentProps {
  notifications?: NotificationsStart;
}

export const Rules: React.FC<RulesProps> = (props) => {
  const services = useContext(ServicesContext) as BrowserServices;
  const context = useContext(CoreServicesContext);
  const rulesViewModelActor = useMemo(() => new RulesViewModelActor(services.ruleService), [
    services,
  ]);
  const [allRules, setAllRules] = useState<RuleItemInfoBase[]>([]);
  const [flyoutData, setFlyoutData] = useState<RuleTableItem | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const ruleItems: RuleTableItem[] = useMemo(
    () =>
      allRules.map((rule) => ({
        title: rule._source.title,
        level: rule._source.level,
        category: rule._source.category,
        description: rule._source.description,
        source: rule.prePackaged ? 'Sigma' : 'Custom',
        ruleInfo: rule,
        ruleId: rule._id,
      })),
    [allRules]
  );

  const getRules = useCallback(async () => {
    setLoading(true);
    const allRules = await rulesViewModelActor.fetchRules();
    setAllRules(allRules);
    setLoading(false);
  }, [rulesViewModelActor]);

  useEffect(() => {
    context?.chrome.setBreadcrumbs([BREADCRUMBS.SECURITY_ANALYTICS, BREADCRUMBS.RULES]);
    getRules();
  }, [getRules]);

  const openImportPage = useCallback(() => {
    props.history.push(ROUTES.RULES_IMPORT);
  }, []);

  const openCreatePage = useCallback(() => {
    props.history.push(ROUTES.RULES_CREATE);
  }, []);

  const headerActions = useMemo(
    () => [
      <EuiButton onClick={openImportPage} data-test-subj={'import_rule_button'}>
        Import rule
      </EuiButton>,
      <EuiButton onClick={openCreatePage} data-test-subj={'create_rule_button'} fill={true}>
        Create new rule
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
          ruleService={services.ruleService}
          notifications={props.notifications}
        />
      ) : null}
      <EuiFlexGroup direction="column">
        <EuiFlexItem>
          <EuiFlexGroup gutterSize={'s'} justifyContent={'spaceBetween'}>
            <EuiFlexItem>
              <EuiTitle size="m">
                <h1>Rules</h1>
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
            <RulesTable loading={loading} ruleItems={ruleItems} showRuleDetails={setFlyoutData} />
          </EuiPanel>
        </EuiFlexItem>
      </EuiFlexGroup>
    </>
  );
};
