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
import { DetectorsService } from '../../../../services';
import { errorNotificationToast } from '../../../../utils/helpers';
import { NotificationsStart } from 'opensearch-dashboards/public';

export interface DetectorDetailsProps
  extends RouteComponentProps<
    {},
    any,
    { detectorHit: DetectorHit; enabledRules?: RuleItem[]; allRules?: RuleItem[] }
  > {
  detectorService: DetectorsService;
  notifications: NotificationsStart;
}

export interface DetectorDetailsState {
  isActionsMenuOpen: boolean;
  selectedTabId: TabId;
  selectedTabContent: React.ReactNode;
  detectorHit: DetectorHit;
  detectorId: string;
  tabs: any[];
  loading: boolean;
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
            editBasicDetails={this.editDetectorBasicDetails}
            editDetectorRules={this.editDetectorRules}
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
          />
        ),
      },
    ];
    this.setState({ tabs: tabs, selectedTabContent: tabs[0].content });
  }

  constructor(props: DetectorDetailsProps) {
    super(props);
    const detectorId = props.location.pathname.replace(`${ROUTES.DETECTOR_DETAILS}/`, '');
    this.state = {
      isActionsMenuOpen: false,
      selectedTabId: TabId.DetectorDetails,
      selectedTabContent: null,
      detectorHit: EMPTY_DEFAULT_DETECTOR_HIT,
      detectorId: detectorId,
      tabs: [],
      loading: false,
    };
  }

  async componentDidMount() {
    this.getDetector();
  }

  getDetector = async () => {
    this.setState({ loading: true });
    const { detectorService, notifications } = this.props;
    try {
      const response = await detectorService.getDetectors();
      if (response.ok) {
        const { detectorId } = this.state;
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
    const onClickActions = [
      { name: 'View Alerts', onClick: this.onViewAlertsClick },
      { name: 'View Findings', onClick: this.onViewFindingsClick },
    ];
    const { isActionsMenuOpen } = this.state;
    return [
      ...onClickActions.map((action) => (
        <EuiButton onClick={action.onClick}>{action.name}</EuiButton>
      )),
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
    const { selectedTabContent } = this.state;

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
                <EuiHealth color={detector.enabled ? 'success' : 'subdued'}>
                  {detector.enabled ? 'Active' : 'Inactive'}
                </EuiHealth>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiFlexGroup justifyContent="flexEnd" alignItems="center">
              {this.createHeaderActions().map(
                (action: React.ReactNode, idx: number): React.ReactNode => (
                  <EuiFlexItem key={idx} grow={false}>
                    {action}
                  </EuiFlexItem>
                )
              )}
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
