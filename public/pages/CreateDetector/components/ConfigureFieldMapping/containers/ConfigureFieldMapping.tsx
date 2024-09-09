/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import {
  EuiTitle,
  EuiText,
  EuiAccordion,
  EuiTabs,
  EuiTab,
  EuiEmptyPrompt,
  EuiCallOut,
} from '@elastic/eui';
import FieldMappingsTable from '../components/RequiredFieldMapping';
import { FieldMapping } from '../../../../../../models/interfaces';
import { EMPTY_FIELD_MAPPINGS_VIEW } from '../utils/constants';
import { GetFieldMappingViewResponse } from '../../../../../../server/models/interfaces';
import FieldMappingService from '../../../../../services/FieldMappingService';
import { MappingViewType } from '../components/RequiredFieldMapping/FieldMappingsTable';
import { CreateDetectorRulesState } from '../../DefineDetector/components/DetectionRules/DetectionRules';
import {
  CreateDetectorSteps,
  Detector,
  SecurityAnalyticsContextType,
} from '../../../../../../types';
import { SecurityAnalyticsContext } from '../../../../../services';

export interface ruleFieldToIndexFieldMap {
  [fieldName: string]: string;
}

export interface ConfigureFieldMappingProps extends RouteComponentProps {
  isEdit: boolean;
  detector: Detector;
  fieldMappingService: FieldMappingService;
  fieldMappings: FieldMapping[];
  loading: boolean;
  enabledRules: CreateDetectorRulesState['allRules'];
  replaceFieldMappings: (mappings: FieldMapping[]) => void;
}

interface ConfigureFieldMappingState {
  loading: boolean;
  detector: Detector;
  mappingsData: GetFieldMappingViewResponse;
  createdMappings: ruleFieldToIndexFieldMap;
  fieldMappingIsOpen: boolean;
  showMappingEmptyPrompt: boolean;
  selectedTabId: FieldMappingTabId;
  selectedTabContent: React.ReactNode | null;
  tabs: any[];
}

enum FieldMappingTabId {
  AutomaticMappings = 'automatic-mappings-tab',
  PendingMappings = 'pending-mappings-tab',
}

export default class ConfigureFieldMapping extends Component<
  ConfigureFieldMappingProps,
  ConfigureFieldMappingState
> {
  public static contextType?:
    | React.Context<SecurityAnalyticsContextType | null>
    | undefined = SecurityAnalyticsContext;

  constructor(props: ConfigureFieldMappingProps) {
    super(props);
    const createdMappings: ruleFieldToIndexFieldMap = {};
    props.fieldMappings.forEach((mapping) => {
      createdMappings[mapping.ruleFieldName] = mapping.indexFieldName;
    });
    this.state = {
      loading: props.loading || false,
      mappingsData: EMPTY_FIELD_MAPPINGS_VIEW,
      createdMappings,
      detector: props.detector,
      fieldMappingIsOpen: false,
      tabs: [],
      selectedTabId: FieldMappingTabId.PendingMappings,
      selectedTabContent: null,
      showMappingEmptyPrompt: false,
    };
  }

  componentDidMount = async () => {
    await this.getAllMappings(this.setupTabs);
  };

  componentDidUpdate(
    prevProps: Readonly<ConfigureFieldMappingProps>,
    prevState: Readonly<ConfigureFieldMappingState>
  ) {
    if (this.shouldUpdateMappingsState(prevProps)) {
      this.setState(
        {
          detector: this.props.detector,
        },
        async () => {
          await this.getAllMappings(this.setupTabs);
        }
      );
    } else if (prevState.createdMappings !== this.state.createdMappings) {
      this.setupTabs();
    }
  }

  private shouldUpdateMappingsState(prevProps: ConfigureFieldMappingProps) {
    const prevDetector = prevProps.detector;
    const newDetector = this.props.detector;

    return (
      !!newDetector.detector_type &&
      newDetector.inputs[0]?.detector_input.indices.length > 0 &&
      (prevDetector.detector_type !== newDetector.detector_type ||
        prevDetector.inputs[0].detector_input.indices !==
          newDetector.inputs[0].detector_input.indices ||
        prevDetector.inputs[0].detector_input.pre_packaged_rules !==
          newDetector.inputs[0].detector_input.pre_packaged_rules ||
        prevDetector.inputs[0].detector_input.custom_rules !==
          newDetector.inputs[0].detector_input.custom_rules)
    );
  }

  setupTabs = () => {
    const {
      loading,
      mappingsData,
      createdMappings,
      selectedTabId,
      detector: { detector_type, inputs },
    } = this.state;
    const existingMappings: ruleFieldToIndexFieldMap = {
      ...createdMappings,
    };

    const mappedRuleFields: string[] = [];
    const logFields: Set<string> = new Set(mappingsData.unmapped_index_fields || []);
    let pendingCount = mappingsData.unmapped_field_aliases?.length || 0;
    const unmappedRuleFields = [...(mappingsData.unmapped_field_aliases || [])];

    Object.keys(mappingsData.properties).forEach((ruleFieldName) => {
      mappedRuleFields.unshift(ruleFieldName);

      if (mappingsData.properties[ruleFieldName].path) {
        logFields.add(mappingsData.properties[ruleFieldName].path);
      }

      // Need this check to avoid adding undefined value
      // When user removes existing mapping for default mapped values, the mapping will be undefined
      if (existingMappings[ruleFieldName]) {
        logFields.add(existingMappings[ruleFieldName]);
      }
    });

    Object.keys(existingMappings).forEach((mappedRuleField) => {
      if (unmappedRuleFields.includes(mappedRuleField)) {
        pendingCount--;
      }
    });

    const indexFieldOptions = Array.from(logFields);

    const tabs = [
      {
        id: FieldMappingTabId.AutomaticMappings,
        name: `Mapped fields (${mappedRuleFields.length})`,
        content: (
          <>
            <EuiText style={{ padding: '10px 0px' }} size="s">
              <p>
                To generate accurate findings, we recommend to review the following field mappings
                between the detection rules fields and the data source fields.
              </p>
            </EuiText>
            <FieldMappingsTable<MappingViewType.Edit>
              {...this.props}
              loading={loading}
              ruleFields={mappedRuleFields}
              indexFields={indexFieldOptions}
              mappingProps={{
                type: MappingViewType.Edit,
                existingMappings,
                onMappingCreation: this.onMappingCreation,
              }}
            />
          </>
        ),
      },
      {
        id: FieldMappingTabId.PendingMappings,
        name: `Available fields (${pendingCount})`,
        content: (
          <>
            <EuiText style={{ padding: '10px 0px' }} size="s">
              <p>
                To generate accurate findings, we recommend mapping all the fields of interest in
                your data source to the detection rules fields.
              </p>
            </EuiText>
            {pendingCount > 0 && (
              <EuiCallOut
                size="s"
                title={`${pendingCount} additional rule fields are available for log field mapping`}
                iconType={'iInCircle'}
              />
            )}
            <FieldMappingsTable<MappingViewType.Edit>
              {...this.props}
              loading={loading}
              ruleFields={unmappedRuleFields}
              indexFields={indexFieldOptions}
              mappingProps={{
                type: MappingViewType.Edit,
                existingMappings,
                onMappingCreation: this.onMappingCreation,
              }}
            />
          </>
        ),
      },
    ];

    const showMappingEmptyPrompt =
      !detector_type ||
      (!mappedRuleFields.length && !unmappedRuleFields.length) ||
      !inputs[0]?.detector_input.indices[0];

    this.setState({
      showMappingEmptyPrompt,
      tabs,
      selectedTabContent:
        tabs[selectedTabId === FieldMappingTabId.AutomaticMappings ? 0 : 1].content,
    });
  };

  private getRuleFieldsForEnabledRules(): Set<string> {
    const ruleFieldsForEnabledRules = new Set<string>();
    this.props.enabledRules.forEach((rule) => {
      rule._source.query_field_names.forEach((fieldname: { value: string }) => {
        ruleFieldsForEnabledRules.add(fieldname.value);
      });
    });

    return ruleFieldsForEnabledRules;
  }

  getAllMappings = async (onMappingsUpdate: () => void) => {
    if (
      this.state.detector.inputs[0]?.detector_input.indices[0] &&
      !!this.state.detector.detector_type
    ) {
      this.setState({ loading: true });
      const mappingsView = await this.props.fieldMappingService.getMappingsView(
        this.state.detector.inputs[0].detector_input.indices[0],
        this.state.detector.detector_type.toLowerCase()
      );
      if (mappingsView.ok) {
        const existingMappings = { ...this.state.createdMappings };
        const ruleFieldsForEnabledRules = this.getRuleFieldsForEnabledRules();
        const unmappedRuleFields = new Set(mappingsView.response.unmapped_field_aliases);

        Object.keys(mappingsView.response.properties).forEach((ruleFieldName) => {
          // Filter the mappings view to include only the rule fields for the enabled rules except for the timestamp field
          if (
            ruleFieldsForEnabledRules.size === 0 ||
            (!ruleFieldsForEnabledRules.has(ruleFieldName) && ruleFieldName !== 'timestamp')
          ) {
            delete mappingsView.response.properties[ruleFieldName];
            delete existingMappings[ruleFieldName];
            return;
          }

          existingMappings[ruleFieldName] =
            this.state.createdMappings[ruleFieldName] ||
            mappingsView.response.properties[ruleFieldName].path;
        });
        let threatIntelFeedFields = new Set();

        // Only if threat_intel is enabled, we want to show the relevant fields for mapping
        if (this.state.detector.threat_intel_enabled) {
          mappingsView.response.threat_intel_field_aliases?.forEach(({ fields }) => {
            fields.forEach((field) => threatIntelFeedFields.add(field));
          });
        }

        mappingsView.response.unmapped_field_aliases?.forEach((ruleFieldName) => {
          if (
            ruleFieldName !== 'timestamp' &&
            !ruleFieldsForEnabledRules.has(ruleFieldName) &&
            !threatIntelFeedFields.has(ruleFieldName)
          ) {
            unmappedRuleFields.delete(ruleFieldName);
          }
        });

        this.setState(
          {
            createdMappings: existingMappings,
            mappingsData: {
              ...mappingsView.response,
              unmapped_field_aliases: Array.from(unmappedRuleFields),
            },
            fieldMappingIsOpen: !!unmappedRuleFields.size,
            loading: false,
          },
          onMappingsUpdate
        );
        this.updateMappingSharedState(existingMappings);
      } else {
        this.setState({ loading: false });
      }
    }
  };

  onMappingCreation = (ruleFieldName: string, indexFieldName: string): void => {
    const newMappings: ruleFieldToIndexFieldMap = {
      ...this.state.createdMappings,
      [ruleFieldName]: indexFieldName,
    };

    if (!indexFieldName) {
      delete newMappings[ruleFieldName];
    }

    this.setState({
      createdMappings: newMappings,
    });
    this.updateMappingSharedState(newMappings);
    this.context.metrics.detectorMetricsManager.sendMetrics(
      CreateDetectorSteps.fieldMappingsConfigured
    );
  };

  updateMappingSharedState = (createdMappings: ruleFieldToIndexFieldMap) => {
    this.props.replaceFieldMappings(
      Object.entries(createdMappings).map((entry) => {
        return {
          ruleFieldName: entry[0],
          indexFieldName: entry[1],
        };
      })
    );
  };

  renderTabs() {
    return this.state.tabs.map((tab, index) => (
      <EuiTab
        key={index}
        onClick={() => this.setState({ selectedTabId: tab.id, selectedTabContent: tab.content })}
        isSelected={this.state.selectedTabId === tab.id}
        size="s"
      >
        {tab.name}
      </EuiTab>
    ));
  }

  render() {
    const { selectedTabContent, fieldMappingIsOpen, showMappingEmptyPrompt } = this.state;

    return (
      <EuiAccordion
        buttonContent={
          <>
            <EuiTitle size={'s'}>
              <h4>
                Field mapping - <em>optional</em>
              </h4>
            </EuiTitle>
            <EuiText size="s" color="subdued">
              To perform threat detection the field names from your data source have to be mapped to
              detection rules field names.
            </EuiText>
          </>
        }
        buttonProps={{ style: { padding: '5px' } }}
        id={'mappedTitleFieldsAccordion'}
        initialIsOpen={false}
        forceState={fieldMappingIsOpen ? 'open' : 'closed'}
        onToggle={(isOpen) => {
          this.setState({ fieldMappingIsOpen: isOpen });
        }}
      >
        {showMappingEmptyPrompt ? (
          <EuiEmptyPrompt
            title={
              <EuiTitle size="xs">
                <h4>No field mappings to display</h4>
              </EuiTitle>
            }
            body={
              <EuiText size="s">
                <p>
                  Automatically mapped fields and additional fields that may
                  <br /> require manual mapping will be shown here. Select log type
                  <br /> for your data source.
                </p>
              </EuiText>
            }
          />
        ) : (
          <div style={{ paddingLeft: '30px' }}>
            <EuiTabs size="s">{this.renderTabs()}</EuiTabs>
            {selectedTabContent}
          </div>
        )}
      </EuiAccordion>
    );
  }
}
