/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import {
  EuiBadge,
  EuiBadgeGroup,
  EuiCodeBlock,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiFormRow,
  EuiLink,
  EuiSpacer,
  EuiText,
  EuiTitle,
} from '@elastic/eui';
import { OpenSearchService } from '../../../services';
import { renderTime } from '../../../utils/helpers';
import { DEFAULT_EMPTY_DATA } from '../../../utils/constants';
import { parseAlertSeverityToOption } from '../../CreateDetector/components/ConfigureAlerts/utils/helpers';

interface FindingDetailsFlyoutProps extends RouteComponentProps {
  finding: Finding;
  opensearchService: OpenSearchService;
  closeFlyout: () => void;
}

interface FindingDetailsFlyoutState {
  documents: FindingDocument[];
  loading: boolean;
}

export default class FindingDetailsFlyout extends Component<
  FindingDetailsFlyoutProps,
  FindingDetailsFlyoutState
> {
  constructor(props: FindingDetailsFlyoutProps) {
    super(props);
    this.state = {
      documents: [],
      loading: false,
    };
  }

  getDetector = async () => {
    this.setState({ loading: true });
    // TODO: Call the get detector API. Find the rule associated with the
    //  finding to retrieve the rule details for display.
    this.setState({ loading: false });
  };

  getDocument = async () => {
    this.setState({ loading: true });
    const {
      finding: { index, related_doc_ids = [] },
      opensearchService,
    } = this.props;
    try {
      const response = await opensearchService.documentIdsQuery(index, related_doc_ids);
      if (response.ok) {
        this.setState({
          documents: ((response.response.hits.hits as unknown) as FindingDocument[]) || [],
        });
      } else {
        console.error('Failed to retrieve documents: ', response);
      }
    } catch (e) {
      console.error('Failed to retrieve documents: ', e);
    }
    this.setState({ loading: false });
  };

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

  renderRuleDetails = (rules: Query[] = []) => {
    const {
      finding: { index, related_doc_ids },
    } = this.props;
    const { documents } = this.state;
    const docId = related_doc_ids[0];
    const document = documents.filter((doc) => doc.id === docId);
    return rules.map((rule, key) => {
      return (
        <div key={key}>
          <EuiFlexGroup>
            <EuiFlexItem>
              {/*//TODO: Refactor EuiText to EuiLink once rule edit page is available, and hyperlink to that page.*/}
              <EuiFormRow label={'Rule name'}>
                <EuiLink>{rule.name || DEFAULT_EMPTY_DATA}</EuiLink>
              </EuiFormRow>
            </EuiFlexItem>

            <EuiFlexItem>
              <EuiFormRow label={'Rule severity'}>
                <EuiText>
                  {parseAlertSeverityToOption(rule.severity)?.label || DEFAULT_EMPTY_DATA}
                </EuiText>
              </EuiFormRow>
            </EuiFlexItem>

            <EuiFlexItem>
              <EuiFormRow label={'Log type'}>
                <EuiText>{rule.category || DEFAULT_EMPTY_DATA}</EuiText>
              </EuiFormRow>
            </EuiFlexItem>
          </EuiFlexGroup>

          <EuiSpacer size={'m'} />

          <EuiFormRow label={'Description'}>
            <EuiText>{rule.description || DEFAULT_EMPTY_DATA}</EuiText>
          </EuiFormRow>

          <EuiSpacer size={'m'} />

          <EuiFormRow label={'Tags'}>
            <EuiText>{this.renderTags() || DEFAULT_EMPTY_DATA}</EuiText>
          </EuiFormRow>

          <EuiSpacer size={'l'} />

          <EuiTitle size={'s'}>
            <h3>Documents</h3>
          </EuiTitle>
          <EuiSpacer size={'s'} />

          <EuiFlexGroup>
            <EuiFlexItem>
              <EuiFormRow label={'Document ID'}>
                <EuiText>{docId || DEFAULT_EMPTY_DATA}</EuiText>
              </EuiFormRow>
            </EuiFlexItem>

            <EuiFlexItem>
              <EuiFormRow label={'Index'}>
                <EuiText>{index || DEFAULT_EMPTY_DATA}</EuiText>
              </EuiFormRow>
            </EuiFlexItem>
          </EuiFlexGroup>

          <EuiSpacer size={'m'} />

          <EuiFormRow fullWidth={true}>
            <EuiCodeBlock language={'json'} inline={false} isCopyable={true} readOnly={true}>
              {JSON.stringify(document, null, 4)}
            </EuiCodeBlock>
          </EuiFormRow>
        </div>
      );
    });
  };

  render() {
    const {
      finding: { id, detector_name, queries, timestamp },
      closeFlyout,
    } = this.props;
    return (
      <EuiFlyout onClose={closeFlyout} ownFocus={true} size={'m'} type={'push'}>
        <EuiFlyoutHeader hasBorder={true}>
          <EuiTitle size={'m'}>
            <h3>Finding details</h3>
          </EuiTitle>
        </EuiFlyoutHeader>
        <EuiFlyoutBody>
          <EuiFlexGroup>
            <EuiFlexItem>
              <EuiFormRow label={'Finding ID'}>
                <EuiText>{id || DEFAULT_EMPTY_DATA}</EuiText>
              </EuiFormRow>
            </EuiFlexItem>

            <EuiFlexItem>
              <EuiFormRow label={'Finding time'}>
                <EuiText>{renderTime(timestamp) || DEFAULT_EMPTY_DATA}</EuiText>
              </EuiFormRow>
            </EuiFlexItem>

            <EuiFlexItem>
              <EuiFormRow label={'Detector'}>
                {/*//TODO: Refactor EuiText to EuiLink once detector edit page is available, and hyperlink to that page.*/}
                <EuiLink>{detector_name || DEFAULT_EMPTY_DATA}</EuiLink>
              </EuiFormRow>
            </EuiFlexItem>
          </EuiFlexGroup>

          <EuiSpacer size={'m'} />

          <EuiTitle size={'s'}>
            <h3>Rule details</h3>
          </EuiTitle>
          <EuiSpacer size={'s'} />
          {this.renderRuleDetails(queries)}
        </EuiFlyoutBody>
      </EuiFlyout>
    );
  }
}
