import React, { useState, Fragment, useReducer } from 'react';
import { initialState, reducer } from '../../../../../state-management';
import { ApplicationTable } from './applicationTable';
import { AptTable } from './aptTable';
import { CloudTable } from './cloudTable';
import { ComplianceTable } from './complianceTable';
import { LinuxTable } from './linuxTable';
import { MacOSTable } from './macosTable';
import { NetworkTable } from './NetworkTable';
import { ProxyTable } from './ProxyTable';
import { WebTable } from './webTable';
import { AllTable } from './viewAllTable';
import { WindowsTable } from './windowsTable';
import { CustomTable } from './customTable';
import _ from 'lodash';
import {
  EuiText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFacetGroup,
  EuiFacetButton,
  EuiSpacer,
  EuiPanel,
} from '@elastic/eui';

export const Tables = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [currentTable, setCurrentTable] = useState<string>('AllTable');

  const facets = [
    {
      id: 'application',
      label: `Application (${initialState.applicationRules.length})`,
      onClick: () => {
        setCurrentTable('ApplicationTable');
      },
    },
    {
      id: 'apt',
      label: `Apt (${initialState.aptRules.length})`,
      onClick: () => {
        setCurrentTable('AptTable');
      },
    },
    {
      id: 'cloud',
      label: `Cloud (${initialState.cloudRules.length})`,
      onClick: () => {
        setCurrentTable('CloudTable');
      },
    },
    {
      id: 'compliance',
      label: `Compliance (${initialState.complianceRules.length})`,
      onClick: () => {
        setCurrentTable('ComplianceTable');
      },
    },
    {
      id: 'linux',
      label: `Linux (${initialState.linuxRules.length})`,
      onClick: () => {
        setCurrentTable('LinuxTable');
      },
    },
    {
      id: 'macos',
      label: `macOS (${initialState.macosRules.length})`,
      onClick: () => {
        setCurrentTable('macOSTable');
      },
    },
    {
      id: 'network',
      label: `Network (${initialState.networkRules.length})`,
      onClick: () => {
        setCurrentTable('NetworkTable');
      },
    },
    {
      id: 'proxy',
      label: `Proxy (${initialState.proxyRules.length})`,
      onClick: () => {
        setCurrentTable('ProxyTable');
      },
    },
    {
      id: 'web',
      label: `Web (${initialState.webRules.length})`,
      onClick: () => {
        setCurrentTable('WebTable');
      },
    },
    {
      id: 'windows',
      label: `Windows (${initialState.windowsRules.length})`,
      onClick: () => {
        setCurrentTable('WindowsTable');
      },
    },
    {
      id: 'custom',
      label: `Custom (${initialState.customRules.length})`,
      onClick: () => {
        setCurrentTable('CustomTable');
      },
    },
  ];

  const tableSwitch = () => {
    switch (currentTable) {
      case 'AllTable':
        return <AllTable rules={initialState.rules} />;
      case 'ApplicationTable':
        return <ApplicationTable />;
      case 'AptTable':
        return <AptTable />;
      case 'CloudTable':
        return <CloudTable />;
      case 'ComplianceTable':
        return <ComplianceTable />;
      case 'LinuxTable':
        return <LinuxTable />;
      case 'macOSTable':
        return <MacOSTable />;
      case 'NetworkTable':
        return <NetworkTable />;
      case 'ProxyTable':
        return <ProxyTable />;
      case 'WebTable':
        return <WebTable />;
      case 'WindowsTable':
        return <WindowsTable />;
      case 'CustomTable':
        return <CustomTable />;
    }
  };

  return (
    <Fragment>
      <EuiPanel paddingSize="l">
        <EuiFlexGroup>
          <EuiFlexItem grow={1}>
            <EuiText
              grow={false}
              onClick={() => setCurrentTable('AllTable')}
              style={{ cursor: 'pointer' }}
            >
              <h4>View all rules ({initialState.rules.length})</h4>
            </EuiText>
            <EuiSpacer />
            <EuiFacetGroup>
              {facets.map((facet) => {
                return (
                  <EuiFacetButton key={facet.id} id={facet.id} onClick={facet.onClick}>
                    {facet.label}
                  </EuiFacetButton>
                );
              })}
            </EuiFacetGroup>
          </EuiFlexItem>
          <EuiFlexItem grow={5}>
            <EuiText>
              <h1>{`${currentTable.replace('Table', '')} Rules`}</h1>
            </EuiText>
            <EuiSpacer />
            {tableSwitch()}
            <EuiSpacer />
            <div style={{ display: 'flex', justifyContent: 'center' }}></div>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiPanel>
    </Fragment>
  );
};
