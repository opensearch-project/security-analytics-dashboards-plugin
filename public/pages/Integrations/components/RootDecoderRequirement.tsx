import React, { useState, useEffect } from 'react';
import { useAsyncActionRunOnStart, withGuardAsync } from '../utils/helpers';
import { DataStore } from '../../../store/DataStore';
import {
  EuiButton,
  EuiButtonEmpty,
  EuiButtonIcon,
  EuiCallOut,
  EuiFieldSearch,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiSpacer,
  EuiSelect,
  EuiText,
  EuiToolTip,
} from '@elastic/eui';
import { DecoderSource, PolicyDocument, UserSpace } from '../../../../types';
import { ButtonOpenModal, ButtonOpenModalProps } from './Button';
import { buildDecodersSearchQuery } from '../../Decoders/utils/constants';
import { NotificationsStart } from 'opensearch-dashboards/public';
import { errorNotificationToast, successNotificationToast } from '../../../utils/helpers';

const delayOnSearch = 300; // ms
const itemsPerPage = 25;

interface SelectRootDecoderFormProps {
  space: UserSpace;
  notifications: NotificationsStart;
  policyDocumentData: PolicyDocument;
  rootDecoderSource?: DecoderSource;
  onConfirm: () => void;
  onCancel: () => void;
}

const SelectRootDecoderForm: React.FC<SelectRootDecoderFormProps> = ({
  space,
  onCancel,
  notifications,
  policyDocumentData,
  onConfirm,
  rootDecoderSource,
}) => {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, delayOnSearch);

    return () => {
      clearTimeout(handler);
    };
  }, [search]);

  const [selected, setSelected] = useState<string | null>(null);

  const action = useAsyncActionRunOnStart<{
    items: { value: string; label: string };
    total_items: number;
    nextFrom: number;
    search: string;
  }>(
    async (dependencies, state) => {
      const [currentSearch] = dependencies ?? [];

      const isNewSearch = currentSearch !== state.data?.search;

      const prevItems = isNewSearch ? [] : state.data?.items ?? [];
      const size = itemsPerPage;
      const from = isNewSearch ? 0 : state.data?.nextFrom ?? 0;
      const query = buildDecodersSearchQuery(currentSearch); // FIXME: this query does not match with the format of the decoders name, it can not find a substring in the name, it needs to be an exact match, we need to change the query builder to make it work with the name field or change the search field to be the keyword version of the name
      const response = await DataStore.decoders.searchDecoders(
        {
          from,
          size,
          sort: [
            {
              ['document.name']: {
                order: 'asc',
                unmapped_type: 'keyword',
              },
            },
          ],
          query,
          _source: { includes: ['document.id', 'document.name'] },
        },
        space
      );

      const newItems = response.items.map((item) => ({
        value: item?.document?.id,
        label: item?.document?.name ?? item?.document?.id,
      }));
      const data = search === currentSearch ? [...(prevItems || []), ...newItems] : newItems;

      return {
        items: data,
        total_items: response.total,
        nextFrom: from + size,
        search: currentSearch,
      };
    },
    [debouncedSearch],
    { refreshDataOnPreRun: false }
  );

  const updatePolicy = async () => {
    const [success] = await DataStore.policies.updatePolicy(policyDocumentData.id, {
      ...policyDocumentData,
      root_decoder: selected,
    });
    if (success) {
      successNotificationToast(notifications, 'updated', `[${space}] policy`);
      onConfirm();
    } else {
      errorNotificationToast(notifications, 'updated', `[${space}] policy`);
    }
  };

  useEffect(() => {
    if (action.data?.items && !action.data?.items.some((item) => item.value === selected)) {
      setSelected(null); // Reset selected value if it's not in the new items list
    }
  }, [action?.data]);

  if (action.data?.items) {
    return (
      <>
        <EuiFieldSearch
          fullWidth
          placeholder="Search decoders"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          isClearable
          aria-label="Search decoders"
        />
        <EuiSpacer size="m" />
        <EuiFormRow label="Select decoder" fullWidth={true}>
          <EuiSelect
            fullWidth={true}
            onChange={(e) => setSelected(event.target.value)}
            loading={action.running}
            value={selected}
            options={action.data?.items}
            hasNoInitialSelection
            append={
              action.data?.total_items > action.data?.items.length ? (
                <EuiToolTip position="top" content="Fetch more decoders">
                  <EuiButtonIcon
                    iconType="plusInCircle"
                    aria-label="Fetch more decoders"
                    onClick={action.run}
                    color="primary"
                  />
                </EuiToolTip>
              ) : null
            }
          />
        </EuiFormRow>
        <EuiSpacer size="s" />
        {rootDecoderSource && (
          <>
            <EuiText size="s">
              Current root decoder:{' '}
              <EuiToolTip position="top" content={`ID: ${rootDecoderSource.document.id}`}>
                <div>{rootDecoderSource.document.name}</div>
              </EuiToolTip>
            </EuiText>
            <EuiSpacer size="s" />
          </>
        )}
        <div style={{ display: 'flex', justifyContent: 'end' }}>
          <EuiText size="s" color="subdued">
            {action.data.items.length} of {action.data.total_items} decoders loaded
          </EuiText>
        </div>
        <EuiSpacer size="m" />
        <EuiFlexGroup justifyContent="flexEnd" gutterSize="m">
          <EuiFlexItem grow={false}>
            <EuiButtonEmpty onClick={onCancel}>Cancel</EuiButtonEmpty>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton fill={true} onClick={updatePolicy} isDisabled={!selected}>
              Confirm
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </>
    );
  }
  return null;
};

export type ButtonSelectRootDecoderProps = Omit<ButtonOpenModalProps, 'label' | 'modal'> &
  SelectRootDecoderFormProps;

export const ButtonSelectRootDecoder: React.FC<ButtonSelectRootDecoderProps> = ({
  space,
  notifications,
  buttonProps,
  policyDocumentData,
  rootDecoderSource,
  onConfirm,
  onCancel,
  type,
}) => {
  return (
    <ButtonOpenModal
      label="Select root decoder"
      type={type}
      buttonProps={buttonProps}
      modal={{
        title: `Select the root decoder for [${space}] space`,
        onConfirm: () => {},
      }}
      children={({ closeModal }) => (
        <SelectRootDecoderForm
          space={space}
          policyDocumentData={policyDocumentData}
          rootDecoderSource={rootDecoderSource}
          notifications={notifications}
          onCancel={() => {
            closeModal();
            onCancel?.();
          }}
          onConfirm={() => {
            closeModal();
            onConfirm?.();
          }}
        />
      )}
    />
  );
};
type CalloutProps = {
  check: () => void;
  rootDecoder: DecoderSource;
} & ButtonSelectRootDecoderProps;
const Callout: React.FC<CalloutProps> = ({
  space,
  policyDocumentData,
  notifications,
  check,
  rootDecoder,
}) => {
  return (
    <EuiCallOut title="Root decoder not defined in the space" color="warning" iconType="alert">
      <p>
        The promotion of the space requires a root decoder to be defined in the space. Please create
        and/or select a root decoder.
      </p>
      <ButtonSelectRootDecoder
        buttonProps={{ color: 'warning' }}
        space={space}
        policyDocumentData={policyDocumentData}
        rootDecoderSource={rootDecoder}
        notifications={notifications}
        onConfirm={check}
      />
    </EuiCallOut>
  );
};

export const withRootDecoderRequirementGuard: (Component: React.FC) => React.FC = withGuardAsync(
  async ({ space }) => {
    try {
      const response = await DataStore.policies.searchPolicies(space);

      const policyDocumentData = response.items?.[0]?.document;

      const rootDecoderId = policyDocumentData?.root_decoder;
      let rootDecoder;
      if (rootDecoderId) {
        rootDecoder = await DataStore.decoders.getDecoder(rootDecoderId, space);
      }

      return { ok: !Boolean(rootDecoder), data: { policyDocumentData, rootDecoder } };
    } catch (error) {
      return { ok: false, data: { error } };
    }
  },
  Callout
);

export const RootDecoderRequirement: React.FC<CalloutProps> = withRootDecoderRequirementGuard(
  ({ error }: { error: Error }) => {
    return error ? <EuiText color="danger">Error loading root decoder requirement</EuiText> : null;
  }
);

export const withConditionalHOC = (
  condition: (props: any) => boolean,
  hoc: (Component: React.FC) => React.FC
) => {
  return (Component: React.FC): React.FC => {
    const EnhancedComponent = hoc(Component);
    return (props) => {
      if (condition(props)) {
        return <EnhancedComponent {...props} />;
      }
      return <Component {...props} />;
    };
  };
};
