/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { RuleEditorContainer } from '../../components/RuleEditor/RuleEditorContainer';
import React, { useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { EuiFlexGroup, EuiFlexItem, EuiLoadingSpinner, EuiPanel } from '@elastic/eui';
import { BREADCRUMBS, ROUTES } from '../../../../utils/constants';
import { NotificationsStart } from 'opensearch-dashboards/public';
import { setRulesRelatedBreadCrumb } from '../../utils/helpers';
import { Rule } from '../../../../../types';
import { errorNotificationToast, setBreadcrumbs } from '../../../../utils/helpers';
import { getUseUpdatedUx } from '../../../../services/utils/constants';
import { DataStore } from '../../../../store/DataStore';
import { SpaceTypes } from '../../../../../common/constants';

export interface EditRuleProps extends RouteComponentProps<{ id: string }> {
  notifications?: NotificationsStart;
}

export const EditRule: React.FC<EditRuleProps> = ({ history, match, notifications }) => {
  const ruleId = match.params.id;
  const [rule, setRule] = useState<Rule | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRule = async () => {
      setIsLoading(true);
      try {
        const result = await DataStore.rules.searchRules(
          { query: { ids: { values: [ruleId] } }, size: 1 },
          SpaceTypes.DRAFT.value
        );
        const item = result.items[0];
        if (!item) {
          history.replace(ROUTES.RULES);
          return;
        }

        if (!getUseUpdatedUx()) {
          setRulesRelatedBreadCrumb(BREADCRUMBS.RULES_EDIT, setBreadcrumbs);
        } else {
          setBreadcrumbs([BREADCRUMBS.RULE_EDIT_DETAILS(item._source.title)]);
        }

        setRule(item._source);
      } catch {
        errorNotificationToast(notifications, 'retrieve', 'rule');
        history.replace(ROUTES.RULES);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRule();
  }, [ruleId, history, notifications]);

  if (isLoading || !rule) {
    return (
      <EuiPanel>
        <EuiFlexGroup justifyContent="center" alignItems="center" style={{ minHeight: '400px' }}>
          <EuiFlexItem grow={false}>
            <EuiLoadingSpinner size="xl" />
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiPanel>
    );
  }

  return (
    <RuleEditorContainer
      title="Edit rule"
      mode={'edit'}
      rule={rule}
      history={history}
      notifications={notifications}
    />
  );
};
