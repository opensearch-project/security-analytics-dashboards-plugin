/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
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
import { IntegrationItem } from '../../../../types';
import { DataStore } from '../../../store/DataStore';

export interface IntegrationDetailsTabProps {
  initialIntegrationDetails: IntegrationItem;
  integrationDetails: IntegrationItem;
  isEditMode: boolean;
  setIsEditMode: (isEdit: boolean) => void;
  setIntegrationDetails: (integration: IntegrationItem) => void;
  integrationId: string;
}

export const IntegrationDetailsTab: React.FC<IntegrationDetailsTabProps> = ({
  initialIntegrationDetails,
  integrationDetails,
  isEditMode,
  setIsEditMode,
  setIntegrationDetails,
  integrationId,
}) => {
  const onUpdateIntegration = async () => {
    const success = await DataStore.integrations.updateIntegration(
      integrationId,
      integrationDetails
    );
    if (success) {
      setIsEditMode(false);
    }
  };

  return (
    <ContentPanel
      title="Details"
      actions={
        !isEditMode && [<EuiSmallButton onClick={() => setIsEditMode(true)}>Edit</EuiSmallButton>]
      }
    >
      <EuiDescriptionList
        type="column"
        listItems={[
          {
            title: 'Integration', // Replace Log type to Integration by Wazuh
            description: (
              <>
                <EuiCompressedFormRow label="Title">
                  <EuiCompressedFieldText
                    value={integrationDetails?.document.title}
                    onChange={(e) =>
                      setIntegrationDetails({
                        ...integrationDetails!,
                        document: {
                          ...integrationDetails.document,
                          title: e.target.value,
                        },
                      })
                    }
                    placeholder="Enter name for integration" // Replace Log type to Integration by Wazuh
                    disabled={!isEditMode || !!integrationDetails.detectionRulesCount}
                  />
                </EuiCompressedFormRow>
                <EuiSpacer />
                <EuiCompressedFormRow label="Description">
                  <EuiCompressedTextArea
                    value={integrationDetails?.document.description}
                    onChange={(e) =>
                      setIntegrationDetails({
                        ...integrationDetails!,
                        document: {
                          ...integrationDetails.document,
                          description: e.target.value,
                        },
                      })
                    }
                    placeholder="Description of the integration" // Replace Log type to Integration by Wazuh
                    disabled={!isEditMode}
                  />
                </EuiCompressedFormRow>
                {isEditMode ? (
                  <>
                    <EuiBottomBar>
                      <EuiFlexGroup gutterSize="s" justifyContent="flexEnd">
                        <EuiFlexItem grow={false}>
                          <EuiButtonEmpty
                            color="ghost"
                            size="s"
                            iconType="cross"
                            onClick={() => {
                              setIntegrationDetails(initialIntegrationDetails);
                              setIsEditMode(false);
                            }}
                          >
                            Cancel
                          </EuiButtonEmpty>
                        </EuiFlexItem>
                        <EuiFlexItem grow={false}>
                          <EuiButton color="primary" fill size="s" onClick={onUpdateIntegration}>
                            Update
                          </EuiButton>
                        </EuiFlexItem>
                      </EuiFlexGroup>
                    </EuiBottomBar>
                  </>
                ) : null}
              </>
            ),
          },
        ]}
      />
    </ContentPanel>
  );
};
