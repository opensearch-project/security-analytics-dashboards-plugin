/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useContext, useState } from 'react';
import { ThreatIntelSourceItem } from '../../../../../types';
import { RouteComponentProps } from 'react-router-dom';
import { BREADCRUMBS, DEFAULT_EMPTY_DATA, ROUTES } from '../../../../utils/constants';
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
import { IocLabel } from '../../../../../common/constants';
import { ThreatIntelService } from '../../../../services';
import { parseSchedule } from '../../../../utils/helpers';
import moment from 'moment';

export interface ThreatIntelSource
  extends RouteComponentProps<any, any, { source?: ThreatIntelSourceItem }> {
  threatIntelService: ThreatIntelService;
}

export const ThreatIntelSource: React.FC<ThreatIntelSource> = ({
  history,
  location,
  threatIntelService,
}) => {
  const coreContext = useContext(CoreServicesContext);
  const [source, setSource] = useState<ThreatIntelSourceItem | undefined>(location.state?.source);

  useEffect(() => {
    const sourceId = location.pathname.replace(`${ROUTES.THREAT_INTEL_SOURCE_DETAILS}/`, '');
    if (!source && sourceId) {
      const searchSources = async () => {
        const res = await threatIntelService.getThreatIntelSource(sourceId);

        if (res?.ok) {
          setSource(res.response);
        }
      };

      searchSources();
    }
  }, []);

  useEffect(() => {
    const baseCrumbs = [BREADCRUMBS.SECURITY_ANALYTICS, BREADCRUMBS.THREAT_INTEL_OVERVIEW];

    coreContext?.chrome.setBreadcrumbs(
      !source
        ? baseCrumbs
        : [...baseCrumbs, BREADCRUMBS.THREAT_INTEL_SOURCE_DETAILS(source.name, source.id)]
    );
  }, [source]);

  if (!source) {
    return <EuiLoadingContent />;
  }

  const tabs: EuiTabbedContentTab[] = [
    {
      id: 'iocs',
      name: <span>Indicators of Compromise</span>,
      content: <IoCstable sourceId={source?.id} />,
    },
    {
      id: 'source-details',
      name: <span>Source details</span>,
      content: (
        <ThreatIntelSourceDetails
          sourceItem={source}
          history={history}
          threatIntelService={threatIntelService}
        />
      ),
    },
  ];

  const onDelete = () => {};

  const { name, enabled, description, type, ioc_types, schedule, last_update_time } = source;

  return (
    <>
      <EuiFlexGroup alignItems="flexStart">
        <EuiFlexItem>
          <EuiTitle>
            <h2>{name}</h2>
          </EuiTitle>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiFlexGroup alignItems="center">
            <EuiFlexItem grow={false}>
              <span>
                <EuiIcon
                  type={'dot'}
                  color={enabled ? 'success' : 'text'}
                  style={{ marginBottom: 4 }}
                />{' '}
                {enabled ? 'Active' : 'Inactive'}
              </span>
            </EuiFlexItem>
            {enabled && (
              <EuiFlexItem grow={false}>
                <EuiButton fill>Refresh</EuiButton>
              </EuiFlexItem>
            )}
            <EuiFlexItem grow={false}>
              <EuiButton color="danger" onClick={onDelete}>
                Delete
              </EuiButton>
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
              description: description || DEFAULT_EMPTY_DATA,
            },
          ]}
        />
        <EuiSpacer size="xl" />
        <DescriptionGroup
          listItems={[
            { title: 'Type', description: type },
            {
              title: 'Refresh schedule',
              description: parseSchedule({
                period: {
                  interval: schedule.interval.period,
                  unit: schedule.interval.unit.toUpperCase(),
                },
              }),
            },
            {
              title: 'Last updated',
              description: moment(last_update_time).format('YYYY-MM-DDTHH:mm'),
            },
            { title: 'Ioc types', description: ioc_types.map((ioc) => IocLabel[ioc]).join(', ') },
          ]}
        />
      </EuiPanel>
      <EuiSpacer />
      <EuiTabbedContent tabs={tabs} initialSelectedTab={tabs[0]} />
    </>
  );
};
