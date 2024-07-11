/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiSmallButton,
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
} from '@elastic/eui';
import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { CoreServicesContext } from '../../../../components/core_services';
import { BREADCRUMBS, EMPTY_DEFAULT_DETECTOR_HIT, ROUTES } from '../../../../utils/constants';
import { DetectorHit } from '../../../../../server/models/interfaces';
import { DetectorDetailsView } from '../DetectorDetailsView/DetectorDetailsView';
import { FieldMappingsView } from '../../components/FieldMappingsView/FieldMappingsView';
import { AlertTriggersView } from '../AlertTriggersView/AlertTriggersView';
import { RuleItem } from '../../../CreateDetector/components/DefineDetector/components/DetectionRules/types/interfaces';
import { DetectorsService, IndexPatternsService } from '../../../../services';
import { errorNotificationToast } from '../../../../utils/helpers';
import { NotificationsStart, SimpleSavedObject } from 'opensearch-dashboards/public';
import { ISavedObjectsService, ServerResponse } from '../../../../../types';
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
  indexPatternsService: IndexPatternsService;
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
    const state = DataStore.detectors.getState();
    const detector = state?.detectorInput?.detector;

    // if user reloads the page all data is lost so just redirect to detectors page
    if (!state && detectorId === PENDING_DETECTOR_ID) {
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

  getPendingDetector = async () => {
    const state = DataStore.detectors.getState();
    const detector = state?.detectorInput?.detector;
    const pendingRequests = state?.pendingRequests;
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

      const pendingResponse = await DataStore.detectors.resolvePendingCreationRequest();

      if (pendingResponse.ok) {
        const { detectorId, dashboardId } = pendingResponse;

        detectorId &&
          this.setState(
            {
              detectorId,
              dashboardId,
            },
            () => {
              DataStore.detectors.deleteState();
              this.props.history.push(`${ROUTES.DETECTOR_DETAILS}/${detectorId}`);
              this.getDetector();
            }
          );
      } else {
        this.setState({ createFailed: true });
      }
    }
    this.setState({ loading: false });
  };

  async componentDidMount() {
    const state = DataStore.detectors.getState();
    state ? this.getPendingDetector() : this.getDetector();
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

        const dashboard = await this.props.savedObjectsService.getDashboard(detectorId);
        if (dashboard?.id) {
          this.setState({ dashboardId: dashboard.id });
        }
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
      const dashboard = await this.props.savedObjectsService.getDashboard(detectorId);
      if (dashboard) {
        // delete dashboard
        dashboard.references?.map(async (ref) => {
          if (ref.type === 'visualization') {
            await this.props.savedObjectsService.deleteVisualization(ref.id);
          }
        });
        await this.props.savedObjectsService.deleteDashboard(dashboard.id);
      }

      const index = await this.props.indexPatternsService.getIndexPattern(detectorId);
      if (index) {
        await this.props.indexPatternsService.deleteIndexPattern(index.id);
      }

      const deleteRes = await detectorService.deleteDetector(detectorId);
      if (!deleteRes.ok) {
        errorNotificationToast(notifications, 'delete', 'detector', deleteRes.error);
      } else {
        DataStore.detectors.deleteState();
        DataStore.detectors.clearNotifications();
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
          <EuiSmallButton
            isLoading={loading}
            iconType={'arrowDown'}
            iconSide={'right'}
            onClick={this.toggleActionsMenu}
            data-test-subj={'detectorsActionsButton'}
          >
            Actions
          </EuiSmallButton>
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
