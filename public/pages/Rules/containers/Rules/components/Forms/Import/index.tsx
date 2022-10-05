import React, { useState, Fragment } from 'react';
import {
  EuiFilePicker,
  EuiFlexGroup,
  EuiFlexItem,
  EuiText,
  EuiSpacer,
  EuiIcon,
  EuiTabbedContent,
} from '@elastic/eui';
import { EuiAccordion, EuiPanel } from '@elastic/eui';
import { render } from 'react-dom';

export const Import = () => {
  const [files, setFiles] = useState([]);
  const [large, setLarge] = useState(true);

  const filePickerId = 'filepicker';

  const simpleAccordionId = 'accordion';

  const onChange = (files: any) => {
    setFiles(files.length > 0 ? Array.from(files) : []);
    let readFiles: any = [];
  };

  // for(let i = 0; i < files.length; i++){
  //   (function(file:any){
  //     let fileName = file.name
  //     let reader = new FileReader()
  //     reader.onload = function() {
  //       readFiles.push({'name': fileName,'content':reader.result})
  //     }
  //   })
  //   }
  // }

  const renderFiles = () => {
    if (files.length > 0) {
      return (
        <ul>
          {files.map((file: any, i: any) => (
            <li key={i}>
              <strong>{file.filename}</strong> ({file.size} bytes)
              <p id="fileContent">{file.content}</p>
            </li>
          ))}
        </ul>
      );
    } else {
      return <p>Add some files to see a demo of retrieving from the FileList</p>;
    }
  };

  return (
    <Fragment>
      <EuiFlexGroup>
        <EuiFlexItem grow={2}>
          <EuiFilePicker
            id={filePickerId}
            multiple
            fullWidth
            initialPromptText="Select or drag and drop multiple files"
            onChange={onChange}
            display={large ? 'large' : 'default'}
            aria-label="Use aria labels when no actual label is in use"
          />
        </EuiFlexItem>
      </EuiFlexGroup>
      {files.length > 0 && (
        <EuiFlexItem>
          <EuiText>
            <h3>Files attached</h3>
            {renderFiles()}
          </EuiText>
        </EuiFlexItem>
      )}
    </Fragment>
  );
};
