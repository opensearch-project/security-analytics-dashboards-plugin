/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiSmallButtonEmpty,
  EuiFlexGrid,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPopover,
  EuiSuperDatePicker,
  EuiTitle,
  EuiSpacer,
  EuiSmallButton,
} from '@elastic/eui';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  BREADCRUMBS,
  DEFAULT_DATE_RANGE,
  MAX_RECENTLY_USED_TIME_RANGES,
  PLUGIN_NAME,
  ROUTES,
} from '../../../../utils/constants';
import { CoreServicesContext } from '../../../../../public/components/core_services';
import { RecentAlertsWidget } from '../../components/Widgets/RecentAlertsWidget';
import { RecentFindingsWidget } from '../../components/Widgets/RecentFindingsWidget';
import { DetectorsWidget } from '../../components/Widgets/DetectorsWidget';
import { OverviewViewModelActor } from '../../models/OverviewViewModel';
import { SecurityAnalyticsContext } from '../../../../services';
import { Summary } from '../../components/Widgets/Summary';
import { TopRulesWidget } from '../../components/Widgets/TopRulesWidget';
import { GettingStartedPopup } from '../../components/GettingStarted/GettingStartedPopup';
import { getChartTimeUnit, TimeUnit } from '../../utils/helpers';
import { OverviewProps, OverviewState, OverviewViewModel } from '../../../../../types';

export const Overview: React.FC<OverviewProps> = (props) => {
  const {
    dateTimeFilter = {
      startTime: DEFAULT_DATE_RANGE.start,
      endTime: DEFAULT_DATE_RANGE.end,
    },
  } = props;

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

  const [recentlyUsedRanges, setRecentlyUsedRanges] = useState([DEFAULT_DATE_RANGE]);
  const [loading, setLoading] = useState(true);

  const timeUnits = getChartTimeUnit(dateTimeFilter.startTime, dateTimeFilter.endTime);
  const [timeUnit, setTimeUnit] = useState<TimeUnit>(timeUnits.timeUnit);

  const context = useContext(CoreServicesContext);
  const saContext = useContext(SecurityAnalyticsContext);
  const [abortController, setControllers] = useState<Array<AbortController>>([]);
  const fireAbortSignals = useCallback(() => {
    abortController.forEach(controller => {
      controller.abort();
    });
  }, [abortController]);

  // This essentially makes sure we fire abort signals on the component unmount
  useEffect(() => {
    return fireAbortSignals;
  }, [fireAbortSignals]);

  const updateState = (overviewViewModel: OverviewViewModel, modelLoadingComplete: boolean) => {
    setState({
      ...state,
      overviewViewModel: { ...overviewViewModel },
    });
  };

  const onLoadingComplete = (_overviewViewModel: OverviewViewModel, modelLoadingComplete: boolean) => {
    setLoading(!modelLoadingComplete);
  }

  const overviewViewModelActor = useMemo(
    () => new OverviewViewModelActor(saContext?.services, context?.notifications!),
    [saContext?.services, context]
  );

  useEffect(() => {
    context?.chrome.setBreadcrumbs([BREADCRUMBS.SECURITY_ANALYTICS, BREADCRUMBS.OVERVIEW]);
    overviewViewModelActor.registerRefreshHandler(updateState, true /* allowPartialResults */);
    overviewViewModelActor.registerRefreshHandler(onLoadingComplete, false /* allowPartialResults */);
  }, []);

  useEffect(() => {
    const abortController = new AbortController();

    const updateModel = async () => {
      await overviewViewModelActor.onRefresh(dateTimeFilter.startTime, dateTimeFilter.endTime, abortController.signal);

      if (!initialLoadingFinished) {
        setInitialLoadingFinished(true);
      }
    };

    updateModel();

    return () => {
      abortController.abort()
    }
  }, [dateTimeFilter.startTime, dateTimeFilter.endTime]);

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
    const timeUnits = getChartTimeUnit(start, endTime);

    props.setDateTimeFilter &&
      props.setDateTimeFilter({
        startTime: start,
        endTime: endTime,
      });
    setTimeUnit(timeUnits.timeUnit);
    setRecentlyUsedRanges(usedRanges);
  };

  const onRefresh = async (signal: AbortSignal) => {
    setLoading(true);
    await overviewViewModelActor.onRefresh(dateTimeFilter.startTime, dateTimeFilter.endTime, signal);
  };

  useEffect(() => {
    const abortController = new AbortController();
    onRefresh(abortController.signal);

    return () => {
      abortController.abort();
    }
  }, [props.dataSource]);

  const onButtonClick = () => setIsPopoverOpen((isPopoverOpen) => !isPopoverOpen);

  const closePopover = () => {
    setIsPopoverOpen(false);
    props.onGetStartedDismissed();
  };

  const button = (
    <EuiSmallButtonEmpty iconType="cheer" onClick={onButtonClick}>
      Getting started
    </EuiSmallButtonEmpty>
  );

  return (
    <EuiFlexGroup direction="column">
      <EuiFlexItem>
        <EuiFlexGroup justifyContent="spaceBetween" gutterSize="s">
          <EuiFlexItem grow={false}>
            <EuiTitle size="m">
              <h1>Overview</h1>
            </EuiTitle>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiPopover
              button={button}
              isOpen={isPopoverOpen}
              anchorPosition="downRight"
              closePopover={closePopover}
            >
              <GettingStartedPopup dismissPopup={closePopover} history={props.history} />
            </EuiPopover>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiSuperDatePicker
              start={dateTimeFilter.startTime}
              end={dateTimeFilter.endTime}
              recentlyUsedRanges={recentlyUsedRanges}
              isLoading={loading}
              onTimeChange={onTimeChange}
              onRefresh={() => {
                const abortController = new AbortController();
                fireAbortSignals();
                setControllers([abortController]);
                onRefresh(abortController.signal);
              }}
              updateButtonProps={{ fill: false }}
            />
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiSmallButton
              href={`${PLUGIN_NAME}#${ROUTES.DETECTORS_CREATE}`}
              fill={true}
              data-test-subj={'detectorsCreateButton'}
            >
              Create detector
            </EuiSmallButton>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer size={'m'} />
      </EuiFlexItem>
      <EuiFlexItem>
        <Summary
          alerts={state.overviewViewModel.alerts}
          findings={state.overviewViewModel.findings}
          startTime={dateTimeFilter.startTime}
          endTime={dateTimeFilter.endTime}
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
