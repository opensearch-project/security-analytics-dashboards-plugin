/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import {
  EuiBasicTableColumn,
  EuiButton,
  EuiContextMenuItem,
  EuiContextMenuPanel,
  EuiEmptyPrompt,
  EuiFlexGroup,
  EuiFlexItem,
  EuiInMemoryTable,
  EuiLink,
  EuiPanel,
  EuiPopover,
  EuiSpacer,
  EuiText,
  EuiTitle,
} from '@elastic/eui';
import { BREADCRUMBS, DEFAULT_EMPTY_DATA, PLUGIN_NAME, ROUTES } from '../../../../utils/constants';
import DeleteModal from '../../../../components/DeleteModal';
import { getDetectorNames } from '../../utils/helpers';
import { capitalizeFirstLetter, renderTime } from '../../../../utils/helpers';
import { CoreServicesContext } from '../../../../components/core_services';
import { FieldValueSelectionFilterConfigType } from '@elastic/eui/src/components/search_bar/filters/field_value_selection_filter';
import { DetectorsService } from '../../../../services';
import { DetectorHit } from '../../../../../server/models/interfaces';

interface DetectorsProps extends RouteComponentProps {
  detectorService: DetectorsService;
}

interface DetectorsState {
  detectorHits: DetectorHit[];
  loadingDetectors: boolean;
  selectedItems: DetectorHit[];
  isDeleteModalVisible: boolean;
  isPopoverOpen: boolean;
}

export default class Detectors extends Component<DetectorsProps, DetectorsState> {
  static contextType = CoreServicesContext;

  constructor(props: DetectorsProps) {
    super(props);

    this.state = {
      detectorHits: [],
      loadingDetectors: false,
      selectedItems: [],
      isDeleteModalVisible: false,
      isPopoverOpen: false,
    };
  }

  async componentDidMount() {
    this.context.chrome.setBreadcrumbs([BREADCRUMBS.SECURITY_ANALYTICS, BREADCRUMBS.DETECTORS]);
    await this.getDetectors();
  }

  getDetectors = async () => {
    this.setState({ loadingDetectors: true });
    const res = await this.props.detectorService.getDetectors();

    if (res.ok) {
      const detectors = res.response.hits.hits.map((detector) => {
        const { custom_rules, pre_packaged_rules } = detector._source.inputs[0].detector_input;
        const rulesCount = custom_rules.length + pre_packaged_rules.length;
        return {
          ...detector,
          detectorName: detector._source.name,
          lastUpdatedTime: detector._source.last_update_time,
          logType: detector._source.detector_type,
          rulesCount: rulesCount,
          status: detector._source.enabled ? 'Active' : 'Inactive',
        };
      });
      this.setState({ detectorHits: detectors });
    }

    this.setState({ loadingDetectors: false });
  };

  openDeleteModal = () => {
    this.setState({ isDeleteModalVisible: true });
  };

  closeDeleteModal = () => {
    this.setState({ isDeleteModalVisible: false });
  };

  toggleDetector = async (detector: DetectorHit, shouldStart: boolean) => {
    const updateRes = await this.props.detectorService.updateDetector(detector._id, {
      ...detector._source,
      enabled: shouldStart,
    });

    if (!updateRes.ok) {
      // TODO: show error
    } else {
      this.getDetectors();
    }
  };

  onClickDelete = async () => {
    const { selectedItems } = this.state;

    for (let item of selectedItems) {
      await this.deleteDetector(item._id);
    }

    this.getDetectors();
  };

  deleteDetector = async (id: string) => {
    const deleteRes = await this.props.detectorService.deleteDetector(id);

    if (!deleteRes.ok) {
      // TODO: Show error
    }
  };

  onSelectionChange = (selectedItems: DetectorHit[]) => {
    this.setState({ selectedItems: selectedItems });
  };

  openActionsButton = () => {
    const { isPopoverOpen } = this.state;
    this.setState({ isPopoverOpen: !isPopoverOpen });
  };

  closeActionsPopover = () => {
    this.setState({ isPopoverOpen: false });
  };

  showDetectorDetails = (detectorHit: DetectorHit) => {
    this.props.history.push({
      pathname: ROUTES.DETECTOR_DETAILS,
      state: { detectorHit },
    });
  };

  getActionItems = (selectedItems: DetectorHit[]) => {
    const actionItems = [
      <EuiContextMenuItem
        key={'Delete'}
        icon={'empty'}
        disabled={selectedItems.length === 0}
        onClick={() => {
          this.closeActionsPopover();
          this.openDeleteModal();
        }}
        data-test-subj={'deleteButton'}
      >
        Delete
      </EuiContextMenuItem>,
    ];

    if (selectedItems.length === 1) {
      actionItems.push(
        <EuiContextMenuItem
          key={'ToggleDetector'}
          icon={'empty'}
          disabled={selectedItems.length !== 1}
          onClick={() => {
            this.closeActionsPopover();
            this.toggleDetector(selectedItems[0], !selectedItems[0]._source.enabled);
          }}
          data-test-subj={'toggleDetectorButton'}
        >
          {`${selectedItems[0]?._source.enabled ? 'Stop' : 'Start'} detector`}
        </EuiContextMenuItem>
      );
    }

    return actionItems;
  };

  render() {
    const {
      detectorHits,
      isDeleteModalVisible,
      isPopoverOpen,
      loadingDetectors,
      selectedItems,
    } = this.state;

    const actions = [
      <EuiButton
        iconType={'refresh'}
        onClick={this.getDetectors}
        data-test-subj={'detectorsRefreshButton'}
      >
        Refresh
      </EuiButton>,
      <EuiPopover
        id={'detectorsActionsPopover'}
        button={
          <EuiButton
            iconType={'arrowDown'}
            iconSide={'right'}
            disabled={!selectedItems.length}
            onClick={this.openActionsButton}
            data-test-subj={'detectorsActionsButton'}
          >
            Actions
          </EuiButton>
        }
        isOpen={isPopoverOpen}
        closePopover={this.closeActionsPopover}
        panelPaddingSize={'none'}
        anchorPosition={'downLeft'}
        data-test-subj={'detectorsActionsPopover'}
      >
        <EuiContextMenuPanel items={this.getActionItems(selectedItems)} />
      </EuiPopover>,
      <EuiButton
        href={`${PLUGIN_NAME}#${ROUTES.DETECTORS_CREATE}`}
        fill={true}
        data-test-subj={'detectorsCreateButton'}
      >
        Create detector
      </EuiButton>,
    ];

    const columns: EuiBasicTableColumn<DetectorHit>[] = [
      {
        field: 'detectorName',
        name: 'Detector name',
        sortable: true,
        dataType: 'string',
        render: (name: string, item: DetectorHit) => (
          <EuiLink onClick={() => this.showDetectorDetails(item)}>{name}</EuiLink>
        ),
      },
      {
        field: 'status',
        name: 'Status',
        sortable: true,
        dataType: 'string',
      },
      {
        field: 'logType',
        name: 'Log type',
        sortable: true,
        dataType: 'string',
        render: (detector_type: string) =>
          capitalizeFirstLetter(detector_type) || DEFAULT_EMPTY_DATA,
      },
      {
        field: 'rulesCount',
        name: 'Rules',
        sortable: true,
        dataType: 'number',
        align: 'left',
        render: (count) => count || DEFAULT_EMPTY_DATA,
      },
      {
        field: 'lastUpdatedTime',
        name: 'Last updated time',
        sortable: true,
        dataType: 'date',
        render: (last_update_time) => renderTime(last_update_time) || DEFAULT_EMPTY_DATA,
      },
    ];

    const statuses = [
      ...new Set(
        detectorHits.map((detector) => (detector._source.enabled ? 'Active' : 'Inactive'))
      ),
    ];
    const logType = [...new Set(detectorHits.map((detector) => detector._source.detector_type))];
    const search = {
      box: {
        placeholder: 'Search threat detectors',
        schema: true,
      },
      filters: [
        {
          type: 'field_value_selection',
          field: 'status',
          name: 'Status',
          options: statuses.map((status) => ({
            value: status,
            name: capitalizeFirstLetter(status),
          })),
          multiSelect: 'or',
        } as FieldValueSelectionFilterConfigType,
        {
          type: 'field_value_selection',
          field: 'logType',
          name: 'Log type',
          options: logType.map((logType) => ({
            value: logType,
            name: capitalizeFirstLetter(logType),
          })),
          multiSelect: 'or',
        } as FieldValueSelectionFilterConfigType,
      ],
    };

    const sorting = {
      sort: {
        field: 'name',
        direction: 'asc',
      },
    };
    return (
      <EuiFlexGroup direction="column">
        <EuiFlexItem>
          <EuiFlexGroup>
            <EuiFlexItem>
              <EuiTitle size="l">
                <h1>Threat detectors</h1>
              </EuiTitle>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiFlexGroup justifyContent="flexEnd">
                <EuiFlexItem grow={false}>{actions[0]}</EuiFlexItem>
                <EuiFlexItem grow={false}>{actions[1]}</EuiFlexItem>
                <EuiFlexItem grow={false}>{actions[2]}</EuiFlexItem>
              </EuiFlexGroup>
            </EuiFlexItem>
          </EuiFlexGroup>
          <EuiSpacer size={'m'} />
        </EuiFlexItem>

        <EuiFlexItem>
          <EuiPanel>
            <EuiInMemoryTable
              items={detectorHits}
              itemId={(item: DetectorHit) => `${item._id}`}
              columns={columns}
              pagination={true}
              sorting={sorting}
              isSelectable={true}
              selection={{ onSelectionChange: this.onSelectionChange }}
              search={search}
              loading={loadingDetectors}
              message={
                <EuiEmptyPrompt
                  style={{ maxWidth: '45em' }}
                  body={
                    <EuiText>
                      <p>There are no existing detectors.</p>
                    </EuiText>
                  }
                  actions={[actions[3]]}
                />
              }
            />
          </EuiPanel>
        </EuiFlexItem>

        {isDeleteModalVisible && (
          <DeleteModal
            closeDeleteModal={this.closeDeleteModal}
            ids={getDetectorNames(selectedItems)}
            onClickDelete={this.onClickDelete}
            type={selectedItems.length > 1 ? 'detectors' : 'detector'}
          />
        )}
      </EuiFlexGroup>
    );
  }
}
