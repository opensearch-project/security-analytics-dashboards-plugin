/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 *
 * Modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
 */

import React, { Component } from 'react';

import { EuiButtonIcon, EuiPopover, EuiContextMenu, EuiPopoverTitle } from '@elastic/eui';

function flattenPanelTree(tree: any, array = []) {
  array.push(tree);

  if (tree.items) {
    tree.items.forEach((item: any) => {
      if (item.panel) {
        flattenPanelTree(item.panel, array);
        item.panel = item.panel.id;
      }
    });
  }

  return array;
}

interface GlobalFilterOptionsProps {}

interface GlobalFilterOptionsState {
  isPopoverOpen: boolean;
}

export default class GlobalFilterOptions extends Component<
  GlobalFilterOptionsProps,
  GlobalFilterOptionsState
> {
  constructor(props: GlobalFilterOptionsProps) {
    super(props);

    this.state = {
      isPopoverOpen: false,
    };
  }

  togglePopover = () => {
    this.setState({ isPopoverOpen: !this.state.isPopoverOpen });
  };

  closePopover = () => {
    this.setState({ isPopoverOpen: false });
  };

  render() {
    const { isPopoverOpen } = this.state;
    const panelTree = {
      id: 0,
      items: [
        {
          name: 'Enable all',
          icon: 'eye',
          onClick: () => {
            this.closePopover();
          },
        },
        {
          name: 'Disable all',
          icon: 'eyeClosed',
          onClick: () => {
            this.closePopover();
          },
        },
        {
          name: 'Pin all',
          icon: 'pin',
          onClick: () => {
            this.closePopover();
          },
        },
        {
          name: 'Unpin all',
          icon: 'pin',
          onClick: () => {
            this.closePopover();
          },
        },
        {
          name: 'Invert inclusion',
          icon: 'invert',
          onClick: () => {
            this.closePopover();
          },
        },
        {
          name: 'Invert visibility',
          icon: 'eye',
          onClick: () => {
            this.closePopover();
          },
        },
        {
          name: 'Remove all',
          icon: 'trash',
          onClick: () => {
            this.closePopover();
          },
        },
      ],
    };
    return (
      <EuiPopover
        isOpen={isPopoverOpen}
        closePopover={this.closePopover}
        button={
          <EuiButtonIcon
            onClick={this.togglePopover}
            color="text"
            iconType="filter"
            aria-label="Change all filters"
            title="Change all filters"
          />
        }
        anchorPosition="downCenter"
        panelPaddingSize="none"
      >
        <EuiPopoverTitle paddingSize="s">Change all filters</EuiPopoverTitle>
        <EuiContextMenu initialPanelId={0} panels={flattenPanelTree(panelTree)} />
      </EuiPopover>
    );
  }
}
