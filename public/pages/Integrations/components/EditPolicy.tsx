import React, { useCallback, useMemo, useState, useEffect } from 'react';
import {
  EuiFlyout,
  EuiFlyoutHeader,
  EuiFlyoutBody,
  EuiFlyoutFooter,
  EuiText,
  EuiSwitch,
  EuiCompressedFormRow,
  EuiCompressedFieldText,
  EuiCompressedTextArea,
  EuiFlexItem,
  EuiFlexGroup,
  EuiButton,
  EuiButtonEmpty,
  EuiComboBox,
  EuiPopover,
  EuiFilterGroup,
  EuiFilterButton,
  EuiFilterSelectItem,
  EuiOverlayMask,
  EuiConfirmModal,
} from '@elastic/eui';

import { withPolicyGuard } from './PolicyInfo';
import { DecoderSource, PolicyDocument, Space } from '../../../../types';
import { NotificationsStart } from 'opensearch-dashboards/public';
import { DataStore } from '../../../store/DataStore';
import { successNotificationToast } from '../../../utils/helpers';
import { FormFieldArray } from '../../../components/FormFieldArray';
import { INTEGRATION_AUTHOR_REGEX, validateName } from '../../../utils/validation';
import { buildDecodersSearchQuery } from '../../Decoders/utils/constants';
import { SPACE_ACTIONS } from '../../../../common/constants';
import { actionIsAllowedOnSpace } from '../../../../common/helpers';
import { ALLOWED_ENRICHMENTS, ENRICHMENT_LABELS, EnrichmentType } from '../constants/enrichments';

const DECODER_SEARCH_SIZE = 25;
const DELAY_ON_SEARCH = 300; // ms

const EditForm: React.FC<{}> = withPolicyGuard({
  includeIntegrationFields: ['document'],
})(({
  policyDocumentData,
  rootDecoder,
  notifications,
  space,
  onClose,
  onSuccess,
  onFlyoutClose,
  setCanClose,
}: {
  policyDocumentData: PolicyDocument;
  rootDecoder: DecoderSource;
  notifications: NotificationsStart;
  space: Space;
  onClose: () => void;
  onSuccess: () => void;
  onFlyoutClose: () => void;
  setCanClose: (arg0: boolean) => void;
}) => {
  const [policyDetails, setPolicyDetails] = useState<PolicyDocument>(policyDocumentData);
  const [titleError, setTitleError] = useState('');
  const [authorError, setAuthorError] = useState('');
  const [decoderList, setDecoderList] = useState<Array<{ label: string; value: DecoderSource }>>(
    []
  );

  const [decoderSearch, setDecoderSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(decoderSearch);
    }, DELAY_ON_SEARCH);

    return () => clearTimeout(handler);
  }, [decoderSearch]);

  useEffect(() => {
    fetchDecoders(debouncedSearch);
  }, [debouncedSearch]);

  // If the policy has a root decoder set it as the initial value
  const [selectedDecoder, setSelectedDecoder] = useState<
    Array<{ label: string; value: DecoderSource }>
  >(() => {
    if (rootDecoder?.document) {
      return [
        {
          label: rootDecoder.document.name,
          value: rootDecoder,
        },
      ];
    }
    return [];
  });

  const [selectedEnrichments, setSelectedEnrichments] = useState<EnrichmentType[]>(
    () => (policyDocumentData?.enrichments ?? []) as EnrichmentType[]
  );

  const [isEnrichmentPopoverOpen, setIsEnrichmentPopoverOpen] = useState(false);

  // Flag to determine if the space allows editing non-enrichments fields
  const canEditPolicy = actionIsAllowedOnSpace(space, SPACE_ACTIONS.EDIT_POLICY);
  const canEditToggles =
    canEditPolicy || actionIsAllowedOnSpace(space, SPACE_ACTIONS.EDIT_POLICY_INDEXING_SETTINGS);
  const canEditEnrichments = actionIsAllowedOnSpace(space, SPACE_ACTIONS.EDIT_POLICY_ENRICHMENTS);

  const handleEnrichmentToggle = useCallback((value: EnrichmentType) => {
    setSelectedEnrichments((prev) => {
      const isActive = prev.includes(value);
      const nextSelection = isActive ? prev.filter((item) => item !== value) : [...prev, value];
      setPolicyDetails((prevPolicy) => ({
        ...prevPolicy,
        enrichments: nextSelection,
      }));
      return nextSelection;
    });
  }, []);

  const hasChanges = useMemo(() => {
    return JSON.stringify(policyDetails) !== JSON.stringify(policyDocumentData);
  }, [policyDetails, policyDocumentData]);

  useEffect(() => {
    setCanClose(!hasChanges);
  }, [hasChanges]);

  const renderTextValue = (value?: string | null) => (
    <EuiText size="s" color="subdued">
      {value || '-'}
    </EuiText>
  );

  const renderBooleanValue = (value?: boolean) => (
    <EuiText size="s" color="subdued">
      {value ? 'yes' : 'no'}
    </EuiText>
  );

  const updateErrors = (details: PolicyDocument) => {
    const titleInvalid = !validateName(details.metadata?.title, INTEGRATION_AUTHOR_REGEX);
    const authorInvalid = !validateName(details.metadata?.author, INTEGRATION_AUTHOR_REGEX);
    setTitleError(titleInvalid ? 'Invalid title' : '');
    setAuthorError(authorInvalid ? 'Invalid author' : '');

    return { titleInvalid, authorInvalid };
  };

  const sanitizatePolicy = (details: PolicyDocument) => {
    const refs = details.metadata?.references;
    const references = Array.isArray(refs) ? refs.filter((ref) => String(ref).trim() !== '') : [];
    return {
      root_decoder: details.root_decoder,
      integrations: details.integrations,
      filters: details.filters ?? [],
      enrichments: details.enrichments,
      enabled: details.enabled,
      index_unclassified_events: details.index_unclassified_events,
      index_discarded_events: details.index_discarded_events,
      metadata: {
        title: details.metadata?.title ?? '',
        author: details.metadata?.author ?? '',
        description: details.metadata?.description ?? '',
        documentation: details.metadata?.documentation ?? '',
        references,
      },
    };
  };

  const fetchDecoders = async (search: string) => {
    try {
      const query = buildDecodersSearchQuery(search);
      const response = await DataStore.decoders.searchDecoders(
        {
          from: 0,
          size: DECODER_SEARCH_SIZE,
          sort: [{ ['document.name']: { order: 'asc', unmapped_type: 'keyword' } }],
          query,
          _source: { includes: ['document.id', 'document.name'] },
        },
        space
      );
      setDecoderList(
        response.items.map((item) => ({
          label: item?.document?.name ?? item?.document?.id,
          value: item,
        }))
      );
    } catch {
      setDecoderList([]);
    }
  };

  const onConfirm = async () => {
    const payload = sanitizatePolicy(policyDetails);
    const [ok] = await DataStore.policies.updatePolicy(space, payload);

    if (ok) {
      successNotificationToast(notifications, 'updated', `[${space}] space`);
      if (onSuccess) onSuccess();
      onClose();
    }
  };

  const onConfirmClicked = useCallback(() => {
    const { titleInvalid, authorInvalid } = updateErrors(policyDetails);

    if (titleInvalid || authorInvalid) {
      notifications?.toasts.addDanger({
        title: `Failed to update`,
        text: `Fix the marked errors.`,
        toastLifeTimeMs: 3000,
      });
      return;
    }
    onConfirm();
  }, [onConfirm, notifications, policyDetails]);

  return (
    <>
      <EuiFlyoutBody>
        <EuiCompressedFormRow label="Title" isInvalid={!!titleError} error={titleError}>
          {canEditPolicy ? (
            <EuiCompressedFieldText
              value={policyDetails.metadata?.title ?? ''}
              onChange={(e) => {
                const newPolicy = {
                  ...policyDetails,
                  metadata: {
                    ...policyDetails.metadata,
                    title: e.target.value,
                  },
                };
                setPolicyDetails(newPolicy);
                updateErrors(newPolicy);
              }}
            />
          ) : (
            renderTextValue(policyDetails.metadata?.title)
          )}
        </EuiCompressedFormRow>
        <EuiCompressedFormRow label="Author" isInvalid={!!authorError} error={authorError}>
          {canEditPolicy ? (
            <EuiCompressedFieldText
              value={policyDetails.metadata?.author ?? ''}
              onChange={(e) => {
                const newPolicy = {
                  ...policyDetails,
                  metadata: {
                    ...policyDetails.metadata,
                    author: e.target.value,
                  },
                };
                setPolicyDetails(newPolicy);
                updateErrors(newPolicy);
              }}
            />
          ) : (
            renderTextValue(policyDetails.metadata?.author)
          )}
        </EuiCompressedFormRow>
        <EuiCompressedFormRow
          label={
            <>
              {'Description - '}
              <em>optional</em>
            </>
          }
        >
          {canEditPolicy ? (
            <EuiCompressedTextArea
              value={policyDetails.metadata?.description || ''}
              onChange={(e) => {
                const newPolicy = {
                  ...policyDetails,
                  metadata: {
                    ...policyDetails.metadata,
                    description: e.target.value,
                  },
                };
                setPolicyDetails(newPolicy);
                updateErrors(newPolicy);
              }}
            />
          ) : (
            renderTextValue(policyDetails.metadata?.description)
          )}
        </EuiCompressedFormRow>
        <EuiCompressedFormRow
          label={
            <>
              {'Documentation - '}
              <em>optional</em>
            </>
          }
        >
          {canEditPolicy ? (
            <EuiCompressedFieldText
              value={policyDetails.metadata?.documentation || ''}
              onChange={(e) => {
                const newPolicy = {
                  ...policyDetails,
                  metadata: {
                    ...policyDetails.metadata,
                    documentation: e.target.value,
                  },
                };
                setPolicyDetails(newPolicy);
                updateErrors(newPolicy);
              }}
            />
          ) : (
            renderTextValue(policyDetails.metadata?.documentation)
          )}
        </EuiCompressedFormRow>
        <EuiCompressedFormRow label={!canEditToggles ? 'Enabled' : undefined}>
          {canEditToggles ? (
            <EuiSwitch
              label="Enabled"
              compressed
              checked={policyDetails.enabled || false}
              onChange={(e) => {
                const newPolicy = {
                  ...policyDetails,
                  enabled: e.target.checked,
                };
                setPolicyDetails(newPolicy);
                updateErrors(newPolicy);
              }}
            />
          ) : (
            renderBooleanValue(policyDetails.enabled)
          )}
        </EuiCompressedFormRow>
        <EuiCompressedFormRow label={!canEditToggles ? 'Index unclassified events' : undefined}>
          {canEditToggles ? (
            <EuiSwitch
              label="Index unclassified events"
              compressed
              checked={policyDetails.index_unclassified_events || false}
              onChange={(e) => {
                const newPolicy = {
                  ...policyDetails,
                  index_unclassified_events: e.target.checked,
                };
                setPolicyDetails(newPolicy);
                updateErrors(newPolicy);
              }}
            />
          ) : (
            renderBooleanValue(policyDetails.index_unclassified_events)
          )}
        </EuiCompressedFormRow>
        <EuiCompressedFormRow label={!canEditToggles ? 'Index discarded events' : undefined}>
          {canEditToggles ? (
            <EuiSwitch
              label="Index discarded events"
              compressed
              checked={policyDetails.index_discarded_events || false}
              onChange={(e) => {
                const newPolicy = {
                  ...policyDetails,
                  index_discarded_events: e.target.checked,
                };
                setPolicyDetails(newPolicy);
                updateErrors(newPolicy);
              }}
            />
          ) : (
            renderBooleanValue(policyDetails.index_discarded_events)
          )}
        </EuiCompressedFormRow>
        <EuiCompressedFormRow
          label={
            <>
              {'Root Decoder - '}
              <em>optional</em>
            </>
          }
        >
          {canEditPolicy ? (
            <EuiComboBox
              placeholder="Search and select a decoder"
              singleSelection={{ asPlainText: true }}
              options={decoderList}
              selectedOptions={selectedDecoder}
              onSearchChange={(searchValue) => setDecoderSearch(searchValue)}
              onChange={(selected) => {
                setSelectedDecoder(selected);
                const newPolicy = {
                  ...policyDetails,
                  root_decoder: selected.length > 0 ? selected[0].value?.document?.id : '',
                };
                setPolicyDetails(newPolicy);
                updateErrors(newPolicy);
                if (selected.length === 0) {
                  setDecoderSearch('');
                }
              }}
              async
            />
          ) : (
            renderTextValue(rootDecoder?.document?.name)
          )}
        </EuiCompressedFormRow>
        <EuiCompressedFormRow
          label={
            <>
              {'Enrichments - '}
              <em>optional</em>
            </>
          }
        >
          <EuiFilterGroup>
            <EuiPopover
              button={
                <EuiFilterButton
                  iconType="arrowDown"
                  onClick={() => setIsEnrichmentPopoverOpen((prev) => !prev)}
                  isSelected={isEnrichmentPopoverOpen}
                  numFilters={selectedEnrichments.length}
                  hasActiveFilters={selectedEnrichments.length > 0}
                  numActiveFilters={selectedEnrichments.length}
                  isDisabled={!canEditEnrichments}
                >
                  Select enrichments
                </EuiFilterButton>
              }
              isOpen={isEnrichmentPopoverOpen}
              closePopover={() => setIsEnrichmentPopoverOpen(false)}
              panelPaddingSize="none"
            >
              <div className="euiFilterSelect__items">
                {ALLOWED_ENRICHMENTS.map((value) => (
                  <EuiFilterSelectItem
                    key={value}
                    checked={selectedEnrichments.includes(value) ? 'on' : undefined}
                    onClick={() => handleEnrichmentToggle(value)}
                  >
                    {ENRICHMENT_LABELS[value]}
                  </EuiFilterSelectItem>
                ))}
              </div>
            </EuiPopover>
          </EuiFilterGroup>
        </EuiCompressedFormRow>
        <EuiCompressedFormRow label={!canEditPolicy ? 'References - optional' : undefined}>
          {canEditPolicy ? (
            <FormFieldArray
              label={
                <>
                  {'References - '}
                  <em>optional</em>
                </>
              }
              values={policyDetails.metadata?.references || []}
              placeholder="https://example.com/reference"
              readOnly={false}
              addButtonLabel="Add reference"
              onChange={(references) => {
                const newPolicy = {
                  ...policyDetails,
                  metadata: { ...policyDetails.metadata, references },
                };
                setPolicyDetails(newPolicy);
                updateErrors(newPolicy);
              }}
            />
          ) : (
            renderTextValue(policyDetails.metadata?.references?.join(', ') ?? '')
          )}
        </EuiCompressedFormRow>
      </EuiFlyoutBody>
      <EuiFlyoutFooter>
        <EuiFlexGroup justifyContent="spaceBetween">
          <EuiFlexItem grow={false}>
            <EuiButtonEmpty onClick={onFlyoutClose}>Cancel</EuiButtonEmpty>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton fill onClick={onConfirmClicked} isDisabled={!hasChanges}>
              Save
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlyoutFooter>
    </>
  );
});

export type EditPolicyProps = {
  onClose: () => void;
  onSuccess: () => void;
  space: Space;
  notifications: NotificationsStart;
};

export const EditPolicy: React.FC<EditPolicyProps> = ({
  onClose,
  onSuccess,
  space,
  notifications,
}) => {
  const [canClose, setCanClose] = useState(true);
  const [canNotCloseIsOpen, setCanNotCloseIsOpen] = useState(false);
  const onFlyoutClose = function () {
    if (!canClose) {
      setCanNotCloseIsOpen(true);
      return;
    }
    onClose();
  };

  return (
    <>
      <EuiFlyout onClose={onFlyoutClose} ownFocus size="s">
        <EuiFlyoutHeader hasBorder={true}>
          <EuiText size="s">
            <h2>Edit space details</h2>
          </EuiText>
        </EuiFlyoutHeader>
        <EditForm
          space={space}
          notifications={notifications}
          onClose={onClose}
          onSuccess={onSuccess}
          setCanClose={setCanClose}
          onFlyoutClose={onFlyoutClose}
        />
      </EuiFlyout>
      {canNotCloseIsOpen && (
        <EuiOverlayMask>
          <EuiConfirmModal
            title="Unsubmitted changes"
            onConfirm={onClose}
            onCancel={() => setCanNotCloseIsOpen(false)}
            cancelButtonText="No, don't do it"
            confirmButtonText="Yes, do it"
          >
            <p style={{ textAlign: 'center' }}>
              There are unsaved changes. Are you sure you want to proceed?
            </p>
          </EuiConfirmModal>
        </EuiOverlayMask>
      )}
    </>
  );
};
