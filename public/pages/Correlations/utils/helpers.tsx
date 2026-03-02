/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  EuiBasicTableColumn,
  EuiBadge,
  EuiToolTip,
  EuiSmallButtonIcon,
  EuiLink,
  EuiFlexItem,
  EuiFlexGroup,
} from '@elastic/eui';
import {
  CorrelationFinding,
  CorrelationRule,
  CorrelationRuleQuery,
  CorrelationRuleTableItem,
} from '../../../../types';
import { Search } from '@opensearch-project/oui/src/eui_components/basic_table';
import { formatRuleType, getLogTypeFilterOptions } from '../../../utils/helpers';
import { DEFAULT_EMPTY_DATA } from '../../../utils/constants';
import { getSeverityColor, getSeverityLabel } from './constants';
import {
  addInteractiveLegends,
  DateOpts,
  defaultDateFormat,
  defaultScaleDomain,
  defaultTimeUnit,
  getTimeTooltip,
  getVisualizationSpec,
  getXAxis,
  getYAxis,
} from '../../Overview/utils/helpers';

export const getCorrelationRulesTableColumns = (
  onRuleNameClick: (rule: CorrelationRule) => void,
  _refreshRules: (ruleItem: CorrelationRule) => void
): EuiBasicTableColumn<CorrelationRuleTableItem>[] => {
  return [
    {
      field: 'name',
      name: 'Name',
      sortable: true,
      truncateText: true,
      render: (name: string, ruleItem: CorrelationRule) => (
        <EuiLink onClick={() => onRuleNameClick(ruleItem)}>{name}</EuiLink>
      ),
    },
    {
      name: 'Integrations', // Changed from Log Types to Integrations by Wazuh
      field: 'logTypes',
      render: (logTypes: string, ruleItem: CorrelationRule) => {
        const badges = [
          ...new Set(ruleItem.queries?.map((query) => formatRuleType(query.logType))),
        ];
        return (
          <>
            {badges.map((badge) => (
              <EuiBadge color="hollow">{badge}</EuiBadge>
            ))}
          </>
        );
      },
    },
    {
      field: 'queries',
      name: 'Queries',
      align: 'right',
      render: (queries: CorrelationRuleQuery[], ruleItem: CorrelationRule) => {
        return queries.length;
      },
      width: '10%',
    },
    {
      name: 'Actions',
      field: '',
      actions: [
        {
          render: (ruleItem: CorrelationRule) => (
            <EuiToolTip content={'Delete'}>
              <EuiSmallButtonIcon
                aria-label={'Delete correlation rule'}
                data-test-subj={`view-details-icon`}
                iconType={'trash'}
                color="danger"
                onClick={() => _refreshRules(ruleItem)}
              />
            </EuiToolTip>
          ),
        },
      ],
    },
  ];
};

export const displayBadges = (inputList: string[]) => {
  if (!inputList || inputList.length === 0) return DEFAULT_EMPTY_DATA;
  const MAX_DISPLAY = 2;
  const remainingCount = inputList.length > MAX_DISPLAY ? inputList.length - MAX_DISPLAY : 0;
  const displayedInputList = inputList.slice(0, MAX_DISPLAY).map((input) => {
    const label = input;
    return <EuiBadge>{label}</EuiBadge>;
  });
  const tooltipContent = (
    <>
      {inputList.slice(MAX_DISPLAY).map((input) => {
        const label = input;
        return (
          <EuiFlexItem grow={true}>
            <EuiBadge>{label}</EuiBadge>
          </EuiFlexItem>
        );
      })}
    </>
  );
  return (
    <EuiFlexGroup
      wrap
      gutterSize="s"
      alignItems="center"
      style={{
        padding: '4px 0px',
      }}
    >
      {displayedInputList}
      {remainingCount > 0 && (
        <EuiFlexItem grow={true}>
          <EuiToolTip content={tooltipContent} position="top">
            <EuiBadge>{`+${remainingCount} more`}</EuiBadge>
          </EuiToolTip>
        </EuiFlexItem>
      )}
    </EuiFlexGroup>
  );
};

export const displaySeveritiesBadges = (severities: string[]) => {
  if (!severities || severities.length === 0) return DEFAULT_EMPTY_DATA;
  const MAX_DISPLAY = 2;
  const remainingCount = severities.length > MAX_DISPLAY ? severities.length - MAX_DISPLAY : 0;
  const displayedSeverities = severities.slice(0, MAX_DISPLAY).map((severity) => {
    const label = getSeverityLabel(severity);
    const { background, text } = getSeverityColor(label);
    return (
      <EuiBadge key={severity} style={{ backgroundColor: background, color: text }}>
        {label}
      </EuiBadge>
    );
  });

  const tooltipContent = (
    <EuiFlexGroup direction="column" gutterSize="none">
      {severities.slice(MAX_DISPLAY).map((severity) => {
        const label = getSeverityLabel(severity);
        const { background, text } = getSeverityColor(label);
        return (
          <EuiFlexItem grow={true} style={{ padding: '4px', width: '100%' }}>
            <EuiBadge key={severity} style={{ backgroundColor: background, color: text }}>
              {label}
            </EuiBadge>
          </EuiFlexItem>
        );
      })}
    </EuiFlexGroup>
  );

  return (
    <EuiFlexGroup
      wrap
      gutterSize="s"
      alignItems="center"
      style={{
        padding: '4px 0px',
      }}
    >
      {displayedSeverities}
      {remainingCount > 0 && (
        <EuiFlexItem grow={true}>
          <EuiToolTip content={tooltipContent} position="top">
            <EuiBadge>{`+${remainingCount} more`}</EuiBadge>
          </EuiToolTip>
        </EuiFlexItem>
      )}
    </EuiFlexGroup>
  );
};

export const displayResourcesBadges = (resources: string[]) => {
  if (!resources || resources.length === 0) return DEFAULT_EMPTY_DATA;
  const MAX_DISPLAY = 2;
  const remainingCount = resources.length > MAX_DISPLAY ? resources.length - MAX_DISPLAY : 0;
  const displayedresources = resources.slice(0, MAX_DISPLAY).map((resources) => {
    const label = resources;
    return <EuiBadge>{label}</EuiBadge>;
  });
  const tooltipContent = (
    <>
      {resources.slice(MAX_DISPLAY).map((resources) => {
        const label = resources;
        return (
          <EuiFlexItem grow={true}>
            <EuiBadge style={{ backgroundColor: '#fff', border: '1px solid #d3dae6' }}>
              {label}
            </EuiBadge>
          </EuiFlexItem>
        );
      })}
    </>
  );
  return (
    <EuiFlexGroup
      wrap
      gutterSize="s"
      alignItems="center"
      style={{
        padding: '4px 0px',
      }}
    >
      {displayedresources}
      {remainingCount > 0 && (
        <EuiFlexItem grow={true}>
          <EuiToolTip content={tooltipContent} position="top">
            <EuiBadge>{`+${remainingCount} more`}</EuiBadge>
          </EuiToolTip>
        </EuiFlexItem>
      )}
    </EuiFlexGroup>
  );
};

export const getCorrelationRulesTableSearchConfig = (): Search => {
  return {
    box: {
      placeholder: 'Search by rule name, integration', // Changed Log Type to Integration by Wazuh
      schema: true,
    },
    filters: [
      {
        type: 'field_value_selection',
        field: 'logTypes',
        name: 'Integrations', // Changed from Log Types to Integrations by Wazuh
        multiSelect: 'or',
        options: getLogTypeFilterOptions(),
      },
    ],
  };
};

export const getCorrelatedFindingsVisualizationSpec = (
  visualizationData: any[],
  dateOpts: DateOpts = {
    timeUnit: defaultTimeUnit,
    dateFormat: defaultDateFormat,
    domain: defaultScaleDomain,
  }
) => {
  return getVisualizationSpec('Correlated Findings data overview', visualizationData, [
    addInteractiveLegends({
      mark: {
        type: 'bar',
        clip: true,
      },
      encoding: {
        tooltip: [getYAxis('correlatedFinding', 'Correlated Findings'), getTimeTooltip(dateOpts)],
        x: getXAxis(dateOpts),
        y: getYAxis('correlatedFinding', 'Count'),
        color: {
          field: 'title',
          legend: {
            title: 'Legend',
          },
        },
      },
    }),
  ]);
};

export const mapConnectedCorrelations = (
  correlations: {
    finding1: CorrelationFinding;
    finding2: CorrelationFinding;
  }[]
) => {
  const connectionsMap = new Map<string, Set<string>>();
  const findingsMap = new Map<string, CorrelationFinding>();

  correlations.forEach((correlation) => {
    const { finding1, finding2 } = correlation;

    findingsMap.set(finding1.id, finding1);
    findingsMap.set(finding2.id, finding2);

    if (!connectionsMap.has(finding1.id)) {
      connectionsMap.set(finding1.id, new Set<string>());
    }
    connectionsMap.get(finding1.id)!.add(finding2.id);

    if (!connectionsMap.has(finding2.id)) {
      connectionsMap.set(finding2.id, new Set<string>());
    }
    connectionsMap.get(finding2.id)!.add(finding1.id);
  });

  const visited = new Set<string>();
  const connectedGroups: CorrelationFinding[][] = [];

  function depthFirstSearch(findingId: string, currentGroup: CorrelationFinding[]) {
    // Get all the connected correlated findings for the given finding
    visited.add(findingId);
    const finding = findingsMap.get(findingId);
    if (finding) {
      currentGroup.push(finding);
    }

    const connections = connectionsMap.get(findingId) || new Set<string>();
    connections.forEach((connectedId) => {
      if (!visited.has(connectedId)) {
        depthFirstSearch(connectedId, currentGroup);
      }
    });
  }

  connectionsMap.forEach((_, findingId) => {
    if (!visited.has(findingId)) {
      const currentGroup: CorrelationFinding[] = [];
      depthFirstSearch(findingId, currentGroup);
      if (currentGroup.length > 0) {
        connectedGroups.push(currentGroup);
      }
    }
  });

  return connectedGroups;
};
