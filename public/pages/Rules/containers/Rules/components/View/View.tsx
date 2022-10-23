/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  EuiModalBody,
  EuiCodeBlock,
  EuiSpacer,
  EuiFlyoutHeader,
  EuiMarkdownEditor,
  EuiButton,
  EuiConfirmModal,
  EuiText,
  EuiDescriptionList,
  EuiDescriptionListTitle,
  EuiDescriptionListDescription,
  EuiFlexGroup,
  EuiFlexItem,
} from '@elastic/eui';

export const View = (props: any) => {
  const [showEditor, setEditor] = useState<boolean>(false);
  const [currentMode, setCurrentMode] = useState<string>('Edit');
  const [showSave, setSave] = useState(false);
  const { content } = props;
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDestroyModalVisible, setIsDestroyModalVisible] = useState(false);
  const closeModal = () => setIsModalVisible(false);
  const showModal = () => setIsModalVisible(true);
  const closeDestroyModal = () => setIsDestroyModalVisible(false);
  const showDestroyModal = () => setIsDestroyModalVisible(true);
  const { ruleType } = props;

  let modal;

  const initialContent = `
  title: ${content.title}
  status: ${content.status}
  level: ${content.level}
  last modified: ${content.last_update_time} 
  `;

  const [value, setValue] = useState(initialContent);

  useEffect(() => {
    setSave(false);
    if (value !== initialContent) {
      setSave(true);
    }
  });

  const buttonDisplay = () => {
    if (currentMode === 'Edit') {
      setCurrentMode('Cancel');
      setEditor(true);
    } else {
      if (value !== initialContent) {
        showModal();
      } else {
        setCurrentMode('Edit');
        setEditor(false);
      }
    }
  };

  const ruleInfoLeft = [
    {
      title: 'Author:',
      description: content.author,
    },
    {
      title: 'Title:',
      description: content.title,
    },
    {
      title: 'Description:',
      description: content.description,
    },
    {
      title: 'Category:',
      description: content.category,
    },
  ];

  const ruleInfoRight = [
    {
      title: 'Status:',
      description: content.status,
    },
    {
      title: 'Level:',
      description: content.level,
    },
    {
      title: 'Last Modified:',
      description: content.last_update_time,
    },
    {
      title: 'Tags:',
      description: content.tags
        ? content.tags.map((tag: string | any) => {
            return <div key={tag.value}>{tag.value}</div>;
          })
        : 'None',
    },
  ];

  const ruleInfoBottom = [
    {
      title: 'Falsepositives:',
      description: content.falsepositives
        ? content.falsepositives.map((falsepositive: string | any) => {
            return <div key={falsepositive.value}>{falsepositive.value}</div>;
          })
        : 'None',
    },
    {
      title: 'References:',
      description: content.references
        ? content.references.map((reference: string | any) => {
            return (
              <a href={reference.value} target="_blank" key={reference.value}>
                {reference.value}
              </a>
            );
          })
        : 'None',
    },
    {
      title: 'Queries:',
      description: content.queries
        ? content.queries.map((query: string | any) => {
            return <div key={query.value}>{query.value}</div>;
          })
        : 'None',
    },
  ];

  if (isModalVisible) {
    modal = (
      <EuiConfirmModal
        title="Cancel edit"
        onCancel={closeModal}
        onConfirm={closeModal}
        cancelButtonText="Go back"
        confirmButtonText="Cancel"
        defaultFocusedButton="confirm"
      >
        <EuiText>
          You will lose changes to: <b>{content.title}</b>
        </EuiText>
        <p>Are you sure you want to do this?</p>
      </EuiConfirmModal>
    );
  }

  let destroyModal;

  if (isDestroyModalVisible) {
    destroyModal = (
      <EuiConfirmModal
        title="Delete Rule"
        onCancel={closeDestroyModal}
        onConfirm={closeDestroyModal}
        cancelButtonText="Cancel"
        confirmButtonText="Delete"
        buttonColor="danger"
        defaultFocusedButton="confirm"
      >
        <EuiText>
          Delete rule: <b>{content.title}</b>
        </EuiText>
        <EuiSpacer />
        <EuiText>Are you sure you want to do this?</EuiText>
      </EuiConfirmModal>
    );
  }

  return (
    <>
      <div>
        {modal}
        {destroyModal}
      </div>
      <EuiFlyoutHeader>
        {ruleType === 'custom' && (
          <EuiFlexGroup direction="row" justifyContent="flexEnd">
            <EuiFlexItem>
              <EuiButton>View Findings</EuiButton>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiButton onClick={() => buttonDisplay()}>{currentMode}</EuiButton>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiButton onClick={() => setEditor(true)}>Duplicate</EuiButton>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiButton onClick={() => showDestroyModal()}>Delete</EuiButton>
            </EuiFlexItem>
          </EuiFlexGroup>
        )}
      </EuiFlyoutHeader>
      <EuiModalBody>
        {!showEditor && (
          <div>
            <EuiFlexGroup>
              <EuiFlexItem>
                <EuiDescriptionList listItems={ruleInfoLeft} />
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiDescriptionList listItems={ruleInfoRight} />
              </EuiFlexItem>
            </EuiFlexGroup>
            <EuiDescriptionList listItems={ruleInfoBottom} />
          </div>
        )}
        {showEditor && (
          <EuiMarkdownEditor
            aria-label="EUI markdown editor demo"
            placeholder="Your markdown here..."
            value={value}
            onChange={setValue}
            height={400}
            // onParse={onParse}
            // errors={messages}
            // dropHandlers={dropHandlers}
            // readOnly={isReadOnly}
            initialViewMode="viewing"
          />
        )}
      </EuiModalBody>
    </>
  );
};
