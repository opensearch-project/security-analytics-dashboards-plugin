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
} from '@elastic/eui';
import { capitalizeFirstLetter, renderTime } from '../../../utils/helpers';
import { DEFAULT_EMPTY_DATA, ROUTES } from '../../../utils/constants';
import { Finding, Query } from '../models/interfaces';
import { RuleViewerFlyout } from '../../Rules/components/RuleViewerFlyout/RuleViewerFlyout';
import { RuleSource } from '../../../../server/models/interfaces';
import { RuleItemInfoBase } from '../../Rules/models/types';
import { OpenSearchService, IndexPatternsService } from '../../../services';
import { RuleTableItem } from '../../Rules/utils/helpers';
import { CreateIndexPatternForm } from './CreateIndexPatternForm';

interface FindingDetailsFlyoutProps {
  finding: Finding;
  backButton?: React.ReactNode;
  allRules: { [id: string]: RuleSource };
  opensearchService: OpenSearchService;
  indexPatternsService: IndexPatternsService;
  closeFlyout: () => void;
}

interface FindingDetailsFlyoutState {
  loading: boolean;
  ruleViewerFlyoutData: RuleTableItem | null;
  indexPatternId?: string;
  isCreateIndexPatternModalVisible: boolean;
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
    };
  }

  componentDidMount(): void {
    this.getIndexPatternId().then((patternId) => {
      if (patternId) {
        this.setState({ indexPatternId: patternId });
      }
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

  render() {
    const {
      finding: {
        id,
        detector: {
          _id,
          _source: { name },
        },
        queries,
        timestamp,
      },
      closeFlyout,
      backButton,
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
          <EuiTitle size={'s'}>
            <h3>Rule details</h3>
          </EuiTitle>
          <EuiSpacer size={'m'} />
          {this.renderRuleDetails(queries)}
          <EuiSpacer size="l" />
          {this.renderFindingDocuments()}
        </EuiFlyoutBody>
      </EuiFlyout>
    );
  }
}
