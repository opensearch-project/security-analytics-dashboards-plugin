/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Graph from 'react-graph-vis';
import 'vis-network/dist/dist/vis-network.min.css';
import { loadFontAwesome } from '../utils/loadFonts';

export const CorrelationGraph = ({ graph: { nodes, edges }, options, events }) => {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [filteredNodes, setFilteredNodes] = useState(nodes);
  const [graphVersion, setGraphVersion] = useState(0);

  useEffect(() => {
    setFilteredNodes(nodes);
  }, [nodes]);
  useEffect(() => {
    setGraphVersion(graphVersion + 1);
  }, [filteredNodes]);

  useEffect(() => {
    loadFontAwesome().then(() => {
      setFontsLoaded(true);
    });
  }, []);

  return fontsLoaded ? (
    <Graph
      key={`network-${graphVersion}`}
      identifier={`network-${graphVersion}`}
      graph={{ nodes: filteredNodes, edges }}
      options={options}
      events={events}
      style={{ border: '1px solid' }}
    />
  ) : (
    <p>Loading...</p>
  );
};
