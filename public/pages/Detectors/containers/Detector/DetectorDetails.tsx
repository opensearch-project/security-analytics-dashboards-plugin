/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiButton,
  EuiContextMenuItem,
  EuiContextMenuPanel,
  EuiFlexGroup,
  EuiFlexItem,
  EuiHorizontalRule,
  EuiPopover,
  EuiSpacer,
  EuiTab,
  EuiTabs,
  EuiTitle,
  EuiHealth,
  EuiCallOut,
  EuiLoadingSpinner,
  EuiPanel,
} from '@elastic/eui';
import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { CoreServicesContext } from '../../../../components/core_services';
import {
  BREADCRUMBS,
  EMPTY_DEFAULT_DETECTOR_HIT,
  logTypesWithDashboards,
  ROUTES,
} from '../../../../utils/constants';
import { CreateMappingsResponse, DetectorHit } from '../../../../../server/models/interfaces';
import { DetectorDetailsView } from '../DetectorDetailsView/DetectorDetailsView';
import { FieldMappingsView } from '../../components/FieldMappingsView/FieldMappingsView';
import { AlertTriggersView } from '../AlertTriggersView/AlertTriggersView';
import { RuleItem } from '../../../CreateDetector/components/DefineDetector/components/DetectionRules/types/interfaces';
import { DetectorsService } from '../../../../services';
import { errorNotificationToast, successNotificationToast } from '../../../../utils/helpers';
import { NotificationsStart, SimpleSavedObject } from 'opensearch-dashboards/public';
import { CreateDetectorResponse, ISavedObjectsService, ServerResponse } from '../../../../../types';
import { PENDING_DETECTOR_ID } from '../../../CreateDetector/utils/constants';
import { DataStore } from '../../../../store/DataStore';

export interface DetectorDetailsProps
  extends RouteComponentProps<
    {},
    any,
    {
      detectorHit: DetectorHit;
      createDashboardPromise?: Promise<void | ServerResponse<SimpleSavedObject<unknown>>>;
      enabledRules?: RuleItem[];
      allRules?: RuleItem[];
    }
  > {
  detectorService: DetectorsService;
  notifications: NotificationsStart;
  savedObjectsService: ISavedObjectsService;
}

export interface DetectorDetailsState {
  isActionsMenuOpen: boolean;
  selectedTabId: TabId;
  selectedTabContent: React.ReactNode;
  detectorHit: DetectorHit;
  detectorId: string;
  tabs: any[];
  loading: boolean;
  dashboardId?: string;
  createFailed: boolean;
}

enum TabId {
  DetectorDetails = 'detector-config-tab',
  FieldMappings = 'field-mappings-tab',
  AlertTriggers = 'alert-triggers-tab',
}

export class DetectorDetails extends React.Component<DetectorDetailsProps, DetectorDetailsState> {
  static contextType = CoreServicesContext;

  private get detectorHit(): DetectorHit {
    return this.state.detectorHit;
  }

  private set detectorHit(hit: DetectorHit) {
    this.setState({ detectorHit: hit });
  }

  editDetectorBasicDetails = () => {
    this.props.history.push({
      pathname: `${ROUTES.EDIT_DETECTOR_DETAILS}/${this.state.detectorId}`,
      state: { detectorHit: this.detectorHit },
    });
  };

  editDetectorRules = (enabledRules: RuleItem[], allRules: RuleItem[]) => {
    this.props.history.push({
      pathname: `${ROUTES.EDIT_DETECTOR_RULES}/${this.state.detectorId}`,
      state: { detectorHit: this.detectorHit, enabledRules, allRules },
    });
  };

  editFieldMappings = () => {
    this.props.history.push({
      pathname: `${ROUTES.EDIT_FIELD_MAPPINGS}/${this.state.detectorId}`,
      state: { detectorHit: this.detectorHit },
    });
  };

  editAlertTriggers = () => {
    this.props.history.push({
      pathname: `${ROUTES.EDIT_DETECTOR_ALERT_TRIGGERS}/${this.state.detectorId}`,
      state: { detectorHit: this.detectorHit },
    });
  };

  private getTabs() {
    const { detectorId, createFailed } = this.state;
    const creatingDetector: boolean = detectorId === PENDING_DETECTOR_ID;
    const isEditable = !creatingDetector && !createFailed;
    const tabs = [
      {
        id: TabId.DetectorDetails,
        name: 'Detector configuration',
        content: (
          <DetectorDetailsView
            {...this.props}
            detector={this.detectorHit._source}
            enabled_time={this.detectorHit._source.enabled_time}
            last_update_time={this.detectorHit._source.last_update_time}
            dashboardId={this.state.dashboardId}
            editBasicDetails={this.editDetectorBasicDetails}
            editDetectorRules={this.editDetectorRules}
            isEditable={isEditable}
          />
        ),
      },
      {
        id: TabId.FieldMappings,
        name: 'Field mappings',
        content: (
          <FieldMappingsView
            {...this.props}
            detector={this.detectorHit._source}
            editFieldMappings={this.editFieldMappings}
            isEditable={isEditable}
          />
        ),
      },
      {
        id: TabId.AlertTriggers,
        name: 'Alert triggers',
        content: (
          <AlertTriggersView
            {...this.props}
            detector={this.detectorHit._source}
            editAlertTriggers={this.editAlertTriggers}
            isEditable={isEditable}
          />
        ),
      },
    ];
    this.setState({ tabs: tabs, selectedTabContent: tabs[0].content });
  }

  constructor(props: DetectorDetailsProps) {
    super(props);
    const detectorId = props.location.pathname.replace(`${ROUTES.DETECTOR_DETAILS}/`, '');
    const pendingState = DataStore.detectors.getPendingState();
    const detector = pendingState?.detectorState?.detector;

    // if user reloads the page all data is lost so just redirect to detectors page
    if (!pendingState && detectorId === PENDING_DETECTOR_ID) {
      this.props.history.push(`${ROUTES.DETECTORS}`);
    }

    this.state = {
      isActionsMenuOpen: false,
      selectedTabId: TabId.DetectorDetails,
      selectedTabContent: null,
      detectorHit: detector
        ? Object.assign({}, EMPTY_DEFAULT_DETECTOR_HIT, {
            ...detector,
            _source: {
              ...detector,
            },
          })
        : EMPTY_DEFAULT_DETECTOR_HIT,
      detectorId: detectorId,
      tabs: [],
      loading: false,
      createFailed: false,
    };
  }

  private createDashboard = (
    detectorName: string,
    logType: string,
    detectorId: string,
    inputIndices: string[]
  ) => {
    return this.props.savedObjectsService
      .createSavedObject(detectorName, logType, detectorId, inputIndices)
      .catch((error: any) => {
        console.error(error);
      });
  };

  getPendingDetector = async () => {
    const pendingState = DataStore.detectors.getPendingState();
    const detector = pendingState?.detectorState?.detector;
    const pendingRequests = pendingState?.pendingRequests;
    this.getTabs();

    if (pendingRequests && detector) {
      this.detectorHit = Object.assign({}, EMPTY_DEFAULT_DETECTOR_HIT, {
        ...detector,
        _source: {
          ...detector,
        },
      });

      this.context.chrome.setBreadcrumbs([
        BREADCRUMBS.SECURITY_ANALYTICS,
        BREADCRUMBS.DETECTORS,
        BREADCRUMBS.DETECTORS_DETAILS(detector.name, PENDING_DETECTOR_ID),
      ]);

      const [mappingsResponse, detectorResponse] = (await Promise.all(pendingRequests)) as [
        ServerResponse<CreateMappingsResponse>,
        ServerResponse<CreateDetectorResponse>
      ];

      if (mappingsResponse.ok) {
        if (detectorResponse.ok) {
          let dashboardId;
          const detectorId = detectorResponse.response._id;
          if (logTypesWithDashboards.has(detector.detector_type)) {
            const dashboardResponse = await this.createDashboard(
              detector.name,
              detector.detector_type,
              detectorResponse.response._id,
              detector.inputs[0].detector_input.indices
            );
            if (dashboardResponse && dashboardResponse.ok) {
              dashboardId = dashboardResponse.response.id;
            } else {
              const dashboards = await this.props.savedObjectsService.getDashboards();
              dashboards.some((dashboard) => {
                if (
                  dashboard.references.findIndex(
                    (reference) => reference.id === this.state.detectorId
                  ) > -1
                ) {
                  dashboardId = dashboard.id;
                  return true;
                }

                return false;
              });
            }
          }

          this.setState(
            {
              detectorId,
              dashboardId,
            },
            () => {
              DataStore.detectors.deletePendingState();
              this.props.history.push(`${ROUTES.DETECTOR_DETAILS}/${detectorId}`);
              this.getDetector();
            }
          );

          successNotificationToast(
            this.props.notifications,
            'created',
            `detector, "${detector.name}"`
          );
        } else {
          this.setState(
            {
              createFailed: true,
            },
            () =>
              errorNotificationToast(
                this.props.notifications,
                'create',
                'detector',
                detectorResponse.error
              )
          );
        }
      } else {
        this.setState(
          {
            createFailed: true,
          },
          () =>
            errorNotificationToast(
              this.props.notifications,
              'create',
              'detector',
              'Double check the field mappings and try again.'
            )
        );
      }
    }
    this.setState({ loading: false });
  };

  async componentDidMount() {
    const pendingState = DataStore.detectors.getPendingState();
    pendingState ? this.getPendingDetector() : this.getDetector();
  }

  getDetector = async () => {
    this.setState({ loading: true });
    const { detectorService, notifications } = this.props;
    try {
      const { detectorId } = this.state;
      const response = await detectorService.getDetectors();
      if (response.ok) {
        const detector = response.response.hits.hits.find(
          (detectorHit) => detectorHit._id === detectorId
        ) as DetectorHit;

        this.detectorHit = {
          ...detector,
          _source: {
            ...detector._source,
            enabled: detector._source.enabled,
          },
        };
        this.context.chrome.setBreadcrumbs([
          BREADCRUMBS.SECURITY_ANALYTICS,
          BREADCRUMBS.DETECTORS,
          BREADCRUMBS.DETECTORS_DETAILS(detector._source.name, detector._id),
        ]);
      } else {
        errorNotificationToast(notifications, 'retrieve', 'detector', response.error);
      }
    } catch (e: any) {
      errorNotificationToast(notifications, 'retrieve', 'detector', e);
    }

    this.getTabs();
    this.setState({ loading: false });
  };

  toggleActionsMenu = () => {
    const { isActionsMenuOpen } = this.state;
    this.setState({ isActionsMenuOpen: !isActionsMenuOpen });
  };

  closeActionsPopover = () => {
    this.setState({ isActionsMenuOpen: false });
  };

  onDelete = async () => {
    this.setState({ loading: true });
    const { detectorService, notifications } = this.props;
    const detectorId = this.detectorHit._id;
    try {
      const deleteRes = await detectorService.deleteDetector(detectorId);
      if (!deleteRes.ok) {
        errorNotificationToast(notifications, 'delete', 'detector', deleteRes.error);
      } else {
        this.props.history.push(ROUTES.DETECTORS);
      }
    } catch (e: any) {
      errorNotificationToast(notifications, 'delete', 'detector', e);
    }
    this.setState({ loading: false });
  };

  toggleDetector = async () => {
    this.setState({ loading: true });
    const { detectorService, notifications } = this.props;
    try {
      const detectorId = this.detectorHit._id;
      const detector = this.detectorHit._source;
      const updateRes = await detectorService.updateDetector(detectorId, {
        ...detector,
        enabled: !this.detectorHit._source.enabled,
      });

      if (updateRes.ok) {
        this.detectorHit = {
          ...this.detectorHit,
          _source: {
            ...this.detectorHit._source,
            enabled: !this.detectorHit._source.enabled,
          },
        };
      } else {
        errorNotificationToast(notifications, 'update', 'detector', updateRes.error);
      }
    } catch (e: any) {
      errorNotificationToast(notifications, 'update', 'detector', e);
    }
    this.setState({ loading: false });
  };

  createHeaderActions(): React.ReactNode[] {
    const { loading } = this.state;
    const { isActionsMenuOpen } = this.state;
    return [
      <EuiPopover
        id={'detectorsActionsPopover'}
        button={
          <EuiButton
            isLoading={loading}
            iconType={'arrowDown'}
            iconSide={'right'}
            onClick={this.toggleActionsMenu}
            data-test-subj={'detectorsActionsButton'}
          >
            Actions
          </EuiButton>
        }
        isOpen={isActionsMenuOpen}
        closePopover={this.closeActionsPopover}
        panelPaddingSize={'none'}
        anchorPosition={'downLeft'}
        data-test-subj={'detectorsActionsPopover'}
      >
        <EuiContextMenuPanel
          items={[
            <EuiContextMenuItem
              disabled={loading}
              key={'ViewAlerts'}
              icon={'empty'}
              onClick={this.onViewAlertsClick}
              data-test-subj={'viewAlertsButton'}
            >
              View Alerts
            </EuiContextMenuItem>,
            <EuiContextMenuItem
              disabled={loading}
              key={'ViewFindings'}
              icon={'empty'}
              onClick={this.onViewFindingsClick}
              data-test-subj={'viewFindingsButton'}
            >
              View Findings
            </EuiContextMenuItem>,
            <>
              {this.state.dashboardId ? (
                <EuiContextMenuItem
                  disabled={loading}
                  key={'ViewDashboard'}
                  icon={'empty'}
                  onClick={() =>
                    window.open(`dashboards#/view/${this.state.dashboardId}`, '_blank')
                  }
                  data-test-subj={'viewDashboard'}
                >
                  View detector dashboard
                </EuiContextMenuItem>
              ) : null}
            </>,
            <EuiHorizontalRule margin="xs" />,
            <EuiContextMenuItem
              disabled={loading}
              key={'Toggle detector'}
              icon={'empty'}
              onClick={() => {
                this.closeActionsPopover();
                this.toggleDetector();
              }}
              data-test-subj={'deleteButton'}
            >
              {`${this.detectorHit._source.enabled ? 'Stop' : 'Start'} detector`}
            </EuiContextMenuItem>,
            <EuiContextMenuItem
              disabled={loading}
              key={'Delete'}
              icon={'empty'}
              onClick={() => {
                this.closeActionsPopover();
                this.onDelete();
              }}
              data-test-subj={'editButton'}
            >
              Delete
            </EuiContextMenuItem>,
          ]}
        />
      </EuiPopover>,
    ];
  }

  onViewAlertsClick = () => {
    this.props.history.push(`${ROUTES.ALERTS}/${this.state.detectorId}`);
  };

  onViewFindingsClick = () => {
    this.props.history.push(`${ROUTES.FINDINGS}/${this.state.detectorId}`);
  };

  renderTabs() {
    return this.state.tabs.map((tab, index) => (
      <EuiTab
        key={index}
        onClick={() => this.setState({ selectedTabId: tab.id, selectedTabContent: tab.content })}
        isSelected={this.state.selectedTabId === tab.id}
      >
        {tab.name}
      </EuiTab>
    ));
  }

  viewDetectorConfiguration = () => {
    const pendingState = DataStore.detectors.getPendingState();
    const detectorState = pendingState?.detectorState;
    this.props.history.push({
      pathname: `${ROUTES.DETECTORS_CREATE}`,
      // @ts-ignore
      state: { detectorState },
    });
    DataStore.detectors.deletePendingState();
  };

  render() {
    const { _source: detector } = this.detectorHit;
    const { selectedTabContent, detectorId, createFailed } = this.state;
    const creatingDetector: boolean = detectorId === PENDING_DETECTOR_ID;

    let statusColor = 'primary';
    let statusText = 'Initializing';

    if (creatingDetector) {
      if (createFailed) {
        statusColor = 'danger';
        statusText = 'Failed';
      }
    } else {
      if (detector.enabled) {
        statusColor = 'success';
        statusText = 'Active';
      } else {
        statusColor = 'subdued';
        statusText = 'Inactive';
      }
    }

    return (
      <>
        {creatingDetector ? (
          <>
            <EuiCallOut
              title={
                <EuiFlexGroup alignItems="center">
                  {!createFailed && (
                    <EuiPanel paddingSize="s" color={'transparent'} hasBorder={false}>
                      <EuiLoadingSpinner size="l" />
                    </EuiPanel>
                  )}
                  <EuiPanel paddingSize="s" color={'transparent'} hasBorder={false}>
                    {createFailed
                      ? 'Detector creation failed. Please review detector configuration and try again.'
                      : 'Attempting to create the detector.'}
                  </EuiPanel>
                </EuiFlexGroup>
              }
              color={createFailed ? 'danger' : 'primary'}
            >
              {createFailed && (
                <EuiButton color={'danger'} onClick={this.viewDetectorConfiguration}>
                  Review detector configuration
                </EuiButton>
              )}
            </EuiCallOut>
            <EuiSpacer size="xl" />
          </>
        ) : null}
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiFlexGroup alignItems="center">
              <EuiFlexItem grow={false}>
                <EuiTitle data-test-subj={'detector-details-detector-name'}>
                  <h1>{detector.name}</h1>
                </EuiTitle>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiHealth color={statusColor}>{statusText}</EuiHealth>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiFlexGroup justifyContent="flexEnd" alignItems="center">
              {!creatingDetector && !createFailed
                ? this.createHeaderActions().map(
                    (action: React.ReactNode, idx: number): React.ReactNode => (
                      <EuiFlexItem key={idx} grow={false}>
                        {action}
                      </EuiFlexItem>
                    )
                  )
                : null}
            </EuiFlexGroup>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer size="xl" />
        <EuiTabs>{this.renderTabs()}</EuiTabs>
        <EuiSpacer size="xl" />
        {selectedTabContent}
      </>
    );
  }
}
