/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  EuiBottomBar,
  EuiButton,
  EuiButtonEmpty,
  EuiCompressedFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiCompressedFormRow,
  EuiCompressedSwitch,
  EuiSpacer,
  EuiCompressedSuperSelect,
  EuiCompressedTextArea,
  EuiText,
} from '@elastic/eui';
import { IntegrationItem } from '../../../../types';
import React, { useEffect, useMemo, useCallback } from 'react';
import {
  INTEGRATION_AUTHOR_REGEX,
  LOG_TYPE_NAME_REGEX,
  validateName,
} from '../../../utils/validation';
import { NotificationsStart } from 'opensearch-dashboards/public';
import { useState } from 'react';
import { getIntegrationCategoryOptions } from '../../../utils/helpers';
import { FormFieldArray } from '../../../components/FormFieldArray';

interface ReadOnlyFieldProps {
  value: string | undefined;
  placeholder?: string;
  isTextArea?: boolean;
}

const ReadOnlyField: React.FC<ReadOnlyFieldProps> = ({
  value,
  placeholder = '-',
  isTextArea = false,
}) => (
  <EuiText
    size="s"
    style={{
      padding: '6px 0',
      lineHeight: isTextArea ? '1.5' : '20px',
      whiteSpace: isTextArea ? 'pre-wrap' : 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    }}
  >
    {value || placeholder}
  </EuiText>
);

export interface IntegrationFormProps {
  integrationDetails: IntegrationItem;
  isEditMode: boolean;
  confirmButtonText: string;
  notifications: NotificationsStart;
  onCancel: () => void;
  onConfirm: (integrationData: IntegrationItem) => void;
}

export const IntegrationForm: React.FC<IntegrationFormProps> = ({
  integrationDetails,
  isEditMode,
  confirmButtonText,
  notifications,
  onCancel,
  onConfirm,
}) => {
 
  /*The enabled field is only shown when creating a new integration
  * When editing, the enabled property is changed using the Actions button
  */
  const showEnabledField = isEditMode && !integrationDetails.id;
  const [titleError, setTitleError] = useState('');
  const [categoryError, setCategoryError] = useState('');
  const [categoryTouched, setCategoryTouched] = useState(false);
  const [authorError, setAuthorError] = useState('');
  const [editingIntegration, setEditingIntegration] = useState<IntegrationItem>(integrationDetails);

  useEffect(() => {
    if (isEditMode) {
      setEditingIntegration(integrationDetails);
    }
  }, [isEditMode, integrationDetails]);

  const updateErrors = (details: IntegrationItem, onSubmit = false) => {
    const metadata = details.document.metadata;
    const titleInvalid = !validateName(metadata?.title, LOG_TYPE_NAME_REGEX, false);
    const authorInvalid = !validateName(metadata?.author, INTEGRATION_AUTHOR_REGEX, false);
    const categoryInvalid = (categoryTouched || onSubmit) && !details.document.category;
    setTitleError(titleInvalid ? 'Invalid title' : '');
    setCategoryError(categoryInvalid ? 'Select category to assign' : '');
    setAuthorError(authorInvalid ? 'Invalid author' : '');

    return { titleInvalid, categoryInvalid, authorInvalid };
  };
  const categoryOptions = useMemo(() => getIntegrationCategoryOptions(), []);
  const categoryOptionsWithDisabled = useMemo(
    () =>
      categoryOptions.map((option) => ({
        ...option,
        disabled: !!integrationDetails.detectionRulesCount,
      })),
    [categoryOptions, integrationDetails.detectionRulesCount]
  );

  const getCategoryLabel = useCallback(
    (categoryValue: string | undefined): string | undefined => {
      if (!categoryValue) return undefined;
      const found = categoryOptions.find((opt) => opt.value === categoryValue);
      return found?.inputDisplay as string | undefined;
    },
    [categoryOptions]
  );

  const onConfirmClicked = useCallback(() => {
    const { titleInvalid, categoryInvalid, authorInvalid } = updateErrors(editingIntegration, true);

    if (titleInvalid || categoryInvalid || authorInvalid) {
      notifications?.toasts.addDanger({
        title: `Failed to ${confirmButtonText.toLowerCase()}`,
        text: `Fix the marked errors.`,
        toastLifeTimeMs: 3000,
      });
      return;
    }
    onConfirm(editingIntegration);
  }, [editingIntegration, notifications, confirmButtonText, onConfirm]);

  const onCancelClicked = useCallback(() => {
    setEditingIntegration(integrationDetails);
    setTitleError('');
    setCategoryError('');
    setCategoryTouched(false);
    setAuthorError('');
    onCancel();
  }, [integrationDetails, onCancel]);

  return (
    <>
      <div style={{ paddingBottom: isEditMode ? '60px' : '0' }}>
        <EuiCompressedFormRow
          label="Title"
          helpText={
            isEditMode &&
            'Must contain 2-50 characters. Valid characters are a-z, 0-9, hyphens, and underscores'
          }
          isInvalid={!!titleError}
          error={titleError}
        >
          {isEditMode ? (
            <EuiCompressedFieldText
              value={editingIntegration?.document.metadata?.title}
              onChange={(e) => {
                const newIntegration = {
                  ...editingIntegration!,
                  document: {
                    ...editingIntegration!.document,
                    metadata: {
                      ...editingIntegration!.document.metadata,
                      title: e.target.value,
                    },
                  },
                };
                setEditingIntegration(newIntegration);
                updateErrors(newIntegration);
              }}
              disabled={!!integrationDetails.detectionRulesCount}
            />
          ) : (
            <ReadOnlyField value={integrationDetails?.document.metadata?.title} />
          )}
        </EuiCompressedFormRow>
        <EuiSpacer />
        <EuiCompressedFormRow label="Category" isInvalid={!!categoryError} error={categoryError}>
          {isEditMode ? (
            <EuiCompressedSuperSelect
              options={categoryOptionsWithDisabled}
              value={editingIntegration?.document.category}
              onChange={(value) => {
                const newIntegration = {
                  ...editingIntegration!,
                  document: {
                    ...editingIntegration!.document,
                    category: value,
                  },
                };
                setCategoryTouched(true);
                setEditingIntegration(newIntegration);
                updateErrors(newIntegration);
              }}
              disabled={!!integrationDetails.detectionRulesCount}
            />
          ) : (
            <ReadOnlyField value={getCategoryLabel(integrationDetails?.document.category)} />
          )}
        </EuiCompressedFormRow>
        <EuiCompressedFormRow
          label="Author"
          helpText={isEditMode && 'Must contain 2-50 characters.'}
          isInvalid={!!authorError}
          error={authorError}
        >
          {isEditMode ? (
            <EuiCompressedFieldText
              value={editingIntegration?.document.metadata?.author}
              onChange={(e) => {
                const newIntegration = {
                  ...editingIntegration!,
                  document: {
                    ...editingIntegration!.document,
                    metadata: {
                      ...editingIntegration!.document.metadata,
                      author: e.target.value,
                    },
                  },
                };
                setEditingIntegration(newIntegration);
                updateErrors(newIntegration);
              }}
              disabled={!!integrationDetails.detectionRulesCount}
            />
          ) : (
            <ReadOnlyField value={integrationDetails?.document.metadata?.author} />
          )}
        </EuiCompressedFormRow>
        {showEnabledField ? (
          <>
            <EuiSpacer />
            <EuiCompressedFormRow label="Enabled">
              <EuiCompressedSwitch
                label={editingIntegration?.document.enabled === true ? 'Enabled' : 'Disabled'}
                checked={editingIntegration?.document.enabled === true}
                onChange={(e) => {
                  const newIntegration = {
                    ...editingIntegration!,
                    document: {
                      ...editingIntegration!.document,
                      enabled: e.target.checked,
                    },
                  };
                  setEditingIntegration(newIntegration);
                  updateErrors(newIntegration);
                }}
                data-test-subj="integration_enabled_toggle"
              />
            </EuiCompressedFormRow>
            <EuiSpacer />
          </>
        ) : (
          <EuiSpacer />
        )}
        <EuiCompressedFormRow
          label={
            isEditMode ? (
              <>
                {'Description - '}
                <em>optional</em>
              </>
            ) : (
              'Description'
            )
          }
        >
          {isEditMode ? (
            <EuiCompressedTextArea
              value={editingIntegration?.document?.metadata?.description}
              onChange={(e) => {
                const newIntegration = {
                  ...editingIntegration!,
                  document: {
                    ...editingIntegration!.document,
                    metadata: {
                      ...editingIntegration!.document.metadata,
                      description: e.target.value,
                    },
                  },
                };
                setEditingIntegration(newIntegration);
                updateErrors(newIntegration);
              }}
              placeholder="Description of the integration"
            />
          ) : (
            <ReadOnlyField value={integrationDetails?.document?.metadata?.description} isTextArea />
          )}
        </EuiCompressedFormRow>
        <EuiSpacer />
        <EuiCompressedFormRow
          label={
            isEditMode ? (
              <>
                {'Documentation - '}
                <em>optional</em>
              </>
            ) : (
              'Documentation'
            )
          }
          helpText={isEditMode && 'Must contain 2-100 characters.'}
        >
          {isEditMode ? (
            <EuiCompressedFieldText
              value={editingIntegration?.document.metadata?.documentation}
              onChange={(e) => {
                const newIntegration = {
                  ...editingIntegration!,
                  document: {
                    ...editingIntegration!.document,
                    metadata: {
                      ...editingIntegration!.document.metadata,
                      documentation: e.target.value,
                    },
                  },
                };
                setEditingIntegration(newIntegration);
                updateErrors(newIntegration);
              }}
              disabled={!!integrationDetails.detectionRulesCount}
            />
          ) : (
            <ReadOnlyField value={integrationDetails?.document.metadata?.documentation} />
          )}
        </EuiCompressedFormRow>
        <EuiSpacer />
        {isEditMode ? (
          <FormFieldArray
            label={
              <>
                {'References - '}
                <em>optional</em>
              </>
            }
            values={editingIntegration?.document?.metadata?.references || []}
            placeholder="https://example.com/reference"
            readOnly={false}
            addButtonLabel="Add reference"
            onChange={(references) => {
              const newIntegration = {
                ...editingIntegration!,
                document: {
                  ...editingIntegration!.document,
                  metadata: {
                    ...editingIntegration!.document.metadata,
                    references,
                  },
                },
              };
              setEditingIntegration(newIntegration);
              updateErrors(newIntegration);
            }}
          />
        ) : (
          integrationDetails?.document?.metadata?.references?.length > 0 && (
            <>
              <EuiCompressedFormRow label="References">
                <EuiText size="s">
                  <ul style={{ paddingLeft: '20px', marginBottom: 0 }}>
                    {integrationDetails.document.metadata.references.map(
                      (ref: string, index: number) => (
                        <li key={index}>{ref || '-'}</li>
                      )
                    )}
                  </ul>
                </EuiText>
              </EuiCompressedFormRow>
              <EuiSpacer />
            </>
          )
        )}
        {isEditMode ? (
          <FormFieldArray
            label={
              <>
                {'Supports - '}
                <em>optional</em>
              </>
            }
            values={editingIntegration?.document?.metadata?.supports || []}
            readOnly={false}
            addButtonLabel="Add support"
            onChange={(supports) => {
              const newIntegration = {
                ...editingIntegration!,
                document: {
                  ...editingIntegration!.document,
                  metadata: {
                    ...editingIntegration!.document.metadata,
                    supports,
                  },
                },
              };
              setEditingIntegration(newIntegration);
              updateErrors(newIntegration);
            }}
          />
        ) : (
          (integrationDetails?.document?.metadata?.supports?.length ?? 0) > 0 && (
              <>
                <EuiCompressedFormRow label="Supports">
                  <EuiText size="s">
                    <ul style={{ paddingLeft: '20px', marginBottom: 0 }}>
                      {integrationDetails.document.metadata.supports.map(
                        (entry: string, index: number) => (
                          <li key={index}>{entry || '-'}</li>
                        )
                      )}
                    </ul>
                  </EuiText>
                </EuiCompressedFormRow>
                <EuiSpacer />
              </>
            )
        )}
      </div>
      {isEditMode ? (
        <EuiBottomBar>
          <EuiFlexGroup gutterSize="s" justifyContent="flexEnd">
            <EuiFlexItem grow={false}>
              <EuiButtonEmpty color="ghost" size="s" iconType="cross" onClick={onCancelClicked}>
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
