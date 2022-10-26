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

  let importedDetectionValue = `
  ${
    content.queries.length > 0 &&
    `selection:
    query|startswith:
      ${content.queries.map((query: any) => `- ${query.value}`)}
    `
  }`;

  return (
    <>
      {/* <EuiFlyoutHeader>
        {props.content.source === 'custom' && (
          <div>
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
            <Edit />
          </div>
        )}
      </EuiFlyoutHeader> */}
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
          {content.tags.map((tag: any) => (
            <EuiFlexItem grow={false} key={tag}>
              <EuiBadge color={'#DDD'}>{tag.value}</EuiBadge>
            </EuiFlexItem>
          ))}
        </EuiFlexGroup>

        <EuiSpacer />

        <EuiFormLabel>References</EuiFormLabel>
        {content.references.map((reference: any) => (
          <div>
            <EuiLink href={reference.value} target="_blank" key={reference}>
              {reference.value}
            </EuiLink>
            <EuiSpacer />
          </div>
        ))}

        <EuiSpacer />

        <EuiFormLabel>False positive cases</EuiFormLabel>
        <div>
          {content.falsepositives.map((falsepositive: any) => (
            <div>
              {falsepositive.value}
              <EuiSpacer />
            </div>
          ))}
        </div>

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
            {!allowEditor && (
              <EuiCodeBlock language="html">{importedDetectionValue}</EuiCodeBlock>
              // <AceEditor
              //   name="ruleDetection"
              //   mode="yaml"
              //   readOnly
              //   onChange={onEditorChange}
              //   value={importedDetectionValue}
              //   height="400px"
              //   width="95%"
              // />
            )}
          </div>
        </EuiFormRow>
      </EuiModalBody>
    </>
  );
};
