/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CorrelationGraphData } from '../../../../types';
import { ruleSeverity, ruleTypes } from '../../Rules/utils/constants';
import { FilterItem } from '../components/FilterGroup';
import { EuiIcon, EuiTitle } from '@elastic/eui';
import { logTypeCategories, logTypesByCategories } from '../../../utils/constants';
import { getLogTypeLabel } from '../../LogTypes/utils/helpers';

export const graphRenderOptions = {
  nodes: {
    shape: 'dot',
  },
  edges: {
    arrows: {
      to: {
        enabled: false,
      },
    },
    color: '#000000',
    chosen: true,
  },
  layout: {
    hierarchical: false,
    randomSeed: 2222,
    improvedLayout: false,
  },
  autoResize: true,
  height: '800px',
  width: '100%',
  physics: {
    stabilization: {
      fit: true,
      iterations: 1000,
    },
  },
  interaction: {
    zoomView: true,
    zoomSpeed: 0.2,
    dragView: true,
    dragNodes: false,
    multiselect: true,
    tooltipDelay: 50,
    hover: true,
  },
};

export const getDefaultLogTypeFilterItemOptions: () => FilterItem[] = () => {
  const options: FilterItem[] = [];
  logTypeCategories.forEach((category) => {
    const logTypes = logTypesByCategories[category];
    options.push({
      name: (
        <EuiTitle size="xxs">
          <h4>{category}</h4>
        </EuiTitle>
      ),
      id: category,
      checked: 'on',
      childOptionIds: new Set(logTypes.map(({ name }) => name)),
      visible: true,
    });

    logTypes.forEach(({ name }) => {
      options.push({
        name: getLogTypeLabel(name),
        id: name,
        checked: 'on',
        visible: true,
      });
    });
  });

  return options;
};

export const defaultSeverityFilterItemOptions: FilterItem[] = Object.values(ruleSeverity).map(
  (sev) => {
    return {
      name: (
        <p>
          <EuiIcon type={'dot'} color={sev.color.background} /> {`${sev.name}`}
        </p>
      ),
      id: sev.value,
      checked: 'on',
      visible: true,
    };
  }
);

export const emptyGraphData: CorrelationGraphData = {
  graph: {
    nodes: [],
    edges: [],
  },
  events: {},
};

export const getLabelFromLogType = (logType: string) => {
  return ruleTypes.find((ruleType) => ruleType.value === logType)?.label || logType;
};

export const getSeverityLabel = (sev: string) => {
  return ruleSeverity.find((severity) => severity.value === sev)?.name || '';
};

export const getSeverityColor = (sev: string) => {
  return (
    ruleSeverity.find((severity) => severity.value === sev.toLowerCase())?.color || {
      background: 'white',
      text: 'black',
    }
  );
};

export function getNodeSize(severity: string) {
  switch (severity) {
    case 'critical':
      return 40;
    case 'high':
      return 32;
    case 'medium':
      return 24;
    case 'low':
      return 17;
    case 'informational':
    default:
      return 10;
  }
}
