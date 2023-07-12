/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import Graph, { Edge, GraphEvents, Network, Node, Options } from 'react-graph-vis';
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
  getNetwork: (network: Network) => void;
}

export const CorrelationGraph: React.FC<CorrelationGraphProps> = ({
  graph: { nodes, edges },
  options,
  events,
  loadingData,
  getNetwork,
}) => {
  return loadingData ? (
    <div style={{ margin: '75px 47%' }}>
      <EuiLoadingChart size="xl" className="chart-view-container-loading" />
    </div>
  ) : (
    <Graph
      key={`network`}
      identifier={`sa-correlations-network`}
      graph={{ nodes, edges }}
      options={options}
      events={events}
      style={{ backgroundColor: '#ffffff' }}
      getNetwork={getNetwork}
    />
  );
};
