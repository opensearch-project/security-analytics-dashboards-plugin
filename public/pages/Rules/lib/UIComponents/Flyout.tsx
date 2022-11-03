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
import { ROUTES } from '../../../../utils/constants';
import { useHistory } from 'react-router-dom';
import { ServicesContext } from '../../../../services';

const options = [
  { value: 'Actions', text: 'Actions' },
  { value: 'Edit', text: 'Edit' },
  { value: 'Duplicate', text: 'Duplicate' },
  { value: 'Delete', text: 'Delete' },
];

export const Flyout = (props: any) => {
  const { close, content, type, ruleType } = props;
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDestroyModalVisible, setIsDestroyModalVisible] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const services = useContext(ServicesContext);
  const [value, setValue] = useState(options[0].value);

  const history = useHistory();

  const Duplicate = () => {
    history.push({
      pathname: ROUTES.RULES_CREATE,
      state: {
        mode: 'Duplicate',
        rule: content,
      },
    });
  };

  const Edit = () => {
    history.push({
      pathname: ROUTES.RULES_CREATE,
      state: {
        mode: 'Edit',
        rule: content,
      },
    });
  };

  const onButtonClick = () => setIsPopoverOpen((isPopoverOpen) => !isPopoverOpen);
  const closePopover = () => setIsPopoverOpen(false);

  const closeModal = () => {
    setIsModalVisible(false);
    setValue('Actions');
  };

  const deleteRule = async () => {
    const deleteRes = await services?.ruleService.deleteRule(content.id);

    if (!deleteRes?.ok) {
      // TODO: Show error on delete
    }

    setValue('Delete');
    close(true);
    setIsModalVisible(false);
  };

  const showModal = () => setIsModalVisible(true);

  const closeDestroyModal = () => setIsDestroyModalVisible(false);
  const showDestroyModal = () => setIsDestroyModalVisible(true);

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

      {content.source === 'Sigma' && (
        <EuiFlyout onClose={close} style={{ width: 800 }}>
          <EuiFlyoutHeader hasBorder>
            <EuiFlexGroup>
              <EuiFlexItem>
                <EuiTitle size="m">
                  <h3>{content.title}</h3>
                </EuiTitle>
              </EuiFlexItem>
              <EuiFlexItem grow={false} style={{ marginRight: '50px' }}>
                <EuiButton onClick={Duplicate}>Duplicate</EuiButton>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlyoutHeader>
          <EuiFlyoutBody>
            <View content={content} ruleType={ruleType} />
          </EuiFlyoutBody>
          <EuiFlyoutFooter></EuiFlyoutFooter>
        </EuiFlyout>
      )}

      {content.source === 'Custom' && (
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
                  {props.content.source === 'Custom' && (
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
                      <EuiFlexGroup direction="column">
                        <EuiFlexItem>
                          <EuiButtonEmpty onClick={Edit}>Edit</EuiButtonEmpty>
                        </EuiFlexItem>

                        <EuiFlexItem>
                          <EuiButtonEmpty onClick={Duplicate}>Duplicate</EuiButtonEmpty>
                        </EuiFlexItem>

                        <EuiFlexItem>
                          <EuiButtonEmpty
                            onClick={() => {
                              setValue('Delete');
                              setIsModalVisible(true);
                            }}
                          >
                            Delete
                          </EuiButtonEmpty>
                        </EuiFlexItem>
                      </EuiFlexGroup>
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
