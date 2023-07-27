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

export interface LogTypeFormProps {
  logTypeDetails: LogTypeItem;
  isEditMode: boolean;
  confirmButtonText: string;
  setLogTypeDetails: (logType: LogTypeItem) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

export const LogTypeForm: React.FC<LogTypeFormProps> = ({
  logTypeDetails,
  isEditMode,
  confirmButtonText,
  setLogTypeDetails,
  onCancel,
  onConfirm,
}) => {
  return (
    <>
      <EuiFormRow label="Name">
        <EuiFieldText
          value={logTypeDetails?.name}
          onChange={(e) =>
            setLogTypeDetails({
              ...logTypeDetails!,
              name: e.target.value,
            })
          }
          placeholder="Enter name for log type"
          disabled={!isEditMode || !!logTypeDetails.detectionRules}
        />
      </EuiFormRow>
      <EuiSpacer />
      <EuiFormRow label="Description">
        <EuiTextArea
          value={logTypeDetails?.description}
          onChange={(e) =>
            setLogTypeDetails({
              ...logTypeDetails!,
              description: e.target.value,
            })
          }
          placeholder="Description of the log type"
          disabled={!isEditMode}
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
              <EuiButton color="primary" fill iconType="check" size="s" onClick={onConfirm}>
                {confirmButtonText}
              </EuiButton>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiBottomBar>
      ) : null}
    </>
  );
};
