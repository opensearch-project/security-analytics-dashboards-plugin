import React from 'react';
import {
  EuiButton,
  EuiButtonEmpty,
  EuiButtonIcon,
  EuiConfirmModal,
  EuiModal,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiModalBody,
  EuiOverlayMask,
  EuiText,
} from '@elastic/eui';

export const ButtonOpenModalConfirm: React.FC<{
  label: string;
  buttonProps: any;
  modal: {
    title: string | React.ReactNode;
    cancelButtonText: string;
    confirmButtonText: string;
    onConfirm: () => void;
  };
}> = ({
  label,
  buttonProps,
  modal: {
    title,
    cancelButtonText = 'Cancel',
    confirmButtonText = 'Confirm',
    onConfirm,
    ...modalProps
  },
  children,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <>
      {isOpen && (
        <EuiOverlayMask>
          <EuiConfirmModal
            title={
              typeof title === 'string' ? (
                <EuiText size="s">
                  <h2>{title}</h2>
                </EuiText>
              ) : (
                title
              )
            }
            onCancel={() => setIsOpen(false)}
            onConfirm={onConfirm}
            cancelButtonText={cancelButtonText}
            confirmButtonText={confirmButtonText}
            buttonColor="primary"
            defaultFocusedButton="confirm"
            {...modalProps}
          >
            {typeof children === 'function'
              ? children({ closeModal: () => setIsOpen(false) })
              : children}
          </EuiConfirmModal>
        </EuiOverlayMask>
      )}
      <EuiButton {...buttonProps} onClick={() => setIsOpen(true)}>
        {label}
      </EuiButton>
    </>
  );
};

const ButtonComponentByType = {
  default: EuiButton,
  icon: EuiButtonIcon,
  empty: EuiButtonEmpty,
};

export interface ButtonOpenModalProps {
  label: string;
  type: keyof typeof ButtonComponentByType;
  buttonProps: any;
  modal: {
    title: string | React.ReactNode;
    onConfirm: () => void;
  };
}

export const ButtonOpenModal: React.FC<ButtonOpenModalProps> = ({
  label,
  buttonProps,
  type,
  modal: { title, onConfirm, ...modalProps },
  children,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const Button = ButtonComponentByType[type] || ButtonComponentByType.default;
  return (
    <>
      {isOpen && (
        <EuiOverlayMask>
          <EuiModal {...modalProps} onClose={() => setIsOpen(false)}>
            <EuiModalHeader>
              <EuiModalHeaderTitle>
                {typeof title === 'string' ? (
                  <EuiText size="s">
                    <h2>{title}</h2>
                  </EuiText>
                ) : (
                  title
                )}
              </EuiModalHeaderTitle>
            </EuiModalHeader>
            <EuiModalBody>
              {typeof children === 'function'
                ? children({ closeModal: () => setIsOpen(false) })
                : children}
            </EuiModalBody>
          </EuiModal>
        </EuiOverlayMask>
      )}
      <Button {...buttonProps} onClick={() => setIsOpen(true)}>
        {label}
      </Button>
    </>
  );
};
