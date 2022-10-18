import React, { useState, Fragment } from 'react';
import ReactDOM from 'react-dom';
import { EuiFilePicker, EuiFlexGroup, EuiFlexItem, EuiText, EuiSpacer } from '@elastic/eui';
import { EuiAccordion, EuiPanel } from '@elastic/eui';
import { Visual } from '../Visual';

export const Import = () => {
  const [files, setFiles] = useState([]);
  const [large, setLarge] = useState(true);
  const [userFiles, setUserFiles] = useState([]);
  const [fileErrors, setErrors] = useState('');
  const filePickerId = 'filepicker';

  let fileContent: any = [];
  const parse = (file: any) => {
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
      } else {
        setErrors(index);
      }
    }
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
        let accordianContent = (
          <div>{file.type === 'application/x-yaml' && <div>{content}</div>}</div>
        );
        ReactDOM.render(accordianContent, document.getElementById(file.name));
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
                multiple
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
              {/* <EuiAccordion id="accordion" buttonContent={file.name}>
                <EuiPanel color="subdued">
                  <div id={file.name}> </div>
                </EuiPanel>
              </EuiAccordion> */}
              <EuiSpacer />
              <Visual name={file.name} />
            </div>
          ))}
        </EuiFlexItem>
      )}
    </Fragment>
  );
};
