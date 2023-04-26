/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import Graph, { Edge, GraphEvents, Node, Options } from 'react-graph-vis';
import 'vis-network/dist/dist/vis-network.min.css';
import { EuiLoadingChart } from '@elastic/eui';

interface CorrelationGraphProps {
  loadingData: boolean;
  graph: {
    nodes: Node[];
    edges: Edge[];
  };
  options: Options;
  events: GraphEvents;
}

export const CorrelationGraph: React.FC<CorrelationGraphProps> = ({
  graph: { nodes, edges },
  options,
  events,
  loadingData,
}) => {
  return loadingData ? (
    <div style={{ padding: '0 47%' }}>
      <EuiLoadingChart size="xl" className="chart-view-container-loading" />
    </div>
  ) : (
    <Graph
      key={`network`}
      identifier={`network`}
      graph={{ nodes, edges }}
      options={options}
      events={events}
      style={{ border: '1px solid' }}
    />
  );
};
