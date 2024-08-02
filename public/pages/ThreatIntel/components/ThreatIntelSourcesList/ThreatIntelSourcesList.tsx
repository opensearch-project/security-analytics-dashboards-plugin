/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  EuiBadge,
  EuiSmallButton,
  EuiSmallButtonEmpty,
  EuiCard,
  EuiEmptyPrompt,
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
import { IocLabel } from '../../../../../common/constants';

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
        {threatIntelSources.length > 0 && (
          <EuiFlexItem grow={false}>
            <EuiSmallButton
              onClick={() => {
                history.push({
                  pathname: ROUTES.THREAT_INTEL_ADD_CUSTOM_SOURCE,
                });
              }}
            >
              Add threat intel source
            </EuiSmallButton>
          </EuiFlexItem>
        )}
      </EuiFlexGroup>
      <EuiSpacer />
      <EuiFlexGroup wrap>
        {threatIntelSources.map((source, idx) => {
          return (
            <EuiFlexItem key={idx} style={{ minWidth: 350, maxWidth: 350 }}>
              <EuiCard
                // icon={source.icon}
                title={source.name}
                description={source.description}
                footer={
                  <>
                    <EuiSmallButtonEmpty
                      onClick={() => {
                        history.push({
                          pathname: `${ROUTES.THREAT_INTEL_SOURCE_DETAILS}/${source.id}`,
                          state: { source },
                        });
                      }}
                      iconType={'iInCircle'}
                    >
                      More details
                    </EuiSmallButtonEmpty>
                    <EuiSpacer size="m" />
                    {source.enabled && (
                      <>
                        <EuiIcon
                          type={'dot'}
                          color={source.enabled ? 'success' : 'text'}
                          style={{ marginBottom: 4 }}
                        />{' '}
                        Active
                      </>
                    )}
                  </>
                }
              >
                {source.ioc_types.map((iocType) => (
                  <EuiBadge key={iocType}>{IocLabel[iocType]}</EuiBadge>
                ))}
              </EuiCard>
            </EuiFlexItem>
          );
        })}
      </EuiFlexGroup>
      {threatIntelSources.length === 0 && (
        <EuiEmptyPrompt
          title={<h3>No threat intel source present</h3>}
          actions={[
            <EuiSmallButton
              fill
              onClick={() => {
                history.push({
                  pathname: ROUTES.THREAT_INTEL_ADD_CUSTOM_SOURCE,
                });
              }}
            >
              Add threat intel source
            </EuiSmallButton>,
          ]}
        />
      )}
    </EuiPanel>
  );
};
