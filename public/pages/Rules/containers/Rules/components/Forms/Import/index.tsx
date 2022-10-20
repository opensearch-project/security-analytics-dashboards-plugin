import React, { useState, Fragment, useEffect } from 'react';
import { EuiFilePicker, EuiFlexGroup, EuiFlexItem, EuiText, EuiSpacer } from '@elastic/eui';
import { ImportEdit } from './importEdit';

export const Import = () => {
  const [files, setFiles] = useState([]);
  const [large, setLarge] = useState(true);
  const [userFiles, setUserFiles] = useState([]);
  const [fileErrors, setErrors] = useState('');
  const filePickerId = 'filepicker';
  const [importedTitle, setImportedTitle] = useState<string>('');
  const [importedDescription, setImportedDescription] = useState<string>('');
  const [importedLevel, setImportedLevel] = useState<string>('');

  let fileContent: any[] = [];

  const parse = (file: any) => {
    let title;
    let description;
    let level;
    let parseContent = [
      'title',
      'id',
      'description',
      'status',
      'date',
      'author',
      'references',
      'category',
      'selection',
      'tags',
      '- Signature|startswith',
      '- Signature|contains',
      'condition',
      'fields',
      'falsepositives',
      'level',
    ];
    for (let i = 0; i < parseContent.length; i++) {
      let index = parseContent[i];
      if (file.includes(parseContent[i])) {
        let newFile: any = file.split(`${parseContent[i]}:`);
        let content: any = newFile[1].split('\\n');
        let parsedContent = content[0].trim();
        fileContent.push([parsedContent]);
        switch (parseContent[i]) {
          case 'title':
            title = parsedContent;
          case 'description':
            description = parsedContent;
          case 'level':
            level = parsedContent;
        }
        // if(parseContent[i] === 'title'){
        //   title = parsedContent
        // }
      } else {
        setErrors(index);
      }
    }
    setImportedTitle(title);
    setImportedDescription(description);
    setImportedLevel(level);
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

  console.log('80 - import', fileContent);

  let importProps = { importedTitle, importedDescription, importedLevel };
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
            <div key={i}>{importedLevel.length > 0 && <ImportEdit props={importProps} />}</div>
          ))}
        </EuiFlexItem>
      )}
    </Fragment>
  );
};
