/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useState, useEffect } from 'react';
import $ from 'jquery';
import Graph from 'react-graph-vis';
import 'vis-network/dist/dist/vis-network.min.css';
import { loadFontAwesome } from '../utils/loadFonts';

// import { DataView, DataSet } from 'vis-data';

export const CorrelationGraph = ({ graph: { nodes, edges }, options, events }) => {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const makeMeMultiSelect = useCallback((container: JQuery<HTMLElement>, network, nodes) => {
    const NO_CLICK = 0;
    const CLICK = 3;
    // const RIGHT_CLICK = 3;

    // Disable default right-click dropdown menu
    container[0].oncontextmenu = () => false;

    // State

    let drag = false,
      DOMRect = {};

    // Selector

    const canvasify = (DOMx, DOMy) => {
      const { x, y } = network.DOMtoCanvas({ x: DOMx, y: DOMy });
      return [x, y];
    };

    const correctRange = (start, end) => (start < end ? [start, end] : [end, start]);

    const selectFromDOMRect = () => {
      const [sX, sY] = canvasify(DOMRect.startX, DOMRect.startY);
      const [eX, eY] = canvasify(DOMRect.endX, DOMRect.endY);
      const [startX, endX] = correctRange(sX, eX);
      const [startY, endY] = correctRange(sY, eY);

      // network.selectNodes();
      const selectedNodes = nodes.reduce((selected, current) => {
        const { x, y } = network.getPositions(current.id)[current.id];
        return startX <= x && x <= endX && startY <= y && y <= endY
          ? selected.concat(current)
          : selected;
      }, []);
      if (selectedNodes.length > 0) {
        setFilteredNodes(selectedNodes);
      }
    };

    // Listeners
    container.off();
    container.on('mousedown', function ({ which, offsetX, offsetY }) {
      // When mousedown, save the initial rectangle state
      if (which === CLICK) {
        Object.assign(DOMRect, {
          startX: offsetX,
          startY: offsetY,
          endX: offsetX,
          endY: offsetY,
        });
        drag = true;
      }
    });

    container.on('mousemove', function ({ which, offsetX, offsetY }) {
      // Make selection rectangle disappear when accidently mouseupped outside 'container'
      if (which === NO_CLICK && drag) {
        drag = false;
        network.redraw();
      }
      // When mousemove, update the rectangle state
      else if (drag) {
        Object.assign(DOMRect, {
          endX: offsetX,
          endY: offsetY,
        });
        network.redraw();
      }
    });

    container.on('mouseup', function ({ which }) {
      // When mouseup, select the nodes in the rectangle
      if (which === CLICK) {
        drag = false;
        network.redraw();
        selectFromDOMRect();
      }
    });

    // Drawer

    network.on('afterDrawing', (ctx) => {
      if (drag) {
        const [startX, startY] = canvasify(DOMRect.startX, DOMRect.startY);
        const [endX, endY] = canvasify(DOMRect.endX, DOMRect.endY);

        ctx.setLineDash([5]);
        ctx.strokeStyle = 'rgba(78, 146, 237, 0.75)';
        ctx.strokeRect(startX, startY, endX - startX, endY - startY);
        ctx.setLineDash([]);
        ctx.fillStyle = 'rgba(151, 194, 252, 0.45)';
        ctx.fillRect(startX, startY, endX - startX, endY - startY);
      }
    });
  }, []);

  const [network, setNetwork] = useState<any>(undefined);
  const [filteredNodes, setFilteredNodes] = useState(nodes);
  const [graphVersion, setGraphVersion] = useState(0);

  useEffect(() => {
    setFilteredNodes(nodes);
  }, [nodes]);
  useEffect(() => {
    setGraphVersion(graphVersion + 1);
  }, [filteredNodes]);
  useEffect(() => {
    const container = $(`#network-${graphVersion}`);
    if (network && container[0]) {
      makeMeMultiSelect(container, network, filteredNodes);
    }
  }, [network, graphVersion]);

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
      getNetwork={(nw) => setNetwork(nw)}
    />
  ) : (
    <p>Loading...</p>
  );
};
