/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiSmallButton,
  EuiButton,
  EuiDescriptionList,
  EuiCompressedFormRow,
  EuiCompressedFieldText,
  EuiSpacer,
  EuiCompressedTextArea,
  EuiBottomBar,
  EuiFlexGroup,
  EuiFlexItem,
  EuiButtonEmpty,
} from '@elastic/eui';
import { ContentPanel } from '../../../components/ContentPanel';
import React from 'react';
import { LogTypeItem } from '../../../../types';
import { DataStore } from '../../../store/DataStore';

export interface LogTypeDetailsTabProps {
  initialLogTypeDetails: LogTypeItem;
  logTypeDetails: LogTypeItem;
  isEditMode: boolean;
  setIsEditMode: (isEdit: boolean) => void;
  setLogTypeDetails: (logType: LogTypeItem) => void;
}

export const LogTypeDetailsTab: React.FC<LogTypeDetailsTabProps> = ({
  initialLogTypeDetails,
  logTypeDetails,
  isEditMode,
  setIsEditMode,
  setLogTypeDetails,
}) => {
  const onUpdateLogType = async () => {
    const success = await DataStore.logTypes.updateLogType(logTypeDetails);
    if (success) {
      setIsEditMode(false);
    }
  };

  return (
    <ContentPanel
      title="Details"
      actions={!isEditMode && [<EuiSmallButton onClick={() => setIsEditMode(true)}>Edit</EuiSmallButton>]}
    >
      <EuiDescriptionList
        type="column"
        listItems={[
          {
            title: 'Integration', // Replace Log type to Integration by Wazuh
            description: (
              <>
                <EuiCompressedFormRow label="Name">
                  <EuiCompressedFieldText
                    value={logTypeDetails?.name}
                    onChange={(e) =>
                      setLogTypeDetails({
                        ...logTypeDetails!,
                        name: e.target.value,
                      })
                    }
                    placeholder="Enter name for integration" // Replace Log type to Integration by Wazuh
                    disabled={!isEditMode || !!logTypeDetails.detectionRulesCount}
                  />
                </EuiCompressedFormRow>
                <EuiSpacer />
                <EuiCompressedFormRow label="Description">
                  <EuiCompressedTextArea
                    value={logTypeDetails?.description}
                    onChange={(e) =>
                      setLogTypeDetails({
                        ...logTypeDetails!,
                        description: e.target.value,
                      })
                    }
                    placeholder="Description of the integration" // Replace Log type to Integration by Wazuh
                    disabled={!isEditMode}
                  />
                </EuiCompressedFormRow>
                {isEditMode ? (
                  <EuiBottomBar>
                    <EuiFlexGroup gutterSize="s" justifyContent="flexEnd">
                      <EuiFlexItem grow={false}>
                        <EuiButtonEmpty
                          color="ghost"
                          size="s"
                          iconType="cross"
                          onClick={() => {
                            setLogTypeDetails(initialLogTypeDetails);
                            setIsEditMode(false);
                          }}
                        >
                          Cancel
                        </EuiButtonEmpty>
                      </EuiFlexItem>
                      <EuiFlexItem grow={false}>
                        <EuiButton color="primary" fill size="s" onClick={onUpdateLogType}>
                          Update
                        </EuiButton>
                      </EuiFlexItem>
                    </EuiFlexGroup>
                  </EuiBottomBar>
                ) : null}
              </>
            ),
          },
        ]}
      />
    </ContentPanel>
  );
};
