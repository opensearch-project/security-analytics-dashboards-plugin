import React, { useState, useEffect, useContext } from 'react';
import View from '../../containers/Rules/components/View';
import {
  EuiButton,
  EuiFlexGroup,
  EuiFlexItem,
  EuiTitle,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiFlyoutFooter,
  EuiSelect,
  EuiText,
  EuiConfirmModal,
  EuiModal,
} from '@elastic/eui';
import './index.scss';

export const Flyout = (props: any) => {
  const { close, content, ruleType } = props;

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDestroyModalVisible, setIsDestroyModalVisible] = useState(false);

  const closeModal = () => {
    setIsModalVisible(false);
    setValue('Actions');
  };

  const deleteRule = () => {
    close(true);
  };

  const showModal = () => setIsModalVisible(true);

  const closeDestroyModal = () => setIsDestroyModalVisible(false);
  const showDestroyModal = () => setIsDestroyModalVisible(true);

  const options = [
    { value: 'Actions', text: 'Actions' },
    { value: 'Edit', text: 'Edit' },
    { value: 'Duplicate', text: 'Duplicate' },
    { value: 'Delete', text: 'Delete' },
  ];

  const [value, setValue] = useState(options[0].value);

  let modal;

  const onChange = (e: any) => {
    setValue(e.target.value);
    if (e.target.value === 'Delete') {
      showModal();
    }
  };

  if (value === 'Delete' && isModalVisible) {
    modal = (
      <EuiConfirmModal
        title={`Delete: ${content.title}`}
        onCancel={closeModal}
        onConfirm={deleteRule}
        cancelButtonText="Cancel"
        confirmButtonText="Delete"
        buttonColor="danger"
        defaultFocusedButton="confirm"
      >
        <p>Delete the rule permanently? this action cannot be undone</p>
      </EuiConfirmModal>
    );
  }

  return (
    <>
      {content.source === 'default' && (
        <EuiFlyout onClose={close} style={{ width: 800 }}>
          <EuiFlyoutHeader hasBorder>
            <EuiFlexGroup>
              <EuiFlexItem>
                <EuiTitle size="m">
                  <h3>{content.title}</h3>
                </EuiTitle>
              </EuiFlexItem>
              <EuiFlexItem>
                <div>
                  {props.content.source === 'custom' && (
                    <EuiSelect
                      name="editMode"
                      options={options}
                      value={value}
                      onChange={(e) => onChange(e)}
                    />
                  )}
                </div>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlyoutHeader>
          <EuiFlyoutBody>
            <View content={content} ruleType={ruleType} />
          </EuiFlyoutBody>
          <EuiFlyoutFooter></EuiFlyoutFooter>
        </EuiFlyout>
      )}

      {content.source === 'custom' && (
        <EuiFlyout onClose={close} style={{ width: 800 }}>
          <div>
            {modal}
            {/* {destroyModal} */}
          </div>
          <EuiFlyoutHeader hasBorder>
            <EuiFlexGroup>
              <EuiFlexItem>
                <EuiTitle size="m">
                  <h3>{content.title}</h3>
                </EuiTitle>
              </EuiFlexItem>
              <EuiFlexItem>
                <div>
                  {props.content.source === 'custom' && (
                    <EuiSelect
                      name="editMode"
                      options={options}
                      value={value}
                      onChange={(e) => onChange(e)}
                    />
                  )}
                </div>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlyoutHeader>
          <EuiFlyoutBody>
            <View content={content} ruleType={ruleType} />
          </EuiFlyoutBody>
        </EuiFlyout>
      )}
    </>
  );
};
