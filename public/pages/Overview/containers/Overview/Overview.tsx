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
  EuiSmallButton,
  EuiCard,
  EuiPanel,
  EuiStat,
  EuiText,
  EuiCompressedSuperDatePicker,
} from '@elastic/eui';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  BREADCRUMBS,
  DEFAULT_DATE_RANGE,
  MAX_RECENTLY_USED_TIME_RANGES,
  ROUTES,
} from '../../../../utils/constants';
import { CoreServicesContext } from '../../../../../public/components/core_services';
import { RecentAlertsWidget } from '../../components/Widgets/RecentAlertsWidget';
import { RecentFindingsWidget } from '../../components/Widgets/RecentFindingsWidget';
import { OverviewViewModelActor } from '../../models/OverviewViewModel';
import { SecurityAnalyticsContext } from '../../../../services';
import { Summary } from '../../components/Widgets/Summary';
import { TopRulesWidget } from '../../components/Widgets/TopRulesWidget';
import { GettingStartedContent } from '../../components/GettingStarted/GettingStartedContent';
import { getChartTimeUnit, TimeUnit } from '../../utils/helpers';
import { OverviewProps, OverviewState, OverviewViewModel } from '../../../../../types';
import { setBreadcrumbs } from '../../../../utils/helpers';
import { PageHeader } from '../../../../components/PageHeader/PageHeader';
import { getOverviewStatsProps, getOverviewsCardsProps } from '../../utils/constants';
import { getChrome, getUseUpdatedUx } from '../../../../services/utils/constants';
import { RecentThreatIntelFindingsWidget } from '../../components/Widgets/RecentThreatIntelFindingsWidget';
import { useObservable } from 'react-use';
import { SECURITY_ANALYTICS_USE_CASE_ID } from '../../../../../../../src/core/public';

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
      threatIntelFindings: [],
      correlations: 0,
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
    abortController.forEach((controller) => {
      controller.abort();
    });
  }, [abortController]);

  // This essentially makes sure we fire abort signals on the component unmount
  useEffect(() => {
    return fireAbortSignals;
  }, [fireAbortSignals]);

  const updateState = (overviewViewModel: OverviewViewModel, _modelLoadingComplete: boolean) => {
    setState({
      ...state,
      overviewViewModel: { ...overviewViewModel },
    });
  };

  const onLoadingComplete = (
    _overviewViewModel: OverviewViewModel,
    modelLoadingComplete: boolean
  ) => {
    setLoading(!modelLoadingComplete);
  };

  const overviewViewModelActor = useMemo(
    () => new OverviewViewModelActor(saContext?.services, context?.notifications!),
    [saContext?.services, context]
  );
  const currentNavGroup = useObservable(getChrome().navGroup.getCurrentNavGroup$());
  const isSecurityAnalyticsUseCase = currentNavGroup?.id === SECURITY_ANALYTICS_USE_CASE_ID;

  useEffect(() => {
    setBreadcrumbs(
      isSecurityAnalyticsUseCase
        ? [BREADCRUMBS.OVERVIEW]
        : [{ ...BREADCRUMBS.OVERVIEW, text: 'Security Analytics overview' }]
    );
    overviewViewModelActor.registerRefreshHandler(updateState, true /* allowPartialResults */);
    overviewViewModelActor.registerRefreshHandler(
      onLoadingComplete,
      false /* allowPartialResults */
    );
  }, [isSecurityAnalyticsUseCase]);

  useEffect(() => {
    const abortController = new AbortController();

    const updateModel = async () => {
      await overviewViewModelActor.onRefresh(
        dateTimeFilter.startTime,
        dateTimeFilter.endTime,
        abortController.signal
      );

      if (!initialLoadingFinished) {
        setInitialLoadingFinished(true);
      }
    };

    updateModel();

    return () => {
      abortController.abort();
    };
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
    await overviewViewModelActor.onRefresh(
      dateTimeFilter.startTime,
      dateTimeFilter.endTime,
      signal
    );
  };

  useEffect(() => {
    const abortController = new AbortController();
    onRefresh(abortController.signal);

    return () => {
      abortController.abort();
    };
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

  const datePicker = (
    <EuiCompressedSuperDatePicker
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
  );

  const createDetectorAction = (
    <EuiSmallButton
      href={`#${ROUTES.DETECTORS_CREATE}`}
      fill={true}
      data-test-subj={'detectorsCreateButton'}
      iconType="plus"
      iconSide="left"
      iconGap="s"
    >
      Create detector
    </EuiSmallButton>
  );

  const gettingStartedBadgeControl = (
    <EuiPopover
      button={button}
      isOpen={isPopoverOpen}
      anchorPosition="downRight"
      closePopover={closePopover}
    >
      <GettingStartedContent onStepClicked={closePopover} history={props.history} />
    </EuiPopover>
  );

  const overviewStats = {
    alerts: state.overviewViewModel.alerts.filter((a) => !a.acknowledged).length,
    correlations: state.overviewViewModel.correlations,
    ruleFindings: state.overviewViewModel.findings.length,
    threatIntelFindings: state.overviewViewModel.threatIntelFindings.length,
  };

  return (
    <EuiFlexGroup direction="column" gutterSize={'m'}>
      <PageHeader
        appRightControls={[
          { renderComponent: datePicker },
          { renderComponent: createDetectorAction },
        ]}
      >
        <EuiFlexItem>
          <EuiFlexGroup justifyContent="spaceBetween" gutterSize="s" alignItems="center">
            <EuiFlexItem grow={false}>
              <EuiText size="s">
                <h1>Overview</h1>
              </EuiText>
            </EuiFlexItem>
            <EuiFlexItem>{gettingStartedBadgeControl}</EuiFlexItem>
            <EuiFlexItem grow={false}>{datePicker}</EuiFlexItem>
            <EuiFlexItem grow={false}>{createDetectorAction}</EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
      </PageHeader>
      {getUseUpdatedUx() && (
        <>
          <EuiFlexItem>
            <EuiFlexGroup gutterSize="m">
              {getOverviewsCardsProps().map((p, idx) => (
                <EuiFlexItem key={idx}>
                  <EuiCard
                    {...p}
                    layout="vertical"
                    textAlign="left"
                    titleElement="h4"
                    titleSize="s"
                  />
                </EuiFlexItem>
              ))}
            </EuiFlexGroup>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiFlexGroup gutterSize="m">
              {getOverviewStatsProps(overviewStats).map((p, idx) => (
                <EuiFlexItem key={idx}>
                  <EuiPanel>
                    <EuiStat {...p} textAlign="right" titleSize="m" />
                  </EuiPanel>
                </EuiFlexItem>
              ))}
            </EuiFlexGroup>
          </EuiFlexItem>
        </>
      )}
      {/*<EuiFlexItem>*/}
      {/*  <Summary*/}
      {/*    alerts={state.overviewViewModel.alerts}*/}
      {/*    findings={state.overviewViewModel.findings}*/}
      {/*    startTime={dateTimeFilter.startTime}*/}
      {/*    endTime={dateTimeFilter.endTime}*/}
      {/*    timeUnit={timeUnit}*/}
      {/*    loading={loading}*/}
      {/*  />*/}
      {/*</EuiFlexItem>*/}

      <EuiFlexItem>
        <EuiFlexGrid columns={2} gutterSize="m">
          <RecentAlertsWidget items={state.overviewViewModel.alerts} loading={loading} />
          <RecentFindingsWidget items={state.overviewViewModel.findings} loading={loading} />
          {/*<TopRulesWidget findings={state.overviewViewModel.findings} loading={loading} />*/}
          <RecentThreatIntelFindingsWidget
            items={state.overviewViewModel.threatIntelFindings}
            loading={loading}
          />
        </EuiFlexGrid>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};
