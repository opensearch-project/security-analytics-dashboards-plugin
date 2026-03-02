/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, { useState, useEffect } from 'react';
import { EuiLink, EuiPanel } from '@elastic/eui';
import { Integration } from '../../../../types';
import { SPACE_ACTIONS, UserSpacesOrder } from '../../../../common/constants';
import { capitalize, startCase } from 'lodash';
import { Search } from '@opensearch-project/oui/src/eui_components/basic_table';
import { DEFAULT_EMPTY_DATA, integrationCategoryFilters } from '../../../utils/constants';
import { integrationLabels } from './constants';
import { actionIsAllowedOnSpace } from '../../../../common/helpers';
import { IntegrationBase, PolicyItem } from '../../../../types';

export interface IntegrationTableItem {
  id: string;
  title: string;
  description?: string;
  category: string;
  space: string;
  decoders?: string[];
  kvdbs?: string[];
  rules?: any[];
}

export const mapPolicyToIntegrationTableItems = (
  policy: PolicyItem | undefined
): IntegrationTableItem[] => {
  if (!policy) return [];

  return Object.values(policy.integrationsMap ?? {})
    .filter((source): source is IntegrationBase & { _id: string } => Boolean(source && source._id))
    .map((source) => ({
      id: source._id,
      title: source.document.title,
      description: source.document.description,
      category: source.document.category,
      space: source.space.name,
      decoders: source.document.decoders,
      kvdbs: source.document.kvdbs,
      rules: (source.document as any).rules,
    }));
};

export const hasRelatedEntity = (
  item: IntegrationTableItem,
  entity: 'rules' | 'decoders' | 'kvdbs'
): boolean => {
  return Array.isArray(item[entity]) && (item[entity] as any[]).length > 0;
};

export const getIntegrationsTableColumns = ({
  showDetails,
  setItemForAction,
}: {
  showDetails: (id: string) => void;
  setItemForAction: (options: { item: any; action: typeof SPACE_ACTIONS.DELETE } | null) => void;
}) => [
  {
    field: 'title',
    name: 'Title',
    sortable: true,
    render: (name: string, item: Integration) => {
      return <EuiLink onClick={() => showDetails(item.id)}>{getIntegrationLabel(name)}</EuiLink>;
    },
  },
  {
    field: 'description',
    name: 'Description',
    truncateText: false,
  },
  {
    field: 'category',
    name: 'Category',
    truncateText: false,
  },
  {
    field: 'space',
    name: 'Space',
    render: (spaceName: string) => capitalize(spaceName),
  },
  {
    field: 'decoders',
    name: 'Decoders',
    sortable: true,
    render: (decoders: string[]) => decoders?.length ?? 0,
  },
  {
    field: 'kvdbs',
    name: 'KVDBs',
    sortable: true,
    render: (kvdbs: string[]) => kvdbs?.length ?? 0,
  },
  {
    field: 'rules',
    name: 'Rules',
    sortable: true,
    render: (rules: any[]) => rules?.length ?? 0,
  },
  {
    name: 'Actions',
    actions: [
      {
        name: 'Details',
        description: 'Show details',
        type: 'icon',
        icon: 'inspect',
        onClick: (item) => {
          showDetails(item.id);
        },
      },
      {
        name: 'Remove',
        description: 'Remove integration',
        type: 'icon',
        icon: 'trash',
        color: 'danger',
        available: (item) => actionIsAllowedOnSpace(item.space, SPACE_ACTIONS.DELETE),
        onClick: (item) => {
          setItemForAction({ item, action: SPACE_ACTIONS.DELETE });
        },
      },
    ],
  },
];

export const getIntegrationsTableSearchConfig = (): Search => {
  return {
    box: {
      placeholder: 'Search integrations',
      schema: true,
      compressed: true,
    },
    filters: [
      {
        type: 'field_value_selection',
        field: 'category',
        name: 'Category',
        compressed: true,
        multiSelect: 'or',
        options: integrationCategoryFilters.map((category) => ({
          value: category,
        })),
      },
    ],
  };
};

export const getIntegrationLabel = (name: string) => {
  return !name ? DEFAULT_EMPTY_DATA : integrationLabels[name.toLowerCase()] || startCase(name);
};

export const withGuardAsync = (
  condition: (props: any) => Promise<{ ok: boolean; data: any }>,
  ComponentFulfillsCondition: React.FC,
  ComponentLoadingResolution: null | React.FC = null,
  options: { rerunOn?: (props) => any[] }
) => (WrappedComponent: React.FC) => (props: any) => {
  const [loading, setLoading] = useState(true);
  const [fulfillsCondition, setFulfillsCondition] = useState({
    ok: false,
    data: {},
  });

  const execCondition = async () => {
    try {
      setLoading(true);
      setFulfillsCondition({ ok: false, data: {} });
      setFulfillsCondition(await condition({ ...props, check: execCondition }));
    } catch (error) {
      setFulfillsCondition({ ok: false, data: { error } });
    } finally {
      setLoading(false);
    }
  };

  const dependenciesRun = options?.rerunOn ? options.rerunOn(props) : [];

  useEffect(() => {
    execCondition();
  }, dependenciesRun);

  if (loading) {
    return ComponentLoadingResolution ? <ComponentLoadingResolution {...props} /> : null;
  }

  return fulfillsCondition.ok ? (
    <ComponentFulfillsCondition
      {...props}
      {...(fulfillsCondition?.data ?? {})}
      check={execCondition}
    />
  ) : (
    <WrappedComponent {...props} {...(fulfillsCondition?.data ?? {})} check={execCondition} />
  );
};

export const withGuard = (
  condition: (props: any) => boolean,
  ComponentFulfillsCondition: React.FC
) => (WrappedComponent: React.FC) => (props: any) => {
  return condition(props) ? (
    <ComponentFulfillsCondition {...props} />
  ) : (
    <WrappedComponent {...props} />
  );
};

export const withWrapComponent = (WrapComponent, mapWrapComponentProps = () => {}) => (
  WrappedComponent
) => (props) => (
  <WrapComponent {...props} {...(mapWrapComponentProps ? mapWrapComponentProps(props) : {})}>
    <WrappedComponent {...props}></WrappedComponent>
  </WrapComponent>
);

export const withModal = (options) =>
  withWrapComponent(
    ({
      paddingSize,
      hasShadow,
      hasBorder,
      borderRadius,
      grow,
      panelRef,
      color,
      className,
      'aria-label': ariaLabel,
      'data-test-subj': dataTestSubject,
      children,
    }) => {
      const panelProps = {
        paddingSize,
        hasShadow,
        hasBorder,
        borderRadius,
        grow,
        panelRef,
        color,
        className,
        'aria-label': ariaLabel,
        'data-test-subj': dataTestSubject,
        children,
      };
      return <EuiPanel {...panelProps}>{children}</EuiPanel>;
    },
    () => options
  );

export const getNextSpace = (space: string) => {
  const currentIndex = UserSpacesOrder.indexOf(space);
  if (currentIndex === -1 || currentIndex === UserSpacesOrder.length - 1) {
    return null; // No next space available
  }
  return UserSpacesOrder[currentIndex + 1];
};

type useAsyncActionRunOnStartDependenciesReturns<T> = {
  data: T | null;
  error: Error | null;
  running: boolean;
  run: () => Promise<void>;
};
type useAsyncActionRunOnStartAction<T> = (
  dependencies: any[],
  state: {
    data: useAsyncActionRunOnStartDependenciesReturns<T>['data'];
    error: useAsyncActionRunOnStartDependenciesReturns<T>['error'];
    running: useAsyncActionRunOnStartDependenciesReturns<T>['running'];
  }
) => Promise<T>;
type useAsyncActionRunOnStartDependencies = any[];

export function useAsyncActionRunOnStart<T>(
  action: useAsyncActionRunOnStartAction<T>,
  dependencies: useAsyncActionRunOnStartDependencies = [],
  { refreshDataOnPreRun }: { refreshDataOnPreRun: boolean } = { refreshDataOnPreRun: true }
): useAsyncActionRunOnStartDependenciesReturns<T> {
  const [running, setRunning] = useState(true);
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const run = async () => {
    try {
      setRunning(true);
      setError(null);
      if (refreshDataOnPreRun) {
        setData(null);
      }
      const result = await action(dependencies, { data, error, running });
      setData(result);
    } catch (error) {
      setError(error as Error);
    } finally {
      setRunning(false);
    }
  };

  useEffect(() => {
    run();
  }, [...dependencies]);

  return { data, error, run, running };
}
