/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiButtonEmpty,
  EuiFlexGrid,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPopover,
  EuiSuperDatePicker,
  EuiTitle,
} from '@elastic/eui';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
  BREADCRUMBS,
  DEFAULT_DATE_RANGE,
  MAX_RECENTLY_USED_TIME_RANGES,
} from '../../../../utils/constants';
import { OverviewProps, OverviewState } from '../../models/interfaces';
import { CoreServicesContext } from '../../../../../public/components/core_services';
import { RecentAlertsWidget } from '../../components/Widgets/RecentAlertsWidget';
import { RecentFindingsWidget } from '../../components/Widgets/RecentFindingsWidget';
import { DetectorsWidget } from '../../components/Widgets/DetectorsWidget';
import { OverviewViewModel, OverviewViewModelActor } from '../../models/OverviewViewModel';
import { ServicesContext } from '../../../../services';
import { Summary } from '../../components/Widgets/Summary';
import { TopRulesWidget } from '../../components/Widgets/TopRulesWidget';
import { GettingStartedPopup } from '../../components/GettingStarted/GettingStartedPopup';
import { getChartTimeUnit } from '../../utils/helpers';

export const Overview: React.FC<OverviewProps> = (props) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [initialLoadingFinished, setInitialLoadingFinished] = useState(false);
  const [state, setState] = useState<OverviewState>({
    groupBy: 'finding',
    overviewViewModel: {
      detectors: [],
      findings: [],
      alerts: [],
    },
  });
  const [startTime, setStartTime] = useState(DEFAULT_DATE_RANGE.start);
  const [endTime, setEndTime] = useState(DEFAULT_DATE_RANGE.end);
  const [recentlyUsedRanges, setRecentlyUsedRanges] = useState([DEFAULT_DATE_RANGE]);
  const [loading, setLoading] = useState(true);
  const [timeUnit, setTimeUnit] = useState('yearmonthdatehoursminutes');

  const context = useContext(CoreServicesContext);
  const services = useContext(ServicesContext);

  const updateState = (overviewViewModel: OverviewViewModel) => {
    setState({
      ...state,
      overviewViewModel: { ...overviewViewModel },
    });
    setLoading(false);
  };

  const overviewViewModelActor = useMemo(
    () => new OverviewViewModelActor(services, context.notifications),
    [services, context]
  );

  useEffect(() => {
    context?.chrome.setBreadcrumbs([BREADCRUMBS.SECURITY_ANALYTICS, BREADCRUMBS.OVERVIEW]);
    overviewViewModelActor.registerRefreshHandler(updateState);

    const updateModel = async () => {
      await overviewViewModelActor.onRefresh(startTime, endTime);
      setInitialLoadingFinished(true);
    };

    updateModel();
  }, []);

  useEffect(() => {
    if (
      !props.getStartedDismissedOnce &&
      initialLoadingFinished &&
      state.overviewViewModel.detectors.length === 0
    ) {
      setIsPopoverOpen(true);
    }
  }, [initialLoadingFinished, state.overviewViewModel, props.getStartedDismissedOnce]);

  const onTimeChange = async ({ start, end }: { start: string; end: string }) => {
    let usedRanges = recentlyUsedRanges.filter(
      (range) => !(range.start === start && range.end === end)
    );
    usedRanges.unshift({ start: start, end: end });
    if (usedRanges.length > MAX_RECENTLY_USED_TIME_RANGES)
      usedRanges = usedRanges.slice(0, MAX_RECENTLY_USED_TIME_RANGES);

    const endTime = start === end ? DEFAULT_DATE_RANGE.end : end;
    const timeUnit = getChartTimeUnit(start, endTime);
    setStartTime(start);
    setEndTime(endTime);
    setTimeUnit(timeUnit);
    setRecentlyUsedRanges(usedRanges);
  };

  useEffect(() => {
    overviewViewModelActor.onRefresh(startTime, endTime);
  }, [startTime, endTime]);

  const onRefresh = async () => {
    setLoading(true);
    await overviewViewModelActor.onRefresh(startTime, endTime);
  };

  const onButtonClick = () => setIsPopoverOpen((isPopoverOpen) => !isPopoverOpen);

  const closePopover = () => {
    setIsPopoverOpen(false);
    props.onGetStartedDismissed();
  };

  const button = (
    <EuiButtonEmpty iconType="cheer" onClick={onButtonClick}>
      Getting started
    </EuiButtonEmpty>
  );

  return (
    <EuiFlexGroup direction="column">
      <EuiFlexItem style={{ alignSelf: 'flex-end' }}>
        <EuiPopover
          button={button}
          isOpen={isPopoverOpen}
          anchorPosition="downRight"
          closePopover={closePopover}
        >
          <GettingStartedPopup dismissPopup={closePopover} history={props.history} />
        </EuiPopover>
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiFlexGroup justifyContent="spaceBetween">
          <EuiFlexItem>
            <EuiTitle size="m">
              <h1>Overview</h1>
            </EuiTitle>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiSuperDatePicker
              start={startTime}
              end={endTime}
              recentlyUsedRanges={recentlyUsedRanges}
              isLoading={loading}
              onTimeChange={onTimeChange}
              onRefresh={onRefresh}
              updateButtonProps={{ fill: false }}
            />
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlexItem>
      <EuiFlexItem>
        <Summary
          alerts={state.overviewViewModel.alerts}
          findings={state.overviewViewModel.findings}
          startTime={startTime}
          endTime={endTime}
          timeUnit={timeUnit}
          loading={loading}
        />
      </EuiFlexItem>

      <EuiFlexItem>
        <EuiFlexGrid columns={2} gutterSize="m">
          <RecentAlertsWidget items={state.overviewViewModel.alerts} loading={loading} />
          <RecentFindingsWidget items={state.overviewViewModel.findings} loading={loading} />
          <TopRulesWidget findings={state.overviewViewModel.findings} loading={loading} />
          <DetectorsWidget
            detectorHits={state.overviewViewModel.detectors}
            {...props}
            loading={loading}
          />
        </EuiFlexGrid>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};
