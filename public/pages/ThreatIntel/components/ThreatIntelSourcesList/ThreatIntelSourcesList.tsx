/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  EuiBadge,
  EuiButton,
  EuiButtonEmpty,
  EuiCard,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiPanel,
  EuiSpacer,
  EuiTitle,
} from '@elastic/eui';
import { ROUTES } from '../../../../utils/constants';
import { ThreatIntelSourceItem } from '../../../../../types';
import { RouteComponentProps } from 'react-router-dom';

export interface ThreatIntelSourcesListProps {
  threatIntelSources: ThreatIntelSourceItem[];
  history: RouteComponentProps['history'];
}

export const ThreatIntelSourcesList: React.FC<ThreatIntelSourcesListProps> = ({
  threatIntelSources,
  history,
}) => {
  return (
    <EuiPanel>
      <EuiSpacer size="m" />
      <EuiFlexGroup>
        <EuiFlexItem>
          <EuiTitle size="s">
            <h4>Threat intelligence sources ({threatIntelSources.length})</h4>
          </EuiTitle>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiButton
            onClick={() => {
              history.push({
                pathname: ROUTES.THREAT_INTEL_ADD_CUSTOM_SOURCE,
              });
            }}
          >
            Add threat intel source
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiSpacer />
      <EuiFlexGroup>
        {threatIntelSources.map((source) => {
          return (
            <EuiFlexItem style={{ maxWidth: 350 }}>
              <EuiCard
                // icon={source.icon}
                title={source.feedName}
                description={source.description}
                footer={
                  <>
                    <EuiButtonEmpty
                      onClick={() => {
                        history.push({
                          pathname: `${ROUTES.THREAT_INTEL_SOURCE_DETAILS}/hello`,
                        });
                      }}
                      iconType={'iInCircle'}
                    >
                      More details
                    </EuiButtonEmpty>
                    <EuiSpacer size="m" />
                    {source.isEnabled ? (
                      <>
                        <EuiIcon
                          type={'dot'}
                          color={source.isEnabled ? 'success' : 'text'}
                          style={{ marginBottom: 4 }}
                        />{' '}
                        Active
                      </>
                    ) : (
                      <EuiButton style={{ width: '100%' }}>Activate</EuiButton>
                    )}
                  </>
                }
              >
                {source.iocTypes.map((iocType) => (
                  <EuiBadge>{iocType}</EuiBadge>
                ))}
              </EuiCard>
            </EuiFlexItem>
          );
        })}
      </EuiFlexGroup>
    </EuiPanel>
  );
};
