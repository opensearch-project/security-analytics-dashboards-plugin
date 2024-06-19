/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useContext, useMemo, useState } from 'react';
import { ThreatIntelSourceItem, dummySource } from '../../../../../types';
import { RouteComponentProps } from 'react-router-dom';
import { BREADCRUMBS, ROUTES } from '../../../../utils/constants';
import { useEffect } from 'react';
import { CoreServicesContext } from '../../../../components/core_services';
import {
  EuiButton,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiLoadingContent,
  EuiPanel,
  EuiSpacer,
  EuiTabbedContent,
  EuiTabbedContentTab,
  EuiTitle,
} from '@elastic/eui';
import { DescriptionGroup } from '../../../../components/Utility/DescriptionGroup';
import { IoCstable } from '../../components/IoCsTable/IoCsTable';
import { ThreatIntelSourceDetails } from '../../components/ThreatIntelSourceDetails/ThreatIntelSourceDetails';

export interface ThreatIntelSource
  extends RouteComponentProps<any, any, { source?: ThreatIntelSourceItem }> {}

export const ThreatIntelSource: React.FC<ThreatIntelSource> = ({ location: { state } }) => {
  const context = useContext(CoreServicesContext);
  const [source, setSource] = useState<ThreatIntelSourceItem | undefined>(state?.source);

  useEffect(() => {
    const sourceId = location.pathname.replace(`${ROUTES.THREAT_INTEL_SOURCE_DETAILS}/`, '');

    if (sourceId) {
      const getSource = async () => {
        setSource(dummySource);
      };

      getSource();
    }
  }, []);

  useEffect(() => {
    const baseCrumbs = [BREADCRUMBS.SECURITY_ANALYTICS, BREADCRUMBS.THREAT_INTEL_OVERVIEW];

    context?.chrome.setBreadcrumbs(
      !source
        ? baseCrumbs
        : [...baseCrumbs, BREADCRUMBS.THREAT_INTEL_SOURCE_DETAILS(source.feedName, source.id)]
    );
  }, [source]);

  const tabs: EuiTabbedContentTab[] = useMemo(
    () => [
      {
        id: 'iocs',
        name: <span>Indicators of Compromise</span>,
        content: <IoCstable />,
      },
      {
        id: 'source-details',
        name: <span>Source details</span>,
        content: <ThreatIntelSourceDetails />,
      },
    ],
    []
  );

  if (!source) {
    return <EuiLoadingContent />;
  }

  const { feedName, isEnabled, description } = source;

  return (
    <>
      <EuiFlexGroup alignItems="flexStart">
        <EuiFlexItem>
          <EuiTitle>
            <h2>{feedName}</h2>
          </EuiTitle>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiFlexGroup alignItems="center">
            <EuiFlexItem grow={false}>
              <span>
                <EuiIcon
                  type={'dot'}
                  color={isEnabled ? 'success' : 'text'}
                  style={{ marginBottom: 4 }}
                />{' '}
                {isEnabled ? 'Active' : 'Inactive'}
              </span>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiButton>{isEnabled ? 'Deactivate' : 'Activate'}</EuiButton>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiButton fill>Refresh</EuiButton>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiSpacer />
      <EuiPanel>
        <DescriptionGroup
          listItems={[
            {
              title: 'Description',
              description: description,
            },
          ]}
        />
        <EuiSpacer size="xl" />
        <DescriptionGroup
          listItems={[
            { title: 'Type', description: description },
            { title: 'Refresh schedule', description: description },
            { title: 'Last updated', description: description },
            { title: 'Ioc types', description: description },
          ]}
        />
      </EuiPanel>
      <EuiSpacer />
      <EuiTabbedContent tabs={tabs} initialSelectedTab={tabs[0]} />
    </>
  );
};
