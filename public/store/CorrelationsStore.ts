/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  CorrelationFinding,
  CorrelationGraphData,
  CorrelationGraphEventHandler,
  CorrelationGraphUpdateHandler,
  CorrelationLevelInfo,
  CorrelationRule,
  CorrelationsLevel,
  ICorrelationsStore,
} from '../../types';
import { DETECTOR_TYPES } from '../pages/Detectors/utils/constants';
import { euiPaletteColorBlind } from '@elastic/eui';
import { FilterItem } from '../pages/Correlations/components/LogTypeFilterGroup';
import 'font-awesome/css/font-awesome.min.css';
import { iconByLogType } from '../pages/Correlations/utils/constants';

class ColorProvider {
  // private palette = euiPaletteColorBlindBehindText({ sortBy: 'natural' });
  private palette = euiPaletteColorBlind({ sortBy: 'natural' });
  private currentPos: number = 0;
  public colorByLogType: { [logType: string]: string } = {};

  constructor() {
    Object.values(DETECTOR_TYPES).forEach((type) => {
      this.colorByLogType[type.id] = this.next();
    });
  }

  public getColor(logType: string) {
    return this.colorByLogType[logType] || this.next();
  }

  private next() {
    this.currentPos = (this.currentPos + 1) % this.palette.length;
    return this.palette[this.currentPos];
  }
}

class DummyCorrelationDataProvider {
  private generatedPairs: Set<string> = new Set();
  // private severities: ('Critical' | 'Medium' | 'Info' | 'Low')[] = [
  //   'Critical',
  //   'Medium',
  //   'Info',
  //   'Low',
  // ];

  public generateDummyFindings() {
    const now = new Date();
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(now.getDate() - 3);
    // const startTime = threeDaysAgo.getTime();
    // const diff = now.getTime() - startTime;

    // const eachLogtypeCount = {};
    const findings: { [id: string]: CorrelationFinding } = {};
    Object.values(DETECTOR_TYPES).forEach((type) => {
      const findingCount = Math.ceil(15 * Math.random());
      for (let i = 1; i <= findingCount; i++) {
        const id = `${type.id}-${i}`;
        // const id = `${type.id.charAt(0)}${type.id.charAt(type.id.length - 1)}-${i}`;
        findings[id] = {
          logType: type.id,
          // timestamp: startTime + Math.floor(Math.random() * diff),
          id,
          correlationScore: Math.round(Math.random() * 100) / 100,
          // name: id,
          // rule: {
          //   name: 'Sample rule',
          //   severity: this.severities[Math.floor(Math.random() * 4)],
          // },
        };
      }
    });

    return findings;
  }

  public generateDummyCorrelations(findings: { [id: string]: { logType: string } }) {
    this.generatedPairs = new Set();
    const findingIds = Object.keys(findings);
    const totalFindings = findingIds.length;
    const correlations: { [finding: string]: string[] } = {};
    let correlationCount = 0;

    while (correlationCount < 150) {
      while (true) {
        const pair = this.getNextPair(totalFindings);

        const f1 = findingIds[pair[0]];
        const f2 = findingIds[pair[1]];

        if (findings[f1].logType === findings[f2].logType) {
          continue;
        }

        if (!correlations[f1]) {
          correlations[f1] = [];
        }

        correlations[f1].push(f2);

        if (!correlations[f2]) {
          correlations[f2] = [];
        }

        correlations[f2].push(f1);

        break;
      }

      correlationCount++;
    }

    return correlations;
  }

  private getNextPair(max: number) {
    let next = this.generatePair(max);
    while (this.generatedPairs.has(next)) {
      next = this.generatePair(max);
    }
    this.generatedPairs.add(next);

    const pairIdx = next.split('-');

    return [Number.parseInt(pairIdx[0]), Number.parseInt(pairIdx[1])];
  }

  private generatePair(max: number) {
    const idx1 = Math.floor(Math.random() * max);
    const idx2 = Math.floor(Math.random() * max);

    const small = idx1 < idx2 ? idx1 : idx2;
    const big = idx1 > idx2 ? idx1 : idx2;
    const pair = `${small}-${big}`;

    return pair;
  }
}

export class CorrelationsStore implements ICorrelationsStore {
  private correlationRules: CorrelationRule[] = [
    {
      id: 's3-dns',
      name: 'Correlate S3 and DNS findings',
      queries: [
        {
          logType: 'dns',
          conditions: [
            { name: 'source.ip', value: '1.2.3.4', condition: 'AND' },
            { name: 'EventID', value: '2100', condition: 'AND' },
          ],
          index: 'dns-logs',
        },
        {
          logType: 's3',
          conditions: [{ name: 'src.ip', value: '1.2.3.4', condition: 'AND' }],
          index: 's3-logs',
        },
      ],
    },
    {
      id: 'nw-windows',
      name: 'Correlate Network and Windows findings',
      queries: [
        {
          logType: 'network',
          conditions: [{ name: 'src.ip', value: '172.10.0.0', condition: 'AND' }],
          index: 'network-logs',
        },
        {
          logType: 'Windows',
          conditions: [{ name: 'host', value: '172.10.0.0', condition: 'AND' }],
          index: 'windows-logs',
        },
      ],
    },
    {
      id: 'nw-ad_ldap',
      name: 'Correlate Network and AD_LDAP findings',
      queries: [
        {
          logType: 'network',
          conditions: [{ name: 'src.ip', value: '172.10.0.0', condition: 'AND' }],
          index: 'network-logs',
        },
        {
          logType: DETECTOR_TYPES.AD_LDAP.id,
          conditions: [{ name: 'account.id', value: '13452', condition: 'AND' }],
          index: 'ad_ldap-logs',
        },
      ],
    },
  ];
  private graphUpdateHandlers: CorrelationGraphUpdateHandler[] = [];
  private graphEventHandlers: { [event: string]: CorrelationGraphEventHandler[] } = {};
  private correlationLevelInfo: CorrelationLevelInfo = { level: CorrelationsLevel.AllFindings };
  private colorProvider = new ColorProvider();
  public findings;
  private allCorrelations: { [finding: string]: string[] };
  public correlations: { [finding: string]: string[] };

  constructor() {
    const dataProvider = new DummyCorrelationDataProvider();
    this.findings = dataProvider.generateDummyFindings();
    this.allCorrelations = dataProvider.generateDummyCorrelations(this.findings);
    this.correlations = this.allCorrelations;
  }

  public get colorByLogType() {
    return this.colorProvider.colorByLogType;
  }

  public getCorrelationsGraphData(levelInfo?: CorrelationLevelInfo): CorrelationGraphData {
    const corLevelInfo = levelInfo || this.correlationLevelInfo;
    switch (corLevelInfo.level) {
      case CorrelationsLevel.AllFindings:
        return this.getAllFindingCorrelations(corLevelInfo.logTypeFilterItems);
      case CorrelationsLevel.Finding:
        return this.getFindingSpecificCorrelations(corLevelInfo.findingId);
      default:
        return this.getEmptyCorrelationsData();
    }
  }

  public resetCorrelationsLevel(): void {
    this.correlationLevelInfo = { level: CorrelationsLevel.AllFindings };
  }

  public registerGraphUpdateHandler(handler: CorrelationGraphUpdateHandler): void {
    this.graphUpdateHandlers.push(handler);
  }

  public registerGraphEventHandler(event: string, handler: CorrelationGraphEventHandler): void {
    this.graphEventHandlers[event] = this.graphEventHandlers[event] || [];
    this.graphEventHandlers[event].push(handler);
  }

  public createCorrelationRule(correlationRule: CorrelationRule): void {
    correlationRule.queries.forEach((query) => {
      query.conditions = query.conditions.filter((cond) => !!cond.name);
    });
    this.correlationRules.push(correlationRule);
  }

  public getCorrelationRules(): CorrelationRule[] {
    return this.correlationRules;
  }

  public deleteCorrelationRule(ruleId: string): void {}

  private getAllFindingCorrelations(logTypeFilterItems?: FilterItem[]): CorrelationGraphData {
    const graphData: CorrelationGraphData = {
      level: CorrelationsLevel.AllFindings,
      graph: {
        nodes: [],
        edges: [],
      },
      events: {
        // doubleClick: (params: any) => {
        //   console.log('double click');
        //   console.log(params);
        //   this.correlationLevelInfo = {
        //     level: CorrelationsLevel.Finding,
        //     findingId: params.nodes[0],
        //   };
        //   this.graphUpdateHandlers.forEach((handler) => {
        //     handler(this.getCorrelationsGraphData());
        //   });
        // },
        click: (params: any) => {
          this.graphEventHandlers['click']?.forEach((handler) => {
            handler(params);
          });
        },
      },
    };

    const addedEdges = new Set<string>();
    const createNodeTooltip = (nodeId: string) => {
      const finding = this.findings[nodeId];
      const tooltip = document.createElement('div');

      function createRow(text: string) {
        const row = document.createElement('p');
        row.innerText = text;
        row.style.padding = '5px';
        return row;
      }

      // tooltip.appendChild(createRow(`Finding: ${finding.name}`));
      tooltip.appendChild(createRow(`Log type: ${finding.logType}`));
      // tooltip.appendChild(createRow(`Time: ${new Date(finding.timestamp).toLocaleString()}`));

      return tooltip;
    };

    const filteredCorrelations = this.filterCorrelations(logTypeFilterItems);
    this.correlations = filteredCorrelations;

    Object.entries(filteredCorrelations).forEach((entry) => {
      const logType = this.findings[entry[0]].logType;
      // const severity = this.findings[entry[0]].rule.severity;
      if (
        !logTypeFilterItems ||
        logTypeFilterItems.find((item) => item.id === logType && item.checked === 'on')
      ) {
        graphData.graph.nodes.push(
          this.updateNode(
            {
              id: entry[0],
              value: entry[1].length,
              title: createNodeTooltip(entry[0]),
              shape: 'icon',
              icon: {
                face: "'FontAwesome'",
                code: iconByLogType[logType],
                color: this.colorByLogType[logType],
                // size: sizeBySeverity[severity],
              },
            },
            logType
          )
        );

        entry[1].forEach((connectedNodeId) => {
          if (!addedEdges.has(`${connectedNodeId}-${entry[0]}`)) {
            graphData.graph.edges.push({
              from: entry[0],
              to: connectedNodeId,
              id: `${entry[0]}:${connectedNodeId}`,
              title: `${entry[0]}::${connectedNodeId}`,
            });
            addedEdges.add(`${entry[0]}-${connectedNodeId}`);
          }
        });
      }
    });

    return graphData;
  }

  private filterCorrelations(logTypeFilterItems?: FilterItem[]): { [id: string]: string[] } {
    if (!logTypeFilterItems) {
      return this.allCorrelations;
    }

    const logTypesToInclude = new Set<string>();
    logTypeFilterItems.forEach((item) => {
      if (item.checked) logTypesToInclude.add(item.id);
    });
    const filteredCorr: { [id: string]: string[] } = {};

    Object.entries(this.allCorrelations).forEach((entry) => {
      const finding = entry[0];
      if (logTypesToInclude.has(this.findings[finding].logType)) {
        const correlations: string[] = [];
        entry[1].forEach((correlationId) => {
          if (logTypesToInclude.has(this.findings[correlationId].logType)) {
            correlations.push(correlationId);
          }
        });

        if (correlations.length > 0) {
          filteredCorr[finding] = correlations;
        }
      }
    });

    return filteredCorr;
  }

  private getFindingSpecificCorrelations(id: string): CorrelationGraphData {
    const graphData: CorrelationGraphData = {
      level: CorrelationsLevel.Finding,
      graph: {
        nodes: [],
        edges: [],
      },
      events: {
        doubleClick: (params: any) => {
          console.log('double click');
          console.log(params);
          alert(`Finding pane for ${params.nodes[0]}`);
        },
      },
    };

    const correlationsForFinding = this.allCorrelations[id];
    graphData.graph.nodes.push(this.updateNode({ id, label: id }, this.findings[id].logType, true));
    correlationsForFinding.forEach((connectedId) => {
      graphData.graph.nodes.push(
        this.updateNode(
          { id: connectedId, label: connectedId },
          this.findings[connectedId].logType,
          true
        )
      );
      const correlationScore = Math.round(Math.random() * 100) / 100;
      graphData.graph.edges.push({
        from: id,
        to: connectedId,
        label: `${correlationScore}`,
        width: Math.ceil(6 * correlationScore),
      });
    });

    return graphData;
  }

  private getEmptyCorrelationsData(): CorrelationGraphData {
    return {
      graph: {
        nodes: [],
        edges: [],
      },
      events: {},
      level: CorrelationsLevel.AllFindings,
    };
  }

  private updateNode(node: any, logType: string, alwaysShowLabel: boolean = false) {
    return {
      ...node,
      color: this.colorProvider.getColor(logType),
      scaling: {
        max: 60,
        min: 10,
        label: {
          enabled: true,
          min: 10,
          max: 50,
          maxVisible: 200,
          drawThreshold: alwaysShowLabel ? 5 : 15,
        },
        customScalingFunction: this.customScalingFunction,
      },
    };
  }

  private customScalingFunction = (min: number, max: number, total: number, value: number) => {
    if (max === min) {
      return 0.5;
    }

    const scale = 1 / (max - min);
    return Math.max(0, (value - min) * scale);
  };
}
