/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, Fragment } from 'react';
import {
  EuiFilePicker,
  EuiFlexGroup,
  EuiFlexItem,
  EuiText,
  EuiSpacer,
  EuiCodeBlock,
} from '@elastic/eui';
import Edit from '../Edit';
import { forEach } from 'lodash';

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
  const [importedTags, setImportedTags] = useState<string[]>([]);
  const [yamlContent, setYamlContent] = useState<string>('');

  const parseContent = ['title', 'description', 'status', 'level', 'author', 'tags'];

  // const parse = (file: any) => {
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

  // for (let i = 0; i < parseContent.length; i++) {
  // let index = parseContent[i];
  // let parsedContent
  // if (file.includes(index)) {
  //   let newFile: any = file.split(`${index}:`);
  //   let content: any = newFile[1].split('\\n');
  //   parsedContent = content[0].trim();
  // } else {
  //   setErrors(index);
  // }
  //   if(index === 'title'){
  //     console.log(parsedContent)
  //   }

  // switch (index) {
  //   case 'title':
  //     setImportedTitle(parsedContent);
  //   case 'description':
  //     setImportedDescription(parsedContent);
  //   case 'product':
  //     console.log('Product', parsedContent);
  //   case 'status':
  //     setImportedStatus(parsedContent)
  //   case 'level':
  //     setImportedStatus(parsedContent);
  //   case 'author':
  //     setImportedAuthor(parsedContent)
  // }
  // if(index === 'tags'){
  //     let tagsArray = Array.from(content)
  //     let ruleTags = []
  //     for(let i = 0; i < tagsArray.length; i++){
  //       if(tagsArray[i].length > 0 && tagsArray[i].includes('-')){
  //         ruleTags.push(tagsArray[i].replace('-', '').trim())
  //       }
  //     }
  //     setImportedTags(ruleTags)
  // }
  // if(index === 'references'){
  //   let referencesArray = Array.from(content)
  //   console.log('REFERENCES', referencesArray)
  // }

  // }
  //   }
  // };

  const parse = (file: any) => {
    let values = [];
    for (let i = 0; i < parseContent.length; i++) {
      if (file.includes(parseContent[i])) {
        let newFile: any = file.split(`${parseContent[i]}:`);
        let content: any = newFile[1].split('\\n');
        let parsedContent = content[0].trim();
        values.push(parsedContent);
        // switch (parseContent[i]) {
        //   case 'title':
        //     setImportedTitle(parsedContent);
        //   case 'description':
        //     setImportedDescription(parsedContent);
        //   case 'status':
        //     setImportedStatus(parsedContent);
        //   case 'level':
        //     setImportedStatus(parsedContent);
        //   case 'author':
        //     setImportedAuthor(parsedContent);
        // }
        // case 'tags':
        //   let tagsArray = Array.from(content);
        //   let ruleTags = [];
        //   for (let i = 0; i < tagsArray.length; i++) {
        //     if (tagsArray[i].length > 0 && tagsArray[i].includes('-')) {
        //       ruleTags.push(tagsArray[i].replace('-', '').trim());
        //     }
        //   }
        //   setImportedTags(ruleTags);
        // case 'references':
        //   let referencesArray = Array.from(content);
        //   console.log('REFERENCES', referencesArray);
        // }
        // if (parseContent[i] === 'tags') {
        //   let tagsArray = Array.from(content);
        //   let ruleTags = [];
        //   for (let i = 0; i < tagsArray.length; i++) {
        //     if (tagsArray[i].length > 0 && tagsArray[i].includes('-')) {
        //       ruleTags.push(tagsArray[i].replace('-', '').trim());
        //     }
        //   }
        //   setImportedTags(ruleTags);
        // }
        // if (parseContent[i] === 'references') {
        //   let referencesArray = Array.from(content);
        //   console.log('REFERENCES', referencesArray);
        // }
        setImportedTitle(values[0]);
        setImportedDescription(parsedContent[1]);
        setImportedStatus(parsedContent[2]);
        setImportedLevel(parsedContent[3]);
      } else {
        setErrors(parseContent[i]);
      }
      // let index = parseContent[i];
      // let parsedContent;
      // if (file.includes(index)) {
      //   let newFile: any = file.split(`${index}:`);
      //   let content: any = newFile[1].split('\\n');
      //   parsedContent = content[0].trim();
      //   console.log(parsedContent);
      // } else {
      //   setErrors(index);
      // }
    }
  };

  const onChange = (files: any) => {
    setUserFiles(files.length > 0 ? Array.from(files) : []);
    let acceptedFileTyes: any = [];
    if (files[0].type === 'application/x-yaml') {
      acceptedFileTyes.push(files[0]);
    } else {
      setErrors('Only yaml files are accepted');
    }
    setFiles(files.length > 0 ? acceptedFileTyes : []);
  };

  const renderFiles = () => {
    let file = files[0];
    let reader = new FileReader();
    reader.readAsText(file);
    reader.onload = function () {
      let content: any = reader.result;
      parse(JSON.stringify(content).toLowerCase());
      setYamlContent(content);
    };
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
              {importedAuthor.length > 0 && (
                <Edit
                  type={'import'}
                  title={importedTitle}
                  description={importedDescription}
                  level={importedLevel}
                  status={importedStatus}
                  product={importedProduct}
                  author={importedAuthor}
                  tags={importedTags}
                />
              )}
            </div>
          ))}
        </EuiFlexItem>
      )}
      <EuiCodeBlock language="yml" fontSize="m" paddingSize="m" overflowHeight={300} isCopyable>
        {yamlContent}
      </EuiCodeBlock>
    </Fragment>
  );
};
