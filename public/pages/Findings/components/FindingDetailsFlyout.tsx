/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import {
  EuiAccordion,
  EuiBadge,
  EuiBadgeGroup,
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
  EuiSpacer,
  EuiText,
  EuiTitle,
} from '@elastic/eui';
import { renderTime } from '../../../utils/helpers';
import { DEFAULT_EMPTY_DATA } from '../../../utils/constants';
import { Query } from '../models/interfaces';

interface FindingDetailsFlyoutProps {
  finding: Finding;
  closeFlyout: () => void;
  backButton?: React.ReactNode;
  allRules: object;
}

interface FindingDetailsFlyoutState {
  loading: boolean;
}

export default class FindingDetailsFlyout extends Component<
  FindingDetailsFlyoutProps,
  FindingDetailsFlyoutState
> {
  constructor(props: FindingDetailsFlyoutProps) {
    super(props);
    this.state = {
      loading: false,
    };
  }

  getDetector = async () => {
    this.setState({ loading: true });
    // TODO: Call the get detector API. Find the rule associated with the
    //  finding to retrieve the rule details for display.
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
      allRules,
      finding: { index, related_doc_ids, document_list },
    } = this.props;
    const documents = document_list;
    const docId = related_doc_ids[0];
    const document = documents.filter((doc) => doc.id === docId);
    return rules.map((rule, key) => {
      const fullRule = allRules[rule.id];
      return (
        <div key={key}>
          <EuiAccordion
            id={`${key}`}
            buttonContent={fullRule.title}
            initialIsOpen={rules.length === 1}
          >
            <EuiSpacer size={'m'} />
            <EuiFlexGroup>
              <EuiFlexItem>
                {/*//TODO: Refactor EuiText to EuiLink once rule view page is available, and hyperlink to that page.*/}
                <EuiFormRow label={'Rule name'}>
                  <EuiText>{fullRule.title || DEFAULT_EMPTY_DATA}</EuiText>
                </EuiFormRow>
              </EuiFlexItem>

              <EuiFlexItem>
                <EuiFormRow label={'Rule severity'}>
                  <EuiText>{fullRule.level || DEFAULT_EMPTY_DATA}</EuiText>
                </EuiFormRow>
              </EuiFlexItem>

              <EuiFlexItem>
                <EuiFormRow label={'Log type'}>
                  <EuiText>{fullRule.category || DEFAULT_EMPTY_DATA}</EuiText>
                </EuiFormRow>
              </EuiFlexItem>
            </EuiFlexGroup>

            <EuiSpacer size={'m'} />

            <EuiFormRow label={'Description'}>
              <EuiText>{fullRule.description || DEFAULT_EMPTY_DATA}</EuiText>
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
          </EuiAccordion>
          {rules.length > 1 && <EuiHorizontalRule />}
        </div>
      );
    });
  };

  render() {
    const {
      finding: {
        id,
        detector: {
          _source: { name },
        },
        queries,
        timestamp,
      },
      closeFlyout,
      backButton,
    } = this.props;
    return (
      <EuiFlyout onClose={closeFlyout} ownFocus={true} size={'m'} hideCloseButton>
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
              <EuiButtonIcon iconType="cross" display="empty" iconSize="m" onClick={closeFlyout} />
            </EuiFlexItem>
          </EuiFlexGroup>
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
                <EuiText>{name || DEFAULT_EMPTY_DATA}</EuiText>
              </EuiFormRow>
            </EuiFlexItem>
          </EuiFlexGroup>

          <EuiSpacer size={'m'} />

          <EuiTitle size={'s'}>
            <h3>Rule details</h3>
          </EuiTitle>
          <EuiSpacer size={'m'} />
          {this.renderRuleDetails(queries)}
        </EuiFlyoutBody>
      </EuiFlyout>
    );
  }
}
