/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiBottomBar,
  EuiButton,
  EuiButtonEmpty,
  EuiCompressedFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiCompressedFormRow,
  EuiSpacer,
  EuiCompressedSuperSelect,
  EuiTextArea,
} from '@elastic/eui';
import { LogTypeItem } from '../../../../types';
import React from 'react';
import { LOG_TYPE_NAME_REGEX, validateName } from '../../../utils/validation';
import { NotificationsStart } from 'opensearch-dashboards/public';
import { useState } from 'react';
import { getLogTypeCategoryOptions } from '../../../utils/helpers';

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
  const [categoryError, setCategoryError] = useState('');
  const [categoryTouched, setCategoryTouched] = useState(false);

  const updateErrors = (details: LogTypeItem, onSubmit = false) => {
    const nameInvalid = !validateName(details.name, LOG_TYPE_NAME_REGEX, false /* shouldTrim */);
    const categoryInvalid = (categoryTouched || onSubmit) && !details.category;
    setNameError(nameInvalid ? 'Invalid name' : '');
    setCategoryError(categoryInvalid ? 'Select category to assign' : '');

    return { nameInvalid, categoryInvalid };
  };
  const onConfirmClicked = () => {
    const { nameInvalid, categoryInvalid } = updateErrors(logTypeDetails, true);

    if (nameInvalid || categoryInvalid) {
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
      <EuiCompressedFormRow
        label="Name"
        helpText={
          isEditMode &&
          'Must contain 2-50 characters. Valid characters are a-z, 0-9, hyphens, and underscores'
        }
        isInvalid={!!nameError}
        error={nameError}
      >
        <EuiCompressedFieldText
          value={logTypeDetails?.name}
          onChange={(e) => {
            const newLogType = {
              ...logTypeDetails!,
              name: e.target.value,
            };
            setLogTypeDetails(newLogType);
            updateErrors(newLogType);
          }}
          readOnly={!isEditMode}
          disabled={isEditMode && !!logTypeDetails.detectionRulesCount}
        />
      </EuiCompressedFormRow>
      <EuiSpacer />
      <EuiCompressedFormRow
        label={
          <>
            {'Description - '}
            <em>optional</em>
          </>
        }
      >
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
      </EuiCompressedFormRow>
      <EuiSpacer />
      <EuiCompressedFormRow label="Category" isInvalid={!!categoryError} error={categoryError}>
        <EuiCompressedSuperSelect
          options={getLogTypeCategoryOptions().map((option) => ({
            ...option,
            disabled: !isEditMode || (isEditMode && !!logTypeDetails.detectionRulesCount),
          }))}
          valueOfSelected={logTypeDetails?.category}
          onChange={(value) => {
            const newLogType = {
              ...logTypeDetails,
              category: value,
            };
            setCategoryTouched(true);
            setLogTypeDetails(newLogType);
            updateErrors(newLogType);
          }}
          hasDividers
          itemLayoutAlign="top"
        ></EuiCompressedSuperSelect>
      </EuiCompressedFormRow>
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
