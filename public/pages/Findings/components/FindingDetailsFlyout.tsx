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
  EuiLoadingContent,
} from '@elastic/eui';
import { capitalizeFirstLetter, renderTime } from '../../../utils/helpers';
import { DEFAULT_EMPTY_DATA, ROUTES } from '../../../utils/constants';
import { Query } from '../models/interfaces';
import { RuleViewerFlyout } from '../../Rules/components/RuleViewerFlyout/RuleViewerFlyout';
import { RuleSource } from '../../../../server/models/interfaces';
import { OpenSearchService, IndexPatternsService, CorrelationService } from '../../../services';
import { RuleTableItem } from '../../Rules/utils/helpers';
import { CreateIndexPatternForm } from './CreateIndexPatternForm';
import { FindingItemType } from '../containers/Findings/Findings';
import { CorrelationFinding, RuleItemInfoBase } from '../../../../types';
import { FindingFlyoutTabId, FindingFlyoutTabs } from '../utils/constants';
import { DataStore } from '../../../store/DataStore';
import { CorrelationsTable } from './CorrelationsTable/CorrelationsTable';
import { getSeverityColor } from '../../Correlations/utils/constants';
import { getLogTypeLabel } from '../../LogTypes/utils/helpers';

export interface FindingDetailsFlyoutBaseProps {
  finding: FindingItemType;
  findings: FindingItemType[];
  shouldLoadAllFindings: boolean;
  backButton?: React.ReactNode;
}

export interface FindingDetailsFlyoutProps extends FindingDetailsFlyoutBaseProps {
  opensearchService: OpenSearchService;
  indexPatternsService: IndexPatternsService;
  correlationService: CorrelationService;
  history: History;
}

interface FindingDetailsFlyoutState {
  loading: boolean;
  ruleViewerFlyoutData: RuleTableItem | null;
  indexPatternId?: string;
  isCreateIndexPatternModalVisible: boolean;
  selectedTab: { id: string; content: React.ReactNode | null };
  correlatedFindings: CorrelationFinding[];
  allRules: { [id: string]: RuleSource };
  isDocumentLoading: boolean;
  areCorrelationsLoading: boolean;
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
      selectedTab: {
        id: FindingFlyoutTabId.DETAILS,
        content: (
          <>
            <EuiTitle size={'s'}>
              <h3>Rule details</h3>
            </EuiTitle>
            <EuiSpacer size={'m'} />
            <EuiLoadingContent lines={4} />
          </>
        ),
      },
      correlatedFindings: [],
      isDocumentLoading: true,
      areCorrelationsLoading: true,
      allRules: {},
    };
  }

  getCorrelations = async () => {
    const { id, detector } = this.props.finding;
    let allFindings = this.props.findings;
    if (this.props.shouldLoadAllFindings) {
      // if findings come from the alerts fly-out, we need to get all the findings to match those with the correlations
      allFindings = await DataStore.findings.getAllFindings();
    }

    DataStore.correlations.getCorrelationRules().then((correlationRules) => {
      DataStore.correlations
        .getCorrelatedFindings(id, detector._source?.detector_type)
        .then((findings) => {
          if (findings?.correlatedFindings.length) {
            let correlatedFindings: any[] = [];
            findings.correlatedFindings.map((finding: CorrelationFinding) => {
              allFindings.map((item: FindingItemType) => {
                if (finding.id === item.id) {
                  correlatedFindings.push({
                    ...finding,
                    correlationRule: correlationRules.find(
                      (rule) => finding.rules?.indexOf(rule.id) !== -1
                    ),
                  });
                }
              });
            });
            this.setState({ correlatedFindings });
          }
        })
        .finally(() => {
          this.setState({
            areCorrelationsLoading: false,
          });
        });
    });
  };

  componentDidMount(): void {
    this.getIndexPatternId()
      .then((patternId) => {
        if (patternId) {
          this.setState({ indexPatternId: patternId });
        }
      })
      .finally(() => {
        this.setState({ isDocumentLoading: false });
      });

    this.getCorrelations();

    DataStore.rules.getAllRules().then((rules) => {
      const allRules: { [id: string]: RuleSource } = {};
      rules.forEach((hit) => (allRules[hit._id] = hit._source));
      this.setState({ allRules }, () => {
        this.setState({
          selectedTab: {
            id: FindingFlyoutTabId.DETAILS,
            content: this.getTabContent(FindingFlyoutTabId.DETAILS),
          },
        });
      });
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
    const { allRules = {} } = this.state;
    return rules
      .filter(({ id }) => !id.startsWith('threat_intel_'))
      .map((rule, key) => {
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
                      <EuiText>{getLogTypeLabel(fullRule.category) || DEFAULT_EMPTY_DATA}</EuiText>
                    </EuiFormRow>
                  </EuiFlexItem>
                </EuiFlexGroup>

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

  renderFindingDocuments(isDocumentLoading: boolean) {
    const {
      finding: { index, document_list, related_doc_ids },
    } = this.props;
    const documents = document_list;
    const docId = related_doc_ids[0];
    const matchedDocuments = documents.filter((doc) => doc.id === docId);
    const document = matchedDocuments.length > 0 ? matchedDocuments[0].document : '';
    const { indexPatternId } = this.state;

    return (
      <>
        <EuiFlexGroup justifyContent="spaceBetween">
          <EuiFlexItem>
            <EuiTitle size={'s'}>
              <h3>Documents</h3>
            </EuiTitle>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton
              isLoading={isDocumentLoading}
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
            {JSON.stringify(JSON.parse(document), null, 2)}
          </EuiCodeBlock>
        </EuiFormRow>
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

  private getTabContent(tabId: FindingFlyoutTabId, isDocumentLoading = false) {
    switch (tabId) {
      case FindingFlyoutTabId.CORRELATIONS:
        const logTypes = new Set<string>();
        const ruleSeverity = new Set<string>();
        Object.values(this.state.allRules).forEach((rule) => {
          logTypes.add(rule.category);
          ruleSeverity.add(rule.level);
        });

        return (
          <CorrelationsTable
            finding={this.props.finding}
            correlatedFindings={this.state.correlatedFindings}
            history={this.props.history}
            isLoading={this.state.areCorrelationsLoading}
            filterOptions={{
              logTypes,
              ruleSeverity,
            }}
          />
        );
      case FindingFlyoutTabId.DETAILS:
      default:
        return this.createFindingDetails(isDocumentLoading);
    }
  }

  private createFindingDetails(isDocumentLoading: boolean) {
    const {
      finding: { queries, detectionType },
    } = this.props;

    const showThreatDetectionInfo = detectionType.includes('Threat');
    const showRuleDetailsInfo = detectionType.includes('Detection');
    const severity = 'High';
    const { background, text } = getSeverityColor(severity);

    return (
      <>
        {showThreatDetectionInfo && (
          <>
            <EuiTitle size={'s'}>
              <h3>Threat intelligence feed</h3>
            </EuiTitle>
            <EuiSpacer size={'m'} />
            <div>
              Severity{' '}
              <EuiBadge color={background} style={{ color: text }}>
                {severity}
              </EuiBadge>
            </div>
            <EuiSpacer size="s" />
            <EuiText>
              <p>This finding is generated from a threat intelligence feed IOCs.</p>
            </EuiText>
            <EuiSpacer size={'l'} />
          </>
        )}
        {showRuleDetailsInfo && (
          <>
            <EuiTitle size={'s'}>
              <h3>Rule details</h3>
            </EuiTitle>
            {this.renderRuleDetails(queries)}
            <EuiSpacer size="l" />
          </>
        )}
        {this.renderFindingDocuments(isDocumentLoading)}
      </>
    );
  }

  render() {
    const { backButton } = this.props;
    const {
      finding: { id, timestamp, detectionType },
    } = this.props;
    const { isDocumentLoading } = this.state;
    return (
      <EuiFlyout
        onClose={DataStore.findings.closeFlyout}
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
        <EuiFlyoutHeader>
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
                onClick={DataStore.findings.closeFlyout}
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
              <EuiFormRow label={'Detection type'}>
                <EuiText>{detectionType}</EuiText>
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
                      selectedTab: {
                        id: tab.id,
                        content: this.getTabContent(tab.id, isDocumentLoading),
                      },
                    });
                  }}
                >
                  {tab.id === 'Correlations' ? (
                    <>
                      {tab.name} (
                      {this.state.areCorrelationsLoading
                        ? DEFAULT_EMPTY_DATA
                        : this.state.correlatedFindings.length}
                      )
                    </>
                  ) : (
                    tab.name
                  )}
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
