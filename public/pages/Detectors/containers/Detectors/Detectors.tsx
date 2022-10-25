/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { ContentPanel } from '../../../../components/ContentPanel';
import {
  EuiBasicTableColumn,
  EuiButton,
  EuiContextMenuItem,
  EuiContextMenuPanel,
  EuiEmptyPrompt,
  EuiInMemoryTable,
  EuiLink,
  EuiPopover,
  EuiSpacer,
  EuiText,
} from '@elastic/eui';
import { BREADCRUMBS, DEFAULT_EMPTY_DATA, PLUGIN_NAME, ROUTES } from '../../../../utils/constants';
import DeleteModal from '../../../../components/DeleteModal';
import { getDetectorNames } from '../../utils/helpers';
import { renderTime } from '../../../../utils/helpers';
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
      this.setState({
        detectorHits: res.response.hits.hits,
      });
    }

    this.setState({ loadingDetectors: false });
  };

  onClickCreate = () => {
    // TODO: Implement once API is available
  };

  onClickEdit = () => {
    // TODO: Implement once API is available
  };

  openDeleteModal = () => {
    this.setState({ isDeleteModalVisible: true });
  };

  closeDeleteModal = () => {
    this.setState({ isDeleteModalVisible: false });
  };

  onClickDelete = async () => {
    const { selectedItems } = this.state;
    for (let item of selectedItems) {
      await this.deleteDetector(item._source.name);
    }
    await this.getDetectors();
  };

  deleteDetector = async (id: string) => {
    // TODO: Implement once API is available
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
        <EuiContextMenuPanel
          items={[
            <EuiContextMenuItem
              key={'Edit'}
              icon={'empty'}
              disabled={selectedItems.length !== 1}
              onClick={() => {
                this.closeActionsPopover();
                this.onClickEdit();
              }}
              data-test-subj={'editButton'}
            >
              Edit
            </EuiContextMenuItem>,
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
            <EuiContextMenuItem
              key={'StartDetector'}
              icon={'empty'}
              disabled={selectedItems.length !== 1}
              onClick={() => {
                this.closeActionsPopover();
                this.openDeleteModal();
              }}
              data-test-subj={'startDetectorButton'}
            >
              Start detector
            </EuiContextMenuItem>,
            <EuiContextMenuItem
              key={'StopDetector'}
              icon={'empty'}
              disabled={selectedItems.length !== 1}
              onClick={() => {
                this.closeActionsPopover();
                this.openDeleteModal();
              }}
              data-test-subj={'stopDetectorButton'}
            >
              Stop detector
            </EuiContextMenuItem>,
          ]}
        />
      </EuiPopover>,
      <EuiButton
        href={`${PLUGIN_NAME}#${ROUTES.DETECTORS_CREATE}`}
        fill={true}
        onClick={this.onClickCreate}
        data-test-subj={'detectorsCreateButton'}
      >
        Create detector
      </EuiButton>,
    ];

    const columns: EuiBasicTableColumn<DetectorHit>[] = [
      {
        name: 'Detector name',
        render: (item: DetectorHit) => (
          <EuiLink onClick={() => this.showDetectorDetails(item)}>{item._source.name}</EuiLink>
        ),
      },
      {
        name: 'Status',
        render: (item: DetectorHit) => (item._source.enabled ? 'ACTIVE' : 'INACTIVE'),
      },
      {
        name: 'Log type',
        render: (item: DetectorHit) => item._source.detector_type || DEFAULT_EMPTY_DATA,
      },
      {
        name: 'Rules',
        render: (item: DetectorHit) => {
          const { custom_rules, pre_packaged_rules } = item._source.inputs[0].detector_input;
          return custom_rules.length + pre_packaged_rules.length || DEFAULT_EMPTY_DATA;
        },
      },
      {
        name: 'Last updated time',
        render: (item: DetectorHit) => {
          return renderTime(item._source.last_update_time) || DEFAULT_EMPTY_DATA;
        },
      },
    ];

    const statuses = [
      ...new Set(
        detectorHits.map((detector) => (detector._source.enabled ? 'Active' : 'InActive'))
      ),
    ];
    const logType = [...new Set(detectorHits.map((detector) => detector._source.detector_type))];
    const search = {
      box: { placeholder: 'Search threat detectors' },
      filters: [
        {
          type: 'field_value_selection',
          field: 'status',
          name: 'Status',
          options: statuses.map((status) => ({ value: status })),
          multiSelect: 'or',
        } as FieldValueSelectionFilterConfigType,
        {
          type: 'field_value_selection',
          field: 'type',
          name: 'Log type',
          options: logType.map((logType) => ({ value: logType })),
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
      <ContentPanel title={'Threat detectors'} actions={actions}>
        <EuiSpacer size={'m'} />
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

        {isDeleteModalVisible && (
          <DeleteModal
            closeDeleteModal={this.closeDeleteModal}
            ids={getDetectorNames(selectedItems)}
            onClickDelete={this.onClickDelete}
            type={selectedItems.length > 1 ? 'detectors' : 'detector'}
          />
        )}
      </ContentPanel>
    );
  }
}
