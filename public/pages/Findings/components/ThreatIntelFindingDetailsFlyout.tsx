/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  EuiAccordion,
  EuiBasicTableColumn,
  EuiSmallButtonIcon,
  EuiCodeBlock,
  EuiEmptyPrompt,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiCompressedFormRow,
  EuiInMemoryTable,
  EuiLoadingSpinner,
  EuiSpacer,
  EuiTitle,
} from '@elastic/eui';
import { DataStore } from '../../../store/DataStore';
import {
  FlyoutBaseProps,
  ThreatIntelFindingDetailsFlyoutProps,
  ThreatIntelFindingDocumentItem,
  ThreatIntelIocData,
} from '../../../../types';
import { DEFAULT_EMPTY_DATA } from '../../../utils/constants';
import { renderTime } from '../../../utils/helpers';
import { IocLabel } from '../../../../common/constants';
import { DescriptionGroup } from '../../../components/Utility/DescriptionGroup';

interface ThreatIntelFindingDetailsFlyoutState {
  iocs: Record<string, ThreatIntelIocData>;
  docIdToExpandedRowMap: { [id: string]: JSX.Element };
  docIdToDocument: { [id: string]: string };
}

export class ThreatIntelFindingDetailsFlyout extends React.Component<
  ThreatIntelFindingDetailsFlyoutProps & FlyoutBaseProps,
  ThreatIntelFindingDetailsFlyoutState
> {
  constructor(props: ThreatIntelFindingDetailsFlyoutProps & FlyoutBaseProps) {
    super(props);
    this.state = {
      iocs: {},
      docIdToExpandedRowMap: {},
      docIdToDocument: {},
    };
  }

  createDocumentBlock = (
    item: ThreatIntelFindingDocumentItem,
    onDocUpdate: (documentBlock: JSX.Element) => void
  ) => {
    let formattedDocument = this.state.docIdToDocument[item.id];
    try {
      if (!formattedDocument) {
        DataStore.documents.getDocument(item.index, item.id).then((doc) => {
          formattedDocument = doc ? JSON.stringify(JSON.parse(doc), null, 2) : '';
          onDocUpdate(
            <EuiCompressedFormRow fullWidth={true} style={{ width: '100%' }}>
              {!formattedDocument ? (
                <EuiEmptyPrompt body={<p>Document not found</p>} />
              ) : (
                <EuiCodeBlock
                  language="json"
                  isCopyable
                  data-test-subj={`finding-details-flyout-rule-document-${item.pos}`}
                >
                  {formattedDocument}
                </EuiCodeBlock>
              )}
            </EuiCompressedFormRow>
          );
          this.setState({
            docIdToDocument: {
              ...this.state.docIdToDocument,
              [item.id]: formattedDocument,
            },
          });
        });
      } else {
        return (
          <EuiCompressedFormRow fullWidth={true} style={{ width: '100%' }}>
            <EuiCodeBlock
              language="json"
              isCopyable
              data-test-subj={`finding-details-flyout-rule-document-${item.pos}`}
            >
              {formattedDocument}
            </EuiCodeBlock>
          </EuiCompressedFormRow>
        );
      }
    } catch {
      // no-op
    }

    return (
      <EuiCompressedFormRow fullWidth={true} style={{ width: '100%' }}>
        <EuiCodeBlock
          language="json"
          isCopyable
          data-test-subj={`finding-details-flyout-rule-document-${item.pos}`}
        >
          <EuiLoadingSpinner />
        </EuiCodeBlock>
      </EuiCompressedFormRow>
    );
  };

  toggleDocumentDetails(item: ThreatIntelFindingDocumentItem) {
    const docIdToExpandedRowMapValues = { ...this.state.docIdToExpandedRowMap };

    if (docIdToExpandedRowMapValues[item.id]) {
      delete docIdToExpandedRowMapValues[item.id];
    } else {
      docIdToExpandedRowMapValues[item.id] = this.createDocumentBlock(item, (documentBlock) => {
        this.setState({
          docIdToExpandedRowMap: {
            ...docIdToExpandedRowMapValues,
            [item.id]: documentBlock,
          },
        });
      });
    }

    this.setState({ docIdToExpandedRowMap: docIdToExpandedRowMapValues });
  }

  getRelatedDocuments() {}

  renderFindingDocuments(loadingIndexPatternId: boolean) {
    const {
      finding: { related_doc_ids },
    } = this.props;
    const docIdsByIndex: any = {};

    const documentItems: ThreatIntelFindingDocumentItem[] = [];
    related_doc_ids.forEach((_id, idx) => {
      const [docId, index] = _id.split(':');
      docIdsByIndex[index] = docId;
      documentItems.push({
        id: docId,
        pos: idx,
        index,
      });
    });
    const { docIdToExpandedRowMap } = this.state;

    const documentsColumns: EuiBasicTableColumn<ThreatIntelFindingDocumentItem>[] = [
      {
        name: '',
        render: (item: ThreatIntelFindingDocumentItem) => (
          <EuiSmallButtonIcon
            onClick={() => this.toggleDocumentDetails(item)}
            aria-label={docIdToExpandedRowMap[item.id] ? 'Collapse' : 'Expand'}
            iconType={docIdToExpandedRowMap[item.id] ? 'arrowUp' : 'arrowDown'}
            data-test-subj={`finding-details-flyout-document-toggle-${item.pos}`}
          />
        ),
        width: '30',
        isExpander: true,
      },
      {
        field: 'id',
        name: 'Document Id',
      },
      {
        field: 'index',
        name: 'Index/Alias',
      },
    ];

    return (
      <>
        <EuiTitle size={'s'}>
          <h3>Documents ({related_doc_ids.length})</h3>
        </EuiTitle>
        <EuiSpacer />
        <EuiInMemoryTable
          columns={documentsColumns}
          items={documentItems}
          itemId="id"
          itemIdToExpandedRowMap={docIdToExpandedRowMap}
          isExpandable={true}
          hasActions={true}
          pagination={true}
        />
      </>
    );
  }

  render() {
    const {
      backButton,
      finding: { id, ioc_type, timestamp, ioc_value, ioc_feed_ids },
    } = this.props;
    const { iocs } = this.state;

    return (
      <EuiFlyout
        onClose={DataStore.findings.closeFlyout}
        ownFocus={true}
        size={'m'}
        hideCloseButton
        data-test-subj={'finding-details-flyout'}
      >
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
              <EuiSmallButtonIcon
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
          <DescriptionGroup
            listItems={[
              { title: 'Finding ID', description: id || DEFAULT_EMPTY_DATA },
              { title: 'Finding time', description: renderTime(timestamp) || DEFAULT_EMPTY_DATA },
              { title: 'Indicator type', description: IocLabel[ioc_type] || DEFAULT_EMPTY_DATA },
            ]}
          />
          <EuiSpacer />
          <DescriptionGroup
            listItems={[
              { title: 'Indicator of Compromise', description: ioc_value || DEFAULT_EMPTY_DATA },
            ]}
          />
          <EuiSpacer />
          <DescriptionGroup
            listItems={[
              {
                title: (
                  <EuiTitle size="s">
                    <h4>Threat intel sources ({1})</h4>
                  </EuiTitle>
                ),
                description: (
                  <>
                    <EuiSpacer />
                    {ioc_feed_ids.map(({ ioc_id, feed_id, feed_name }) => {
                      return (
                        <EuiAccordion
                          key={feed_id}
                          id={`threat-intel-finding-feed-${feed_id}`}
                          buttonContent={feed_name}
                          paddingSize="m"
                        >
                          <DescriptionGroup
                            listItems={[
                              {
                                title: 'Reported',
                                description: `${renderTime(iocs[ioc_id]?.created)}`,
                              },
                              {
                                title: 'Severity',
                                description: `${iocs[ioc_id]?.severity || DEFAULT_EMPTY_DATA}`,
                              },
                            ]}
                          />
                        </EuiAccordion>
                      );
                    })}
                  </>
                ),
              },
            ]}
            groupProps={{ direction: 'column' }}
          />
          <EuiSpacer />
          {this.renderFindingDocuments(true)}
        </EuiFlyoutBody>
      </EuiFlyout>
    );
  }
}
