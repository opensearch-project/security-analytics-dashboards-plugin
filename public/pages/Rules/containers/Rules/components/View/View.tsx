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
  EuiFormRow,
  EuiFormLabel,
  EuiBadge,
  EuiLink,
} from '@elastic/eui';
import Edit from '../Edit';
import AceEditor from 'react-ace';

export const View = (props: any) => {
  const [allowEditor, setEditor] = useState<boolean>(false);
  const [currentMode, setCurrentMode] = useState<string>('Edit');
  const [showSave, setSave] = useState(false);
  const { content } = props;

  const { ruleType } = props.content.source;
  const [close, setClose] = useState(false);

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

  const onEditorChange = (Value: string) => {
    console.log('VALUE', Value);
  };

  let importedDetectionValue = `${
    content.queries.length > 0 &&
    `selection:
    query|startswith:
      ${content.queries.map((query: any) => `- ${query.value}`)}
    `
  }`;

  return (
    <>
      <EuiModalBody>
        <EuiFlexGroup direction="row" justifyContent="flexEnd">
          <EuiFlexItem>
            <EuiFormLabel>Rule Name</EuiFormLabel>
            {content.title}
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiFormLabel>Log Type</EuiFormLabel>
            {content.category}
          </EuiFlexItem>
        </EuiFlexGroup>

        <EuiSpacer />

        <EuiFormLabel>Description</EuiFormLabel>
        <div>{content.description}</div>

        <EuiSpacer />

        <EuiFlexGroup direction="row" justifyContent="flexEnd">
          <EuiFlexItem>
            <EuiFormLabel>Last Updated</EuiFormLabel>
            {content.last_updated}
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiFormLabel>Author</EuiFormLabel>
            {content.author}
          </EuiFlexItem>
        </EuiFlexGroup>

        <EuiSpacer />

        <EuiFlexGroup direction="row" justifyContent="flexEnd">
          <EuiFlexItem>
            <EuiFormLabel>Source</EuiFormLabel>
            {content.source}
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiFormLabel>Duplicated from</EuiFormLabel>
            {/* {content.author} */}
          </EuiFlexItem>
        </EuiFlexGroup>

        <EuiSpacer />

        <EuiFlexGroup direction="row" justifyContent="flexEnd">
          <EuiFlexItem>
            <EuiFormLabel>Rule level</EuiFormLabel>
            {content.level}
          </EuiFlexItem>
        </EuiFlexGroup>

        <EuiSpacer />

        <EuiFormLabel>Tags</EuiFormLabel>

        <EuiFlexGroup direction="row">
          {content.tags.map((tag: any, i: number) => (
            <EuiFlexItem grow={false} key={i}>
              <EuiBadge color={'#DDD'}>{tag.value}</EuiBadge>
            </EuiFlexItem>
          ))}
        </EuiFlexGroup>

        <EuiSpacer />
        <EuiSpacer />

        <EuiFormLabel>References</EuiFormLabel>
        {content.references.map((reference: any, i: number) => (
          <div key={i}>
            <EuiLink href={reference.value} target="_blank" key={reference}>
              {reference.value}
            </EuiLink>
            <EuiSpacer />
          </div>
        ))}

        <EuiSpacer />

        <EuiFormLabel>False positive cases</EuiFormLabel>
        <div>
          {content.falsepositives.map((falsepositive: any, i: number) => (
            <div key={i}>
              {falsepositive.value}
              <EuiSpacer />
            </div>
          ))}
        </div>

        <EuiSpacer />

        <EuiFormLabel>Rule Status</EuiFormLabel>
        <div>{content.status}</div>

        <EuiSpacer />

        <EuiFormRow
          label="Detection"
          fullWidth
          // helpText={Formikprops.touched.ruleDetection && Formikprops.errors.ruleDetection}
        >
          <div>
            {allowEditor && (
              <AceEditor
                name="ruleDetection"
                mode="yaml"
                readonly
                onChange={onEditorChange}
                height="400px"
                width="95%"
              />
            )}
            {!allowEditor && <EuiCodeBlock language="html">{importedDetectionValue}</EuiCodeBlock>}
          </div>
        </EuiFormRow>
      </EuiModalBody>
    </>
  );
};
