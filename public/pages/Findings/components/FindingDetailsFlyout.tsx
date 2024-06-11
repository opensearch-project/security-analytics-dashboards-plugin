/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import {
  EuiAccordion,
  EuiBadge,
  EuiBadgeGroup,
  EuiButton,
  EuiButtonIcon,
  EuiCodeBlock,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiFormRow,
  EuiHorizontalRule,
  EuiLink,
  EuiModal,
  EuiModalBody,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiPanel,
  EuiSpacer,
  EuiText,
  EuiTitle,
  EuiIcon,
  EuiTabs,
  EuiTab,
  EuiInMemoryTable,
  EuiBasicTableColumn,
  EuiEmptyPrompt,
} from '@elastic/eui';
import { capitalizeFirstLetter, renderTime } from '../../../utils/helpers';
import { DEFAULT_EMPTY_DATA, ROUTES } from '../../../utils/constants';
import { Query } from '../models/interfaces';
import { RuleViewerFlyout } from '../../Rules/components/RuleViewerFlyout/RuleViewerFlyout';
import { RuleSource } from '../../../../server/models/interfaces';
import { OpenSearchService, IndexPatternsService, CorrelationService } from '../../../services';
import { getSeverityBadge, RuleTableItem } from '../../Rules/utils/helpers';
import { CreateIndexPatternForm } from './CreateIndexPatternForm';
import { FindingItemType } from '../containers/Findings/Findings';
import { CorrelationFinding, RuleItemInfoBase } from '../../../../types';
import { FindingFlyoutTabId, FindingFlyoutTabs } from '../utils/constants';
import { DataStore } from '../../../store/DataStore';
import { RouteComponentProps } from 'react-router-dom';
import { ruleTypes } from '../../Rules/utils/constants';

interface FindingDetailsFlyoutProps extends RouteComponentProps {
  finding: FindingItemType;
  findings: FindingItemType[];
  backButton?: React.ReactNode;
  allRules: { [id: string]: RuleSource };
  opensearchService: OpenSearchService;
  indexPatternsService: IndexPatternsService;
  correlationService: CorrelationService;
  closeFlyout: () => void;
}

interface FindingDetailsFlyoutState {
  loading: boolean;
  ruleViewerFlyoutData: RuleTableItem | null;
  indexPatternId?: string;
  isCreateIndexPatternModalVisible: boolean;
  selectedTab: { id: string; content: React.ReactNode | null };
  correlatedFindings: CorrelationFinding[];
}

export default class FindingDetailsFlyout extends Component<
  FindingDetailsFlyoutProps,
  FindingDetailsFlyoutState
> {
  constructor(props: FindingDetailsFlyoutProps) {
    super(props);
    this.state = {
      loading: false,
      ruleViewerFlyoutData: null,
      isCreateIndexPatternModalVisible: false,
      selectedTab: { id: FindingFlyoutTabId.DETAILS, content: null },
      correlatedFindings: [],
    };
  }

  componentDidMount(): void {
    this.getIndexPatternId().then((patternId) => {
      if (patternId) {
        this.setState({ indexPatternId: patternId });
      }
    });

    const { id, detector } = this.props.finding;
    const allFindings = this.props.findings;
    DataStore.correlationsStore
      .getCorrelatedFindings(id, detector._source?.detector_type)
      .then((findings) => {
        if (findings?.correlatedFindings.length) {
          let correlatedFindings: any[] = [];
          findings.correlatedFindings.map((finding) => {
            allFindings.map((item) => {
              if (finding.id === item.id) {
                correlatedFindings.push(finding);
              }
            });
          });
          this.setState({ correlatedFindings });
        }
      });

    this.setState({
      selectedTab: {
        id: FindingFlyoutTabId.DETAILS,
        content: this.getTabContent(FindingFlyoutTabId.DETAILS),
      },
    });
  }

  renderTags = () => {
    const { finding } = this.props;
    const tags = finding.queries[0].tags || [];
    return (
      tags && (
        <EuiBadgeGroup gutterSize={'s'}>
          {tags.map((tag, key) => (
            <EuiBadge key={key}>{tag}</EuiBadge>
          ))}
        </EuiBadgeGroup>
      )
    );
  };

  showRuleDetails = (fullRule: any, ruleId: string) => {
    this.setState({
      ...this.state,
      ruleViewerFlyoutData: {
        ruleId: ruleId,
        title: fullRule.title,
        level: fullRule.level,
        category: fullRule.category,
        description: fullRule.description,
        source: fullRule.source,
        ruleInfo: {
          _source: fullRule,
          prePackaged: fullRule.prePackaged,
        } as RuleItemInfoBase,
      },
    });
  };

  hideRuleDetails = () => {
    this.setState({ ...this.state, ruleViewerFlyoutData: null });
  };

  renderRuleDetails = (rules: Query[] = []) => {
    const { allRules } = this.props;
    return rules.map((rule, key) => {
      const fullRule = allRules[rule.id];
      const severity = capitalizeFirstLetter(fullRule.level);
      return (
        <div key={key}>
          <EuiAccordion
            id={`${key}`}
            buttonClassName="euiAccordionForm__button"
            buttonContent={
              <div data-test-subj={'finding-details-flyout-rule-accordion-button'}>
                <EuiText size={'s'}>{fullRule.title}</EuiText>
                <EuiText size={'s'} color={'subdued'}>
                  Severity: {severity}
                </EuiText>
              </div>
            }
            initialIsOpen={rules.length === 1}
            data-test-subj={`finding-details-flyout-rule-accordion-${key}`}
          >
            <EuiPanel color="subdued">
              <EuiFlexGroup>
                <EuiFlexItem>
                  <EuiFormRow label={'Rule name'}>
                    <EuiLink
                      onClick={() => this.showRuleDetails(fullRule, rule.id)}
                      data-test-subj={`finding-details-flyout-${fullRule.title}-details`}
                    >
                      {fullRule.title || DEFAULT_EMPTY_DATA}
                    </EuiLink>
                  </EuiFormRow>
                </EuiFlexItem>

                <EuiFlexItem>
                  <EuiFormRow
                    label={'Rule severity'}
                    data-test-subj={'finding-details-flyout-rule-severity'}
                  >
                    <EuiText>{severity || DEFAULT_EMPTY_DATA}</EuiText>
                  </EuiFormRow>
                </EuiFlexItem>

                <EuiFlexItem>
                  <EuiFormRow
                    label={'Log type'}
                    data-test-subj={'finding-details-flyout-rule-category'}
                  >
                    <EuiText>
                      {capitalizeFirstLetter(fullRule.category) || DEFAULT_EMPTY_DATA}
                    </EuiText>
                  </EuiFormRow>
                </EuiFlexItem>
              </EuiFlexGroup>

              <EuiSpacer size={'m'} />

              <EuiFormRow
                label={'Description'}
                data-test-subj={'finding-details-flyout-rule-description'}
              >
                <EuiText>{fullRule.description || DEFAULT_EMPTY_DATA}</EuiText>
              </EuiFormRow>

              <EuiSpacer size={'m'} />

              <EuiFormRow label={'Tags'} data-test-subj={'finding-details-flyout-rule-tags'}>
                <EuiText>{this.renderTags() || DEFAULT_EMPTY_DATA}</EuiText>
              </EuiFormRow>
            </EuiPanel>
          </EuiAccordion>
          {rules.length > 1 && <EuiHorizontalRule margin={'xs'} />}
        </div>
      );
    });
  };

  getIndexPatternId = async () => {
    const indexPatterns = await this.props.opensearchService.getIndexPatterns();
    const {
      finding: { index },
    } = this.props;
    let patternId;
    indexPatterns.map((pattern) => {
      const patternName = pattern.attributes.title.replaceAll('*', '.*');
      const patternRegex = new RegExp(patternName);
      if (index.match(patternRegex)) {
        patternId = pattern.id;
      }
    });

    return patternId;
  };

  renderFindingDocuments() {
    const {
      finding: { index, document_list, related_doc_ids },
    } = this.props;
    const documents = document_list;
    const docId = related_doc_ids[0];
    const matchedDocuments = documents.filter((doc) => doc.id === docId);
    const document = matchedDocuments.length > 0 ? matchedDocuments[0].document : '';
    let formattedDocument = '';
    try {
      formattedDocument = document ? JSON.stringify(JSON.parse(document), null, 2) : '';
    } catch {
      // no-op
    }

    const { indexPatternId } = this.state;

    return document ? (
      <>
        <EuiFlexGroup justifyContent="spaceBetween">
          <EuiFlexItem>
            <EuiTitle size={'s'}>
              <h3>Documents</h3>
            </EuiTitle>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton
              data-test-subj={'finding-details-flyout-view-surrounding-documents'}
              onClick={() => {
                if (indexPatternId) {
                  window.open(
                    `discover#/context/${indexPatternId}/${related_doc_ids[0]}`,
                    '_blank'
                  );
                } else {
                  this.setState({ ...this.state, isCreateIndexPatternModalVisible: true });
                }
              }}
            >
              View surrounding documents
              <EuiIcon type={'popout'} />
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>

        <EuiSpacer size={'s'} />

        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiFormRow
              label={'Document ID'}
              data-test-subj={'finding-details-flyout-rule-document-id'}
            >
              <EuiText>{docId || DEFAULT_EMPTY_DATA}</EuiText>
            </EuiFormRow>
          </EuiFlexItem>

          <EuiFlexItem>
            <EuiFormRow
              label={'Index'}
              data-test-subj={'finding-details-flyout-rule-document-index'}
            >
              <EuiText>{index || DEFAULT_EMPTY_DATA}</EuiText>
            </EuiFormRow>
          </EuiFlexItem>
        </EuiFlexGroup>

        <EuiSpacer size={'m'} />

        <EuiFormRow fullWidth={true}>
          <EuiCodeBlock
            language="json"
            isCopyable
            data-test-subj={'finding-details-flyout-rule-document'}
          >
            {formattedDocument}
          </EuiCodeBlock>
        </EuiFormRow>
      </>
    ) : (
      <>
        <EuiTitle size={'s'}>
          <h3>Documents</h3>
        </EuiTitle>
        <EuiSpacer />
        <EuiEmptyPrompt
          iconType="alert"
          iconColor="danger"
          title={<h2>Document not found</h2>}
          body={<p>The document that generated this finding could not be loaded.</p>}
        />
      </>
    );
  }

  createIndexPatternModal() {
    const {
      finding: { related_doc_ids },
    } = this.props;
    if (this.state.isCreateIndexPatternModalVisible) {
      return (
        <EuiModal
          style={{ width: 800 }}
          onClose={() => this.setState({ ...this.state, isCreateIndexPatternModalVisible: false })}
        >
          <EuiModalHeader>
            <EuiModalHeaderTitle>
              <h1>Create index pattern to view documents</h1>
            </EuiModalHeaderTitle>
          </EuiModalHeader>

          <EuiModalBody>
            <CreateIndexPatternForm
              indexPatternsService={this.props.indexPatternsService}
              initialValue={{
                name: this.props.finding.detector._source.inputs[0].detector_input.indices[0] + '*',
              }}
              close={() =>
                this.setState({ ...this.state, isCreateIndexPatternModalVisible: false })
              }
              created={(indexPatternId) => {
                this.setState({
                  ...this.state,
                  indexPatternId,
                  isCreateIndexPatternModalVisible: false,
                });
                window.open(`discover#/context/${indexPatternId}/${related_doc_ids[0]}`, '_blank');
              }}
            ></CreateIndexPatternForm>
          </EuiModalBody>
        </EuiModal>
      );
    }
  }

  private getTabContent(tabId: FindingFlyoutTabId) {
    switch (tabId) {
      case FindingFlyoutTabId.CORRELATIONS:
        return this.createCorrelationsTable();
      case FindingFlyoutTabId.DETAILS:
      default:
        return this.createFindingDetails();
    }
  }

  private goToCorrelationsPage = () => {
    const { correlatedFindings } = this.state;
    const { finding } = this.props;

    this.props.history.push({
      pathname: `${ROUTES.CORRELATIONS}`,
      state: {
        finding: finding,
        correlatedFindings: correlatedFindings,
      },
    });
  };

  private createCorrelationsTable() {
    const columns: EuiBasicTableColumn<CorrelationFinding>[] = [
      {
        field: 'timestamp',
        name: 'Time',
        sortable: true,
      },
      {
        field: 'id',
        name: 'Correlated finding id',
      },
      {
        field: 'logType',
        name: 'Log type',
        sortable: true,
        render: (category: string) =>
          // TODO: This formatting may need some refactoring depending on the response payload
          ruleTypes.find((ruleType) => ruleType.value === category)?.label || DEFAULT_EMPTY_DATA,
      },
      {
        name: 'Rule severity',
        truncateText: true,
        align: 'center',
        render: (item: CorrelationFinding) => getSeverityBadge(item.detectionRule.severity),
      },
      {
        field: 'correlationScore',
        name: 'Score',
        sortable: true,
      },
    ];

    return (
      <>
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiTitle size="s">
              <h3>Correlated findings</h3>
            </EuiTitle>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton
              onClick={() => this.goToCorrelationsPage()}
              disabled={this.state.correlatedFindings.length === 0}
            >
              View correlations graph
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiInMemoryTable
              columns={columns}
              items={this.state.correlatedFindings}
              pagination={true}
              search={true}
              sorting={true}
            />
          </EuiFlexItem>
        </EuiFlexGroup>
      </>
    );
  }

  private createFindingDetails() {
    const {
      finding: { queries },
    } = this.props;

    return (
      <>
        <EuiTitle size={'s'}>
          <h3>Rule details</h3>
        </EuiTitle>
        <EuiSpacer size={'m'} />
        {this.renderRuleDetails(queries)}
        <EuiSpacer size="l" />
        {this.renderFindingDocuments()}
      </>
    );
  }

  render() {
    const { closeFlyout, backButton } = this.props;
    const {
      finding: {
        id,
        detector: {
          _id,
          _source: { name },
        },
        timestamp,
      },
    } = this.props;
    return (
      <EuiFlyout
        onClose={closeFlyout}
        ownFocus={true}
        size={'m'}
        hideCloseButton
        data-test-subj={'finding-details-flyout'}
      >
        {this.state.ruleViewerFlyoutData && (
          <RuleViewerFlyout
            hideFlyout={this.hideRuleDetails}
            ruleTableItem={this.state.ruleViewerFlyoutData}
          />
        )}
        {this.createIndexPatternModal()}
        <EuiFlyoutHeader hasBorder={true}>
          <EuiFlexGroup justifyContent="flexStart" alignItems="center">
            <EuiFlexItem>
              <EuiFlexGroup alignItems="center">
                {!!backButton ? <EuiFlexItem grow={false}>{backButton}</EuiFlexItem> : null}
                <EuiFlexItem>
                  <EuiTitle size={'m'}>
                    <h3>Finding details</h3>
                  </EuiTitle>
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiButtonIcon
                aria-label="close"
                iconType="cross"
                display="empty"
                iconSize="m"
                onClick={closeFlyout}
                data-test-subj={`close-finding-details-flyout`}
              />
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlyoutHeader>
        <EuiFlyoutBody>
          <EuiFlexGroup>
            <EuiFlexItem>
              <EuiFormRow label={'Finding ID'}>
                <EuiText data-test-subj={'finding-details-flyout-finding-id'}>
                  {id || DEFAULT_EMPTY_DATA}
                </EuiText>
              </EuiFormRow>
            </EuiFlexItem>

            <EuiFlexItem>
              <EuiFormRow
                label={'Finding time'}
                data-test-subj={'finding-details-flyout-timestamp'}
              >
                <EuiText>{renderTime(timestamp) || DEFAULT_EMPTY_DATA}</EuiText>
              </EuiFormRow>
            </EuiFlexItem>

            <EuiFlexItem>
              <EuiFormRow label={'Detector'}>
                <EuiLink
                  href={`#${ROUTES.DETECTOR_DETAILS}/${_id}`}
                  target={'_blank'}
                  data-test-subj={'finding-details-flyout-detector-link'}
                >
                  {name || DEFAULT_EMPTY_DATA}
                </EuiLink>
              </EuiFormRow>
            </EuiFlexItem>
          </EuiFlexGroup>

          <EuiSpacer size={'m'} />
          <EuiTabs>
            {FindingFlyoutTabs.map((tab) => {
              return (
                <EuiTab
                  key={tab.id}
                  isSelected={tab.id === this.state.selectedTab.id}
                  onClick={() => {
                    this.setState({
                      selectedTab: { id: tab.id, content: this.getTabContent(tab.id) },
                    });
                  }}
                >
                  {tab.name}
                </EuiTab>
              );
            })}
          </EuiTabs>
          <EuiSpacer />
          {this.state.selectedTab.content}
        </EuiFlyoutBody>
      </EuiFlyout>
    );
  }
}
