import React, { useState, useEffect } from 'react';
import {
  EuiModalBody,
  EuiCodeBlock,
  EuiSpacer,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiMarkdownEditor,
  EuiButton,
  EuiConfirmModal,
  EuiText,
  EuiIcon,
  EuiSwitch,
  EuiFlexGroup,
  EuiFlexItem,
} from '@elastic/eui';
import { HR } from '../../lib/UIComponents/hr';

export const View = (props: any) => {
  const [showEditor, setEditor] = useState<boolean>(false);
  const [isReadOnly, setIsReadOnly] = useState<boolean>(false);
  const [currentMode, setCurrentMode] = useState<string>('Edit');
  const [showSave, setSave] = useState(false);
  const { modalContent } = props;
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDestroyModalVisible, setIsDestroyModalVisible] = useState(false);
  const closeModal = () => setIsModalVisible(false);
  const showModal = () => setIsModalVisible(true);
  const closeDestroyModal = () => setIsDestroyModalVisible(false);
  const showDestroyModal = () => setIsDestroyModalVisible(true);
  const { ruleType } = props;

  let modal;

  const initialContent = `

  title: ${modalContent.title}

  logsource: {

    product: ${modalContent.product}

    category: ${modalContent.logsource.category}
    
  }

  status: ${modalContent.status}

  level: ${modalContent.level}

  last modified: ${modalContent.modified} 
  `;

  const [value, setValue] = useState(initialContent);

  useEffect(() => {
    setSave(false);
    if (value !== initialContent) {
      setSave(true);
    }
  });

  // const onChange = (e:any) => {
  //   setIsReadOnly(e.target.checked);
  // };

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
          You will lose changes to: <b>{modalContent.title}</b>
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
          Delete rule: <b>{modalContent.title}</b>
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
      <EuiModalHeader>
        <EuiModalHeaderTitle>
          <h1>{modalContent.title}</h1>
        </EuiModalHeaderTitle>
        {ruleType === 'custom' && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'flex-end',
            }}
          >
            <div style={{ marginRight: '15px' }}>
              {showSave && (
                <EuiButton color="success" onClick={showDestroyModal}>
                  Save
                </EuiButton>
              )}
            </div>
            <div style={{ marginRight: '15px' }}>
              <EuiButton onClick={() => buttonDisplay()}>{currentMode}</EuiButton>
            </div>
            {showEditor && (
              <div style={{ marginRight: '15px' }}>
                <EuiButton color="danger" onClick={showDestroyModal}>
                  Delete
                </EuiButton>
              </div>
            )}
          </div>
        )}
      </EuiModalHeader>
      <EuiModalBody>
        {modalContent.description}
        <EuiSpacer />
        {!showEditor && (
          <EuiCodeBlock language="js" isCopyable>
            Title: {modalContent.title} <br></br>
            Category: {modalContent.logsource.category} <br></br>
            Status: {modalContent.status} <br></br>
            Level: {modalContent.level} <br></br>
            Last Modified: {modalContent.modified} <br></br>
            Logsource:{' '}
            {`product: ${modalContent.product}, category: ${modalContent.logsource.category}`}
          </EuiCodeBlock>
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
