/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { CorrelationGraphData } from '../../../../types';
import { DETECTOR_TYPES } from '../../Detectors/utils/constants';
import { ruleSeverity, ruleTypes } from '../../Rules/utils/constants';
import { FilterItem } from '../components/FilterGroup';

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
    hover: true,
    tooltipDelay: 50,
  },
};

export enum TabIds {
  CORRELATIONS = 'correlations',
  CORRELATION_RULES = 'correlation-rules',
}

export const tabs = [
  { id: TabIds.CORRELATIONS, name: 'Correlations' },
  { id: TabIds.CORRELATION_RULES, name: 'Correlation rules' },
];

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
      name: `${sev.priority} ${sev.name}`,
      id: sev.value,
      checked: 'on',
    };
  }
);

export const iconByLogType = {
  [DETECTOR_TYPES.AD_LDAP.id]: '\uf2b9',
  [DETECTOR_TYPES.APACHE_ACCESS.id]: '\uf18c',
  [DETECTOR_TYPES.AZURE.id]: '\uf0c2',
  [DETECTOR_TYPES.CLOUD_TRAIL.id]: '\uf1be',
  [DETECTOR_TYPES.DNS.id]: '\uf0ac',
  [DETECTOR_TYPES.GITHUB.id]: '\uf09b',
  [DETECTOR_TYPES.GWORKSPACE.id]: '\uf1a0',
  [DETECTOR_TYPES.M365.id]: '\uf0b1',
  [DETECTOR_TYPES.NETWORK.id]: '\uf0c0',
  [DETECTOR_TYPES.OKTA.id]: '\uf2c2',
  [DETECTOR_TYPES.S3.id]: '\uf0a0',
  [DETECTOR_TYPES.SYSTEM.id]: '\uf1b3',
  [DETECTOR_TYPES.WINDOWS.id]: '\uf109',
};

export const sizeBySeverity = {
  Critical: 65,
  Medium: 50,
  Info: 35,
  Low: 20,
};

export const colorBySeverity = {
  Critical: 'red',
  Medium: 'yellow',
  Info: 'blue',
  Low: 'gray',
};

export const emptyGraphData: CorrelationGraphData = {
  graph: {
    nodes: [],
    edges: [],
  },
  events: {},
};
