/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, Fragment } from 'react';
import { parseType } from '../../../../lib/helpers';
import { EuiFilePicker, EuiFlexGroup, EuiFlexItem, EuiText, EuiSpacer } from '@elastic/eui';
import Edit from '../Edit';

export const Import = () => {
  const [files, setFiles] = useState([]);
  const [large, setLarge] = useState(true);
  const [userFiles, setUserFiles] = useState([]);
  const [fileErrors, setErrors] = useState('');
  const filePickerId = 'filepicker';
  const [importedTitle, setImportedTitle] = useState<string>('');
  const [importedDescription, setImportedDescription] = useState<string>('');
  const [importedLevel, setImportedLevel] = useState<string>('');
  const [importedProduct, setImportedProduct] = useState<string | undefined>('');
  const [importedStatus, setImportedStatus] = useState<string>('');
  const [importedAuthor, setImportedAuthor] = useState<string>('');

  const parse = (file: any) => {
    let title;
    let description;
    let product;
    let status;
    let level;
    let author;

    // 'date',
    // 'references',
    // 'category',
    // 'selection',
    // 'tags',
    // '- Signature|startswith',
    // '- Signature|contains',
    // 'condition',
    // 'fields',
    // 'falsepositives',

    let parseContent = ['title', 'description', 'product', 'status', 'level', 'author'];

    for (let i = 0; i < parseContent.length; i++) {
      let index = parseContent[i];
      if (file.includes(index)) {
        let newFile: any = file.split(`${index}:`);
        let content: any = newFile[1].split('\\n');
        let parsedContent = content[0].trim();
        switch (index) {
          case 'title':
            title = parsedContent;
          case 'description':
            description = parsedContent;
          case 'product':
            product = parseType(parsedContent);
          case 'status':
            status = parsedContent;
          case 'level':
            level = parsedContent;
          case 'author':
            author = parsedContent;
        }
      } else {
        setErrors(index);
      }
    }
    setImportedTitle(title);
    setImportedDescription(description);
    setImportedProduct(product);
    setImportedStatus(status.charAt(0).toUpperCase() + status.slice(1));
    setImportedLevel(level);
    setImportedAuthor(author);
  };

  const onChange = (files: any) => {
    setUserFiles(files.length > 0 ? Array.from(files) : []);
    let acceptedFileTyes: any = [];
    Array.from(files).forEach((file: any) => {
      if (file.type === 'application/x-yaml') {
        acceptedFileTyes.push(file);
      } else {
        setErrors('Only yaml files are accepted');
      }
    });
    setFiles(files.length > 0 ? acceptedFileTyes : []);
  };

  const renderFiles = () => {
    files.forEach((file: any) => {
      let reader = new FileReader();
      reader.readAsText(file);
      reader.onload = function () {
        let content: any = reader.result;
        parse(JSON.stringify(content));
      };
    });
  };

  return (
    <Fragment>
      <EuiFlexGroup>
        <EuiFlexItem grow={2}>
          {files.length === 0 && (
            <div>
              <EuiFilePicker
                id={filePickerId}
                isInvalid={Boolean(fileErrors.length > 0 && userFiles.length > 0)}
                fullWidth
                initialPromptText="Select or drag yml file"
                onChange={onChange}
                display={large ? 'large' : 'default'}
                aria-label="file picker"
              />
              {fileErrors.length > 0 && userFiles.length > 0 && <div>Errors: {fileErrors}</div>}
            </div>
          )}
        </EuiFlexItem>
      </EuiFlexGroup>
      {files.length > 0 && (
        <EuiFlexItem>
          <EuiText>
            <EuiSpacer />
            {renderFiles()}
          </EuiText>
          {files.map((file: any, i: any) => (
            <div key={i}>
              {importedLevel.length > 0 && (
                <Edit
                  type={'import'}
                  title={importedTitle}
                  description={importedDescription}
                  level={importedLevel}
                  status={importedStatus}
                  product={importedProduct}
                  author={importedAuthor}
                />
              )}
            </div>
          ))}
        </EuiFlexItem>
      )}
    </Fragment>
  );
};
