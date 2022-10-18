import React, { useState, Fragment, useEffect } from 'react';
import { ruleTypes } from '../../../../../lib/helpers';
import { CustomTable } from '../../Tables/Custom';
import { SigmaTable } from '../../Tables/SIGMA';
import axios from 'axios';
import _ from 'lodash';
import {
  EuiText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFacetGroup,
  EuiFacetButton,
  EuiSpacer,
  EuiPanel,
  EuiCheckbox,
} from '@elastic/eui';

export const Table = () => {
  const [currentTable, setCurrentTable] = useState<string>('AllTable');
  const [checked, setChecked] = useState(false);
  const [applicationRules, setApplicationRules] = useState<any | object>([]);

  useEffect(() => {
    let rulesArray: any = [];
    const loadRules = () => {
      ruleTypes.map((ruleType: any) => {
        const request = {
          url:
            'http://18.237.38.16:80/_plugins/_security_analytics/rules/_search?pre_packaged=true',
          method: 'POST',
          data: {
            from: 0,
            size: 2500,
            query: {
              nested: {
                path: 'rule',
                query: {
                  bool: {
                    must: [{ match: { 'rule.category': ruleType } }],
                  },
                },
              },
            },
          },
        };
        axios(request).then((res) => {
          let data: any = [];
          res.data.hits.hits.forEach((rule: any) => {
            data.push(rule._source);
          });
          rulesArray.push(data);
        });
      });
    };
    const setRules = () => {
      setApplicationRules(rulesArray);
    };
    loadRules();
    setRules();
  }, []);

  const onChange = (e: any) => {
    setChecked(e.target.checked);
    // setCurrentTable(`${facet.label}Table`)
  };

  const facets = [
    {
      id: 'application',
      label: `Application (${applicationRules.length > 0 ? applicationRules[0].length : ''})`,
      onClick: () => {
        setCurrentTable('ApplicationTable');
      },
    },
    {
      id: 'apt',
      label: `Apt (${applicationRules.length > 0 ? applicationRules[1].length : ''})`,
      onClick: () => {
        setCurrentTable('AptTable');
      },
    },
    {
      id: 'cloud',
      label: `Cloud (${applicationRules.length > 0 ? applicationRules[2].length : ''})`,
      onClick: () => {
        setCurrentTable('CloudTable');
      },
    },
    {
      id: 'compliance',
      label: `Compliance (${applicationRules.length > 0 ? applicationRules[3].length : ''})`,
      onClick: () => {
        setCurrentTable('ComplianceTable');
      },
    },
    {
      id: 'linux',
      label: `Linux (${applicationRules.length > 0 ? applicationRules[4].length : ''})`,
      onClick: () => {
        setCurrentTable('LinuxTable');
      },
    },
    {
      id: 'macos',
      label: `macOS (${applicationRules.length > 0 ? applicationRules[5].length : ''})`,
      onClick: () => {
        setCurrentTable('macOSTable');
      },
    },
    {
      id: 'network',
      label: `Network (${applicationRules.length > 0 ? applicationRules[6].length : ''})`,
      onClick: () => {
        setCurrentTable('NetworkTable');
      },
    },
    {
      id: 'proxy',
      label: `Proxy (${applicationRules.length > 0 ? applicationRules[7].length : ''})`,
      onClick: () => {
        setCurrentTable('ProxyTable');
      },
    },
    {
      id: 'web',
      label: `Web (${applicationRules.length > 0 ? applicationRules[8].length : ''})`,
      onClick: () => {
        setCurrentTable('WebTable');
      },
    },
    // {
    //   id: 'windows',
    //   label: `Windows (${applicationRules.length > 0 ? applicationRules[9].length : ''})`,
    //   onClick: () => {
    //     setCurrentTable('WindowsTable');
    //   },
    // },
    {
      id: 'custom',
      label: `Custom`,
      onClick: () => {
        setCurrentTable('CustomTable');
      },
    },
  ];

  const tableSwitch = () => {
    switch (currentTable) {
      case 'AllTable':
        return <SigmaTable />;
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
              <h3>Filter</h3>
            </EuiText>
            <EuiSpacer />
            <EuiFacetGroup>
              <h2>Rule type</h2>
              {facets.map((facet) => {
                return (
                  <EuiFacetButton key={facet.id} id={facet.id} onClick={facet.onClick}>
                    <EuiCheckbox
                      id={facet.id}
                      label={facet.label}
                      checked={checked}
                      onChange={(e) => onChange(e)}
                    />
                  </EuiFacetButton>
                );
              })}
            </EuiFacetGroup>
          </EuiFlexItem>
          <EuiFlexItem grow={5}>
            {/* <EuiText>
              <h1>{`${currentTable.replace('Table', '')} Rules`}</h1>
            </EuiText>
            <EuiSpacer /> */}
            {/* {applicationRules.length < 10 && <div>Loading Rules</div>} */}
            {applicationRules.length > 0 && <div>{tableSwitch()}</div>}
            <EuiSpacer />
            <div style={{ display: 'flex', justifyContent: 'center' }}></div>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiPanel>
    </Fragment>
  );
};
