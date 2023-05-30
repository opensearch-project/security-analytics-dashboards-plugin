/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CorrelationGraphData } from '../../../../types';
import { ruleSeverity, ruleTypes } from '../../Rules/utils/constants';
import { FilterItem } from '../components/FilterGroup';
import { EuiIcon } from '@elastic/eui';

export const graphRenderOptions = {
  nodes: {
    shape: 'circle',
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

export const defaultLogTypeFilterItemOptions: FilterItem[] = Object.values(ruleTypes).map(
  (type) => {
    return {
      name: `${type.abbr}: ${type.label}`,
      id: type.value,
      checked: 'on',
    };
  }
);

export const defaultSeverityFilterItemOptions: FilterItem[] = Object.values(ruleSeverity).map(
  (sev) => {
    return {
      name: (
        <p>
          <EuiIcon type={'dot'} color={sev.color} /> {`${sev.priority} ${sev.name}`}
        </p>
      ),
      id: sev.value,
      checked: 'on',
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

export const getAbbrFromLogType = (logType: string) => {
  return ruleTypes.find((ruleType) => ruleType.value === logType)?.abbr || '-';
};

export const getLabelFromLogType = (logType: string) => {
  return ruleTypes.find((ruleType) => ruleType.value === logType)?.label || '-';
};

export const getSeverityLabel = (sev: string) => {
  return ruleSeverity.find((severity) => severity.value === sev)?.name || '';
};

export const getSeverityColor = (sev: string) => {
  return ruleSeverity.find((severity) => severity.value === sev.toLowerCase())?.color || 'black';
};
