/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiBottomBar,
  EuiButton,
  EuiButtonEmpty,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiSpacer,
  EuiTextArea,
} from '@elastic/eui';
import { LogTypeItem } from '../../../../types';
import React from 'react';
import { validateName } from '../../../utils/validation';
import { NotificationsStart } from 'opensearch-dashboards/public';
import { useState } from 'react';

export interface LogTypeFormProps {
  logTypeDetails: LogTypeItem;
  isEditMode: boolean;
  confirmButtonText: string;
  notifications: NotificationsStart;
  setLogTypeDetails: (logType: LogTypeItem) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

export const LogTypeForm: React.FC<LogTypeFormProps> = ({
  logTypeDetails,
  isEditMode,
  confirmButtonText,
  notifications,
  setLogTypeDetails,
  onCancel,
  onConfirm,
}) => {
  const [nameError, setNameError] = useState('');

  const updateErrors = (details = logTypeDetails) => {
    const nameInvalid = !validateName(details.name);
    setNameError(nameInvalid ? 'Invalid name' : '');

    return { nameInvalid };
  };
  const onConfirmClicked = () => {
    const { nameInvalid } = updateErrors();

    if (nameInvalid) {
      notifications?.toasts.addDanger({
        title: `Failed to ${confirmButtonText.toLowerCase()}`,
        text: `Fix the marked errors.`,
        toastLifeTimeMs: 3000,
      });

      return;
    }
    onConfirm();
  };

  return (
    <>
      <EuiFormRow
        label="Name"
        helpText={
          isEditMode &&
          'Must contain 5-50 characters. Valid characters are a-z, A-Zm 0-9, hyphens, spaces, and underscores'
        }
        isInvalid={!!nameError}
        error={nameError}
      >
        <EuiFieldText
          value={logTypeDetails?.name}
          onChange={(e) => {
            const newLogType = {
              ...logTypeDetails!,
              name: e.target.value,
            };
            setLogTypeDetails(newLogType);
            updateErrors(newLogType);
          }}
          placeholder="Enter name for the log type"
          readOnly={!isEditMode}
          disabled={isEditMode && !!logTypeDetails.detectionRulesCount}
        />
      </EuiFormRow>
      <EuiSpacer />
      <EuiFormRow label="Description">
        <EuiTextArea
          value={logTypeDetails?.description}
          onChange={(e) => {
            const newLogType = {
              ...logTypeDetails!,
              description: e.target.value,
            };
            setLogTypeDetails(newLogType);
            updateErrors(newLogType);
          }}
          placeholder="Description of the log type"
          readOnly={!isEditMode}
        />
      </EuiFormRow>
      {isEditMode ? (
        <EuiBottomBar>
          <EuiFlexGroup gutterSize="s" justifyContent="flexEnd">
            <EuiFlexItem grow={false}>
              <EuiButtonEmpty color="ghost" size="s" iconType="cross" onClick={onCancel}>
                Cancel
              </EuiButtonEmpty>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiButton color="primary" fill iconType="check" size="s" onClick={onConfirmClicked}>
                {confirmButtonText}
              </EuiButton>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiBottomBar>
      ) : null}
    </>
  );
};
