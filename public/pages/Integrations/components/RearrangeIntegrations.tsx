import React, { useEffect, useState, useMemo } from 'react';
import {
  EuiButton,
  EuiCallOut,
  EuiConfirmModal,
  EuiDescriptionListTitle,
  EuiDescriptionListDescription,
  EuiFlexGroup,
  EuiFlexGrid,
  EuiFlexItem,
  EuiFieldNumber,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiFlyoutFooter,
  EuiIcon,
  EuiOverlayMask,
  EuiPanel,
  EuiText,
  EuiSpacer,
} from '@elastic/eui';
import { get } from 'lodash';
import { compose } from 'redux';
import { RearrangeItems, RearrangeItemsProps } from './Rearrange';
import { withPolicyGuard } from './PolicyInfo';
import { Space } from '../../../../types';
import { DataStore } from '../../../store/DataStore';
import { successNotificationToast } from '../../../utils/helpers';
import { withGuard } from '../utils/helpers';

const RearrageItemAttribute: React.FC<{ title: string; description: any }> = ({ field, value }) => (
  <>
    <EuiDescriptionListTitle>
      {integrationSourceDocumentFieldsUIMapperLabel[field]}
    </EuiDescriptionListTitle>
    <EuiDescriptionListDescription>{value}</EuiDescriptionListDescription>
  </>
);

const euiDescriptionListClassName =
  'euiDescriptionList euiDescriptionList--row euiDescriptionList--compressed';

const RearrangeItem: RearrangeItemsProps = (
  item: any,
  idx,
  items,
  { hidx, lastMovement, moveItem }
) => {
  const [valueIndex, setValueIndex] = useState(hidx);
  const moveItemto = (toIndex: number) => {
    setValueIndex(toIndex);
    moveItem(toIndex);
  };

  useEffect(() => {
    setValueIndex(hidx);
  }, [lastMovement]);

  return (
    <EuiPanel paddingSize="s">
      <EuiFlexGroup alignItems="center">
        <EuiFlexItem grow={false} responsive={false}>
          <EuiIcon type="grab" />
        </EuiFlexItem>
        <EuiFlexItem grow={false} responsive={false}>
          <EuiFieldNumber
            style={{ maxWidth: '55px' }}
            value={valueIndex}
            onChange={(e) => setValueIndex(e.target.value)}
            min={1}
            max={items.length}
            compressed
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                moveItemto(Number(valueIndex));
              }
            }}
          />
        </EuiFlexItem>
        <EuiFlexItem grow={true}>
          <EuiFlexGrid columns={3} gutterSize="s">
            {['title', 'category'].map((field) => (
              <EuiFlexItem key={field} className={euiDescriptionListClassName}>
                <RearrageItemAttribute field={field} value={get(item.source, field)} />
              </EuiFlexItem>
            ))}
          </EuiFlexGrid>
          <EuiSpacer size="s" />
          <EuiFlexGrid columns={3} gutterSize="s">
            {['decoders', 'kvdbs', 'rules'].map((field) => (
              <EuiFlexItem key={field} className={euiDescriptionListClassName}>
                <RearrageItemAttribute field={field} value={get(item.source, field)} />
              </EuiFlexItem>
            ))}
          </EuiFlexGrid>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiPanel>
  );
};

const integrationSourceDocumentFieldsUI = ['title', 'category', 'decoders', 'kvdbs', 'rules'];
const integrationSourceDocumentFields = ['id', ...integrationSourceDocumentFieldsUI];

const integrationSourceDocumentFieldsUIMapperLabel = {
  title: 'Title',
  category: 'Category',
  decoders: 'Decoders',
  kvdbs: 'KVDBs',
  rules: 'Rules',
};

const getArrayLengthMapper = (value: any) => value?.length || 0;

// specify how to map the fields from the document to the values used in the UI, for example we want to show the length of the decoders array instead of the array itself
const integrationSourceDocumentFieldMapper = {
  decoders: getArrayLengthMapper,
  kvdbs: getArrayLengthMapper,
  rules: getArrayLengthMapper,
};

// helper function to get the field path for the integration document fields, for example for the 'title' field it will return 'document.title' since the data is nested in the document object
function getDocumentField(field: string) {
  return `document.${field}`;
}

interface RearrangeIntegrationsViewProps {
  prependRearrangeItems?: React.ReactNode;
  policyDocumentData: any;
  policyEnhancedData: any;
  space: Space;
  notifications: any;
  onConfirm: () => void;
  setHasModifications: (hasModifications: boolean) => void;
}
const RearrangeIntegrationsBody: React.FC<RearrangeIntegrationsViewProps> = ({
  policyDocumentData,
  policyEnhancedData,
  onConfirm,
  space,
  notifications,
  setHasModifications,
  prependRearrangeItems = null,
}) => {
  const integrations = useMemo(
    () =>
      policyDocumentData?.integrations.map((id) => {
        const integrationData = policyEnhancedData.integrationsMap?.[id] || {};

        const source = Object.fromEntries(
          integrationSourceDocumentFields.map((field) => {
            const value = get(integrationData, getDocumentField(field));
            return [
              field,
              integrationSourceDocumentFieldMapper[field]
                ? integrationSourceDocumentFieldMapper[field](value)
                : value,
            ];
          })
        );

        return { id, source };
      }) || [],
    [policyDocumentData]
  );
  const [rearrangedIntegrations, setRearrangedIntegrations] = useState(integrations);

  const areIntegrationsInOrder = useMemo(() => {
    return integrations.every(
      (integration, index) => integration.id === rearrangedIntegrations[index]?.id
    );
  }, [integrations, rearrangedIntegrations]);

  useEffect(() => {
    setHasModifications(areIntegrationsInOrder);
  }, [areIntegrationsInOrder]);

  const onConfirmEnhanced = async () => {
    // Re-fetch the current policy just before saving to guard against race conditions
    // (e.g. an integration deleted in another tab while this flyout was open).
    const latestPolicy = await DataStore.policies.searchPolicies(space, {});
    const latestIntegrationIds = new Set(latestPolicy.items[0]?.document?.integrations ?? []);

    // Drop any integration that no longer exists in the latest policy state
    const validIntegrations = rearrangedIntegrations.filter(({ id }) =>
      latestIntegrationIds.has(id)
    );

    const payload = {
      ...policyDocumentData,
      integrations: validIntegrations.map(({ id }) => id),
    };
    const [success] = await DataStore.policies.updatePolicy(policyDocumentData.id, payload);

    if (success) {
      successNotificationToast(notifications, 'updated', `[${space}] policy`);
      onConfirm();
    }
  };

  return (
    <>
      <EuiFlyoutBody>
        {prependRearrangeItems}
        <RearrangeItems
          items={rearrangedIntegrations}
          onChange={setRearrangedIntegrations}
          draggableProps={{ spacing: 's' }}
          renderItem={RearrangeItem}
        />
      </EuiFlyoutBody>
      <EuiFlyoutFooter>
        <EuiFlexGroup justifyContent="flexEnd" gutterSize="m">
          <EuiFlexItem grow={false}>
            <EuiButton fill={true} onClick={onConfirmEnhanced} isDisabled={areIntegrationsInOrder}>
              Rearrange
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlyoutFooter>
    </>
  );
};

export type RearrangeIntegrationWithDataProps = RearrangeIntegrationsViewProps;

const RearrangeIntegrationWithData: React.FC<RearrangeIntegrationWithDataProps> = compose(
  withPolicyGuard({
    includeIntegrationFields: integrationSourceDocumentFields.map((field) =>
      getDocumentField(field)
    ),
  }),
  withGuard(
    (props) => !Boolean(props.policyDocumentData?.integrations?.length),
    () => (
      <EuiFlyoutBody>
        <EuiCallOut
          title="No integrations are available to rearrange in this space"
          iconType="iInCircle"
          color="primary"
        >
          Add integrations to enable the rearrange functionality.
        </EuiCallOut>
      </EuiFlyoutBody>
    )
  )
)(RearrangeIntegrationsBody);

export type RearrangeIntegrationsProps = RearrangeIntegrationWithDataProps & {
  onClose: () => void;
};
export const RearrangeIntegrations: React.FC<RearrangeIntegrationsProps> = ({
  onClose,
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
      <EuiFlyout onClose={onFlyoutClose} ownFocus>
        <EuiFlyoutHeader hasBorder={true}>
          <EuiText size="s">
            <h2>Rearrange integrations - {space} space</h2>
          </EuiText>
        </EuiFlyoutHeader>
        <RearrangeIntegrationWithData
          prependRearrangeItems={
            <>
              <EuiText>Define the order of the integrations in the space.</EuiText>
              <EuiSpacer></EuiSpacer>
            </>
          }
          space={space}
          onConfirm={onClose}
          notifications={notifications}
          setHasModifications={setCanClose}
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
