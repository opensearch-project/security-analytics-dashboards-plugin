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

const DECODER_SEARCH_SIZE = 25;
const DELAY_ON_SEARCH = 300; // ms

const EditForm: React.FC<{}> = withPolicyGuard({
  includeIntegrationFields: ['document'],
})(
  ({
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

    const hasChanges = useMemo(() => {
      return JSON.stringify(policyDetails) !== JSON.stringify(policyDocumentData);
    }, [policyDetails, policyDocumentData]);

    useEffect(() => {
      setCanClose(!hasChanges);
    }, [hasChanges]);

    const updateErrors = (details: PolicyDocument) => {
      const titleInvalid = !validateName(details.title, INTEGRATION_AUTHOR_REGEX);
      const authorInvalid = !validateName(details.author, INTEGRATION_AUTHOR_REGEX);
      setTitleError(titleInvalid ? 'Invalid title' : '');
      setAuthorError(authorInvalid ? 'Invalid author' : '');

      return { titleInvalid, authorInvalid };
    };

    const sanitizatePolicy = (details: PolicyDocument) => {
      const completePolicy = {
        ...details,
        references: details.references?.filter((ref) => ref.trim() !== '') ?? [],
      };
      return completePolicy;
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
      const [ok] = await DataStore.policies.updatePolicy(policyDocumentData.id, payload);

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
            <EuiCompressedFieldText
              value={policyDetails.title}
              onChange={(e) => {
                const newPolicy = {
                  ...policyDetails,
                  title: e.target.value,
                };
                setPolicyDetails(newPolicy);
                updateErrors(newPolicy);
              }}
            />
          </EuiCompressedFormRow>
          <EuiCompressedFormRow label="Author" isInvalid={!!authorError} error={authorError}>
            <EuiCompressedFieldText
              value={policyDetails.author}
              onChange={(e) => {
                const newPolicy = {
                  ...policyDetails,
                  author: e.target.value,
                };
                setPolicyDetails(newPolicy);
                updateErrors(newPolicy);
              }}
            />
          </EuiCompressedFormRow>
          <EuiCompressedFormRow
            label={
              <>
                {'Description - '}
                <em>optional</em>
              </>
            }
          >
            <EuiCompressedTextArea
              value={policyDetails.description || ''}
              onChange={(e) => {
                const newPolicy = {
                  ...policyDetails,
                  description: e.target.value,
                };
                setPolicyDetails(newPolicy);
                updateErrors(newPolicy);
              }}
            />
          </EuiCompressedFormRow>
          <EuiCompressedFormRow
            label={
              <>
                {'Documentation - '}
                <em>optional</em>
              </>
            }
          >
            <EuiCompressedFieldText
              value={policyDetails.documentation || ''}
              onChange={(e) => {
                const newPolicy = {
                  ...policyDetails,
                  documentation: e.target.value,
                };
                setPolicyDetails(newPolicy);
                updateErrors(newPolicy);
              }}
            />
          </EuiCompressedFormRow>
          <EuiCompressedFormRow>
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
          </EuiCompressedFormRow>
          <EuiCompressedFormRow>
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
          </EuiCompressedFormRow>
          <EuiCompressedFormRow>
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
          </EuiCompressedFormRow>
          <EuiCompressedFormRow
            label={
              <>
                {'Root Decoder - '}
                <em>optional</em>
              </>
            }
          >
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
          </EuiCompressedFormRow>
          <EuiCompressedFormRow>
            <FormFieldArray
              label={
                <>
                  {'References - '}
                  <em>optional</em>
                </>
              }
              values={policyDetails.references || []}
              placeholder="https://example.com/reference"
              readOnly={false}
              addButtonLabel="Add reference"
              onChange={(references) => {
                const newPolicy = {
                  ...policyDetails,
                  references,
                };
                setPolicyDetails(newPolicy);
                updateErrors(newPolicy);
              }}
            />
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
  }
);

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
