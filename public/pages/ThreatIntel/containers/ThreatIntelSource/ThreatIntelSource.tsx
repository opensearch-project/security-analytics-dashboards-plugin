/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useContext, useState } from 'react';
import { ThreatIntelIocData, ThreatIntelSourceItem } from '../../../../../types';
import { RouteComponentProps } from 'react-router-dom';
import { BREADCRUMBS, DEFAULT_EMPTY_DATA, ROUTES } from '../../../../utils/constants';
import { useEffect } from 'react';
import { CoreServicesContext } from '../../../../components/core_services';
import {
  EuiButton,
  EuiFlexGroup,
  EuiFlexItem,
  EuiLoadingContent,
  EuiPanel,
  EuiSpacer,
  EuiTabbedContent,
  EuiTabbedContentTab,
  EuiTitle,
} from '@elastic/eui';
import { DescriptionGroup } from '../../../../components/Utility/DescriptionGroup';
import { IoCsTable } from '../../components/IoCsTable/IoCsTable';
import { ThreatIntelSourceDetails } from '../../components/ThreatIntelSourceDetails/ThreatIntelSourceDetails';
import { IocLabel } from '../../../../../common/constants';
import { ThreatIntelService } from '../../../../services';
import { errorNotificationToast, parseSchedule, renderTime } from '../../../../utils/helpers';
import DeleteModal from '../../../../components/DeleteModal';
import { NotificationsStart } from 'opensearch-dashboards/public';

export interface ThreatIntelSource
  extends RouteComponentProps<any, any, { source?: ThreatIntelSourceItem }> {
  threatIntelService: ThreatIntelService;
  notifications: NotificationsStart;
}

export const ThreatIntelSource: React.FC<ThreatIntelSource> = ({
  location,
  history,
  threatIntelService,
  notifications,
}) => {
  const coreContext = useContext(CoreServicesContext);
  const [source, setSource] = useState<ThreatIntelSourceItem | undefined>(location.state?.source);
  const sourceId =
    source?.id ?? location.pathname.replace(`${ROUTES.THREAT_INTEL_SOURCE_DETAILS}/`, '');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [iocs, setIocs] = useState<ThreatIntelIocData[]>([]);
  const [loadingIoCs, setLoadingIoCs] = useState(true);
  const getSource = async (sourceId: string) => {
    const res = await threatIntelService.getThreatIntelSource(sourceId);

    if (res?.ok) {
      setSource(res.response);
    }
  };

  useEffect(() => {
    if (!source && sourceId) {
      getSource(sourceId);
    }
  }, []);

  const getIocs = async () => {
    if (sourceId) {
      setLoadingIoCs(true);
      const iocsRes = await threatIntelService.getThreatIntelIocs({
        feed_ids: sourceId,
      });

      if (iocsRes.ok) {
        setIocs(iocsRes.response.iocs);
      }
      setLoadingIoCs(false);
    }
  };

  useEffect(() => {
    const baseCrumbs = [BREADCRUMBS.SECURITY_ANALYTICS, BREADCRUMBS.THREAT_INTEL_OVERVIEW];

    coreContext?.chrome.setBreadcrumbs(
      !source
        ? baseCrumbs
        : [...baseCrumbs, BREADCRUMBS.THREAT_INTEL_SOURCE_DETAILS(source.name, sourceId)]
    );

    getIocs();
  }, [source]);

  if (!source) {
    return <EuiLoadingContent />;
  }

  const onSourceUpdate = () => {
    getSource(sourceId);
  };

  const tabs: EuiTabbedContentTab[] = [
    {
      id: 'iocs',
      name: <span>Indicators of Compromise</span>,
      content: <IoCsTable sourceId={source?.id} iocs={iocs} loadingIoCs={loadingIoCs} />,
    },
    {
      id: 'source-details',
      name: <span>Source details</span>,
      content: (
        <ThreatIntelSourceDetails
          sourceItem={source}
          threatIntelService={threatIntelService}
          onSourceUpdate={onSourceUpdate}
        />
      ),
    },
  ];

  const onDeleteButtonClick = () => {
    setShowDeleteModal(true);
  };

  const onDeleteConfirmed = async () => {
    const res = await threatIntelService.deleteThreatIntelSource(sourceId);

    if (res.ok) {
      history.push({
        pathname: ROUTES.THREAT_INTEL_OVERVIEW,
      });
    }
  };

  const onRefresh = async () => {
    const res = await threatIntelService.refreshThreatIntelSource(sourceId);
    if (!res.ok) {
      errorNotificationToast(notifications, 'refresh', 'source', res.error);
    } else {
      getIocs();
    }
  };

  const { name, description, type, ioc_types, last_update_time, enabled } = source;
  const schedule = type === 'S3_CUSTOM' ? source.schedule : undefined;

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
            {type === 'S3_CUSTOM' && (
              <EuiFlexItem grow={false}>
                <EuiButton fill onClick={onRefresh}>
                  Refresh
                </EuiButton>
              </EuiFlexItem>
            )}
            <EuiFlexItem grow={false}>
              <EuiButton color="danger" onClick={onDeleteButtonClick}>
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
              description: schedule
                ? enabled
                  ? parseSchedule({
                      period: {
                        interval: schedule.interval.period,
                        unit: schedule.interval.unit.toUpperCase(),
                      },
                    })
                  : 'Download on demand'
                : 'File uploaded',
            },
            {
              title: 'Last updated',
              description: renderTime(last_update_time),
            },
            { title: 'Ioc types', description: ioc_types.map((ioc) => IocLabel[ioc]).join(', ') },
          ]}
        />
      </EuiPanel>
      <EuiSpacer />
      <EuiTabbedContent tabs={tabs} initialSelectedTab={tabs[0]} />
      {showDeleteModal && (
        <DeleteModal
          type="threat intel source"
          closeDeleteModal={() => {
            setShowDeleteModal(false);
          }}
          ids={source.name}
          onClickDelete={onDeleteConfirmed}
          confirmation
        />
      )}
    </>
  );
};
