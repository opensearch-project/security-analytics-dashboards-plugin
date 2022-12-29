/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiLink,
  EuiSelect,
  EuiSelectOption,
  EuiSpacer,
  EuiText,
} from '@elastic/eui';
import moment from 'moment';
import { PeriodSchedule } from '../../models/interfaces';
import React from 'react';
import { DEFAULT_EMPTY_DATA } from './constants';
import {
  RuleItem,
  RuleItemInfo,
} from '../pages/CreateDetector/components/DefineDetector/components/DetectionRules/types/interfaces';
import { compile, TopLevelSpec } from 'vega-lite';
import { parse, View } from 'vega/build-es5/vega.js';
import { expressionInterpreter as vegaExpressionInterpreter } from 'vega-interpreter/build/vega-interpreter.module';
import { RuleInfo } from '../../server/models/interfaces';
import { NotificationsStart } from 'opensearch-dashboards/public';
import { OpenSearchService } from '../services';

export const parseStringsToOptions = (strings: string[]) => {
  return strings.map((str) => ({ id: str, label: str }));
};

export const renderTime = (time: number | string) => {
  const momentTime = moment(time);
  if (time && momentTime.isValid()) return momentTime.format('MM/DD/YY h:mm a');
  return DEFAULT_EMPTY_DATA;
};

export function createTextDetailsGroup(
  data: { label: string; content: any; url?: string }[],
  columnNum?: number
) {
  const createFormRow = (label: string, content: string, url?: string) => {
    const dataTestSubj = label.toLowerCase().replaceAll(' ', '-');
    return (
      <EuiFormRow label={<EuiText color={'subdued'}>{label}</EuiText>}>
        {url ? (
          <EuiLink data-test-subj={`text-details-group-content-${dataTestSubj}`}>
            {content ?? DEFAULT_EMPTY_DATA}
          </EuiLink>
        ) : (
          <EuiText data-test-subj={`text-details-group-content-${dataTestSubj}`}>
            {content ?? DEFAULT_EMPTY_DATA}
          </EuiText>
        )}
      </EuiFormRow>
    );
  };
  return data.length <= 1 ? (
    !data.length ? null : (
      createFormRow(data[0].label, data[0].content, data[0].url)
    )
  ) : (
    <>
      <EuiFlexGroup>
        {data.map(({ label, content, url }, index) => {
          return (
            <EuiFlexItem
              key={index}
              grow={false}
              style={{ minWidth: `${100 / (columnNum || data.length)}%` }}
            >
              {createFormRow(label, content, url)}
            </EuiFlexItem>
          );
        })}
      </EuiFlexGroup>
      <EuiSpacer size={'xl'} />
    </>
  );
}

export function parseSchedule({ period: { interval, unit } }: PeriodSchedule) {
  return `Every ${interval} ${unit.toLowerCase()}`;
}

export function translateToRuleItems(
  prePackagedRules: RuleInfo[],
  customRules: RuleInfo[],
  detectorType: string,
  isEnabled: (rule: RuleInfo) => boolean
) {
  let ruleItemInfos: RuleItemInfo[] = prePackagedRules.map((rule) => ({
    ...rule,
    enabled: isEnabled(rule),
    prePackaged: true,
  }));

  ruleItemInfos = ruleItemInfos.concat(
    customRules.map((rule) => ({
      ...rule,
      enabled: isEnabled(rule),
      prePackaged: false,
    }))
  );

  return ruleItemInfosToItems(detectorType, ruleItemInfos);
}

export function ruleItemInfosToItems(
  detectorType: string,
  ruleItemsInfo: RuleItemInfo[]
): RuleItem[] {
  if (ruleItemsInfo) {
    return ruleItemsInfo.map((itemInfo) => ({
      id: itemInfo._id,
      active: itemInfo.enabled,
      description: itemInfo._source.description,
      library: itemInfo.prePackaged ? 'Sigma' : 'Custom',
      logType: detectorType.toLowerCase(),
      name: itemInfo._source.title,
      severity: itemInfo._source.level,
      ruleInfo: itemInfo,
    }));
  }

  return [];
}

export function getUpdatedEnabledRuleIds(
  existingEnabledIds: Set<string>,
  ruleId: string,
  isActive: boolean
) {
  let newEnabledIds;
  // 1. not enabled previously
  const wasActive = existingEnabledIds.has(ruleId);
  if (wasActive && !isActive) {
    const clonedIds = new Set(existingEnabledIds);
    clonedIds.delete(ruleId);
    newEnabledIds = [...clonedIds];
  }
  // 2. enabled previously and now disabled
  else if (!wasActive && isActive) {
    const clonedIds = new Set(existingEnabledIds);
    clonedIds.add(ruleId);
    newEnabledIds = [...clonedIds];
  }

  return newEnabledIds;
}

export function renderVisualization(spec: TopLevelSpec, containerId: string) {
  let view;

  try {
    renderVegaSpec(compile({ ...spec, width: 'container', height: 400 }).spec).catch((err: Error) =>
      console.error(err)
    );
  } catch (error) {
    console.log(error);
  }

  function renderVegaSpec(spec: {}) {
    view = new View(parse(spec, null, { expr: vegaExpressionInterpreter }), {
      renderer: 'canvas', // renderer (canvas or svg)
      container: `#${containerId}`, // parent DOM container
      hover: true, // enable hover processing
    });
    return view.runAsync();
  }
}

export function createSelectComponent(
  options: EuiSelectOption[],
  value: string,
  id: string,
  onChange: React.ChangeEventHandler<HTMLSelectElement>
) {
  return (
    <EuiFlexGroup justifyContent="flexEnd" alignItems="center">
      <EuiFlexItem grow={false}>
        <EuiSelect id={id} options={options} value={value} onChange={onChange} prepend="Group by" />
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}

export const capitalizeFirstLetter = (str: string) => {
  if (!str) {
    return '';
  }

  return `${str.charAt(0).toUpperCase()}${str.slice(1).toLowerCase()}`;
};

// A helper function that shows toast messages for backend errors.
export const errorNotificationToast = (
  notifications: NotificationsStart | null,
  actionName: string,
  objectName: string,
  errorMessage: string = '',
  displayTime: number = 5000 // 5 seconds; default is 10 seconds
) => {
  const message = `Failed to ${actionName} ${objectName}:`;
  console.error(message, errorMessage);
  notifications?.toasts.addDanger({
    title: message,
    text: errorMessage,
    toastLifeTimeMs: displayTime,
  });
};

// A helper function that shows toast messages for successful actions.
export const successNotificationToast = (
  notifications: NotificationsStart | null,
  actionName: string,
  objectName: string,
  successMessage: string = '',
  displayTime: number = 5000 // 5 seconds; default is 10 seconds
) => {
  notifications?.toasts.addSuccess({
    title: `Successfully ${actionName} ${objectName}`,
    text: successMessage,
    toastLifeTimeMs: displayTime,
  });
};

export const getPlugins = async (opensearchService: OpenSearchService) => {
  try {
    const pluginsResponse = await opensearchService.getPlugins();
    if (pluginsResponse.ok) {
      return pluginsResponse.response.map((plugin) => plugin.component);
    } else {
      return [];
    }
  } catch (e) {
    return [];
  }
};
