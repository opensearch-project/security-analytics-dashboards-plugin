/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useContext, useState, useRef } from 'react';
import { ThreatIntelSourceItem } from '../../../../../types';
import { RouteComponentProps } from 'react-router-dom';
import { BREADCRUMBS, DEFAULT_EMPTY_DATA, ROUTES } from '../../../../utils/constants';
import { useEffect } from 'react';
import { CoreServicesContext } from '../../../../components/core_services';
import {
  EuiButton,
  EuiButtonIcon,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiLoadingContent,
  EuiPanel,
  EuiSpacer,
  EuiTabbedContent,
  EuiTabbedContentTab,
  EuiTitle,
  EuiToolTip,
} from '@elastic/eui';
import { DescriptionGroup } from '../../../../components/Utility/DescriptionGroup';
import { IoCsTable } from '../../components/IoCsTable/IoCsTable';
import { ThreatIntelSourceDetails } from '../../components/ThreatIntelSourceDetails/ThreatIntelSourceDetails';
import { IocLabel } from '../../../../../common/constants';
import { ThreatIntelService } from '../../../../services';
import {
  errorNotificationToast,
  parseSchedule,
  renderTime,
  setBreadcrumbs,
} from '../../../../utils/helpers';
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
  const refreshHandler = useRef(() => {});
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

  useEffect(() => {
    const baseCrumbs = [BREADCRUMBS.THREAT_INTEL_OVERVIEW];
    setBreadcrumbs(
      !source
        ? baseCrumbs
        : [...baseCrumbs, BREADCRUMBS.THREAT_INTEL_SOURCE_DETAILS(source.name, sourceId)]
    );
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
      content: (
        <IoCsTable
          sourceId={source?.id}
          threatIntelService={threatIntelService}
          registerRefreshHandler={(handler) => {
            refreshHandler.current = handler;
          }}
        />
      ),
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
      refreshHandler.current?.();
    }
  };

  const toggleActiveState = async () => {
    const updateRes = await threatIntelService.updateThreatIntelSource(source.id, {
      ...source,
      enabled_for_scan: !source.enabled_for_scan,
    });
    if (updateRes.ok) {
      onSourceUpdate();
    }
  };

  const {
    name,
    description,
    type,
    ioc_types,
    last_update_time,
    enabled,
    enabled_for_scan,
  } = source;
  const schedule = type === 'S3_CUSTOM' ? source.schedule : undefined;
  const showActivateControls = 'enabled_for_scan' in source;

  return (
    <>
      <EuiFlexGroup alignItems="flexStart">
        <EuiFlexItem>
          <EuiTitle>
            <h2>{name}</h2>
          </EuiTitle>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiFlexGroup alignItems="center" wrap>
            {showActivateControls && (
              <>
                <EuiFlexItem grow={false}>
                  <EuiToolTip
                    content={
                      'When Active, the indicators of compromise from this source are used to scan the log data as part of the threat intel scan.'
                    }
                  >
                    <span>
                      <EuiIcon
                        type={'dot'}
                        color={enabled_for_scan ? 'success' : 'text'}
                        style={{ marginBottom: 4 }}
                      />{' '}
                      {enabled_for_scan ? 'Active' : 'Inactive'}&nbsp;
                      <EuiIcon type={'iInCircle'} />
                    </span>
                  </EuiToolTip>
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiButton
                    color={enabled_for_scan ? 'danger' : 'primary'}
                    onClick={toggleActiveState}
                  >
                    {enabled_for_scan ? 'Deactivate' : 'Activate'}
                  </EuiButton>
                </EuiFlexItem>
              </>
            )}
            {type === 'S3_CUSTOM' && (
              <EuiFlexItem grow={false}>
                <EuiButton fill onClick={onRefresh}>
                  Refresh
                </EuiButton>
              </EuiFlexItem>
            )}
            <EuiFlexItem grow={false}>
              <EuiToolTip content={'Delete'}>
                <EuiButtonIcon iconType={'trash'} color="danger" onClick={onDeleteButtonClick} />
              </EuiToolTip>
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
                : 'N/A',
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
          confirmButtonText="Delete"
          additionalWarning="You can also deactivate this source temporarily and reactivate later. 
          Cancel to exit and then choose Deactivate."
        />
      )}
    </>
  );
};
