import React, { useState, useEffect, useContext } from 'react';
import View from '../../containers/Rules/components/View';
import {
  EuiButton,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiFlyoutFooter,
  EuiSelect,
  EuiText,
  EuiConfirmModal,
  EuiModal,
  EuiFlyout,
  EuiTitle,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPopover,
  EuiButtonEmpty,
} from '@elastic/eui';
import './index.scss';

export const Flyout = (props: any) => {
  const { close, content, type, ruleType } = props;

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDestroyModalVisible, setIsDestroyModalVisible] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const onButtonClick = () => setIsPopoverOpen((isPopoverOpen) => !isPopoverOpen);
  const closePopover = () => setIsPopoverOpen(false);

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
    <div>
      <EuiFlyout onClose={close} style={{ width: 800 }}>
        <EuiFlyoutHeader hasBorder>
          <EuiTitle size="m">
            <h3>{content.title}</h3>
          </EuiTitle>
        </EuiFlyoutHeader>
        <EuiFlyoutBody>
          {type === 'view' && <View content={content} ruleType={ruleType} />}
        </EuiFlyoutBody>
        <EuiFlyoutFooter>
          <EuiFlexGroup direction="row" justifyContent="flexEnd">
            <EuiFlexItem grow={false}>
              <EuiButton onClick={close} fill style={{ marginRight: '25px' }}>
                Close
              </EuiButton>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlyoutFooter>
      </EuiFlyout>

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
                    //   <EuiSelect
                    //     name="editMode"
                    //     options={options}
                    //     value={value}
                    //     onChange={(e) => onChange(e)}
                    //   />
                    // <EuiPopover
                    //   button={
                    //     <EuiButton iconType="arrowDown" iconSide="right" onClick={onButtonClick}>
                    //       Action
                    //     </EuiButton>
                    //   }
                    //   isOpen={isPopoverOpen}
                    //   closePopover={closePopover}
                    //   anchorPosition="downLeft"
                    // >
                    //   Popover content
                    // </EuiPopover>
                    <div></div>
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
              <EuiFlexItem grow={false}>
                <div style={{ marginRight: '25px' }}>
                  {props.content.source === 'custom' && (
                    <EuiPopover
                      button={
                        <EuiButton iconType="arrowDown" iconSide="right" onClick={onButtonClick}>
                          Action
                        </EuiButton>
                      }
                      isOpen={isPopoverOpen}
                      closePopover={closePopover}
                      anchorPosition="downLeft"
                    >
                      <div>
                        <EuiButtonEmpty>Edit</EuiButtonEmpty>
                        <EuiButtonEmpty>Duplicate</EuiButtonEmpty>
                        <EuiButtonEmpty>Delete</EuiButtonEmpty>
                      </div>
                    </EuiPopover>
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
    </div>
  );
};
