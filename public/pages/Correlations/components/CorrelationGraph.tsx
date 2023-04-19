/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import Graph from 'react-graph-vis';

export const CorrelationGraph = ({ graph: { nodes, edges }, options, events }) => {
  return (
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
