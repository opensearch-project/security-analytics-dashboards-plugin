import React, { useState, Fragment } from 'react';
import { initialState } from '../../../../../state-management';
import { CustomTable } from '../../Tables/Custom';
import { SigmaTable } from '../../Tables/SIGMA';

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

export const Table = () => {
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
        return <SigmaTable rules={initialState.rules} />;
      case 'ApplicationTable':
        return <SigmaTable rules={initialState.applicationRules} />;
      case 'AptTable':
        return <SigmaTable rules={initialState.aptRules} />;
      case 'CloudTable':
        return <SigmaTable rules={initialState.cloudRules} />;
      case 'ComplianceTable':
        return <SigmaTable rules={initialState.complianceRules} />;
      case 'LinuxTable':
        return <SigmaTable rules={initialState.linuxRules} />;
      case 'macOSTable':
        return <SigmaTable rules={initialState.macosRules} />;
      case 'NetworkTable':
        return <SigmaTable rules={initialState.networkRules} />;
      case 'ProxyTable':
        return <SigmaTable rules={initialState.proxyRules} />;
      case 'WebTable':
        return <SigmaTable rules={initialState.webRules} />;
      case 'WindowsTable':
        return <SigmaTable rules={initialState.windowsRules} />;
      case 'CustomTable':
        return <CustomTable rules={initialState.customRules} />;
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
            {initialState.rules.length === 0 && <div>Loading Rules</div>}
            {initialState.rules.length > 0 && <div>{tableSwitch()}</div>}

            <EuiSpacer />
            <div style={{ display: 'flex', justifyContent: 'center' }}></div>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiPanel>
    </Fragment>
  );
};
