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
  EuiBadge,
} from '@elastic/eui';
import moment from 'moment';
import { PeriodSchedule } from '../../models/interfaces';
import React from 'react';
import {
  DEFAULT_EMPTY_DATA,
  logTypeCategories,
  logTypeCategoryDescription,
  logTypesByCategories,
  scheduleUnitText,
} from './constants';
import {
  RuleItem,
  RuleItemInfo,
} from '../pages/CreateDetector/components/DefineDetector/components/DetectionRules/types/interfaces';
import { compile, TopLevelSpec } from 'vega-lite';
import { parse, View } from 'vega/build-es5/vega.js';
import { expressionInterpreter as vegaExpressionInterpreter } from 'vega-interpreter/build/vega-interpreter';
import { RuleInfo } from '../../server/models/interfaces';
import { NotificationsStart } from 'opensearch-dashboards/public';
import { OpenSearchService } from '../services';
import { ruleSeverity, ruleTypes } from '../pages/Rules/utils/constants';
import { Handler } from 'vega-tooltip';
import _ from 'lodash';
import { LogType } from '../../types';
import { DataStore } from '../store/DataStore';
import { LogCategoryOptionView } from '../components/Utility/LogCategoryOption';
import { getLogTypeLabel } from '../pages/LogTypes/utils/helpers';

export const parseStringsToOptions = (strings: string[]) => {
  return strings.map((str) => ({ id: str, label: str }));
};

export const renderTime = (time: number | string) => {
  const momentTime = moment(time);
  if (time && momentTime.isValid()) return momentTime.format('MM/DD/YY h:mm a');
  return DEFAULT_EMPTY_DATA;
};

export function createTextDetailsGroup(data: { label: string; content: any; url?: string }[]) {
  const createFormRow = (label: string, content: string, url?: string) => {
    const dataTestSubj = label.toLowerCase().replace(/ /g, '-');
    return (
      <EuiFormRow fullWidth label={<EuiText color={'subdued'}>{label}</EuiText>}>
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
      <EuiFlexGroup className={'detailsFormRow'}>
        {data.map(({ label, content, url }, index) => {
          return (
            <EuiFlexItem key={index} grow={true}>
              {createFormRow(label, content, url)}
            </EuiFlexItem>
          );
        })}
      </EuiFlexGroup>
      <EuiSpacer size={'xl'} />
    </>
  );
}

export const pluralize = (count: number, singular: string, plural = singular + 's') => {
  return [1, -1].includes(Number(count)) ? singular : plural;
};

export function parseSchedule({ period: { interval, unit } }: PeriodSchedule) {
  return `Every ${interval} ${pluralize(interval, scheduleUnitText[unit])}`;
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
      library: itemInfo.prePackaged ? 'Standard' : 'Custom',
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
    console.error(error);
  }

  function renderVegaSpec(spec: {}) {
    let chartColoredItems: any[] = [];
    const handler = new Handler({
      formatTooltip: (value, sanitize) => {
        let tooltipData = { ...value };
        let values = Object.entries(tooltipData);
        if (!values.length) return '';
        const tooltipItem = chartColoredItems.filter((groupItem: any) =>
          _.isEqual(groupItem.tooltip, tooltipData)
        );
        const color = tooltipItem.length
          ? tooltipItem[0].fill || tooltipItem[0].stroke
          : 'transparent';

        const firstItem = values.pop() || ['', ''];

        let rowData = '';
        values.forEach((item: any) => {
          rowData += `
            <tr>
              <td>${sanitize(item[0])}</td>
              <td>${sanitize(item[1])}</td>
            </tr>
          `;
        });

        return `
          <div class="vg-tooltip-innerContainer">
            <div class="vg-tooltip-header">
              <table>
                <tr>
                  <td><div class="vg-tooltip-color" style="background-color: ${color}"></div></td>
                  <td>${sanitize(firstItem[0])}</td>
                  <td>${sanitize(firstItem[1])}</td>
                </tr>
              </table>
            </div>
            <div class="vg-tooltip-body">
             <table>${rowData}</table>
            </div>
          </div>
        `;
      },
    });
    view = new View(parse(spec, null, { expr: vegaExpressionInterpreter }), {
      renderer: 'canvas', // renderer (canvas or svg)
      container: `#${containerId}`, // parent DOM container
      hover: true, // enable hover processing
    });
    view.tooltip(handler.call);
    return view.runAsync().then((view: any) => {
      const items = view.scenegraph().root.items[0].items || [];
      const groups = items.filter(
        (item: any) => item.name && item.name.match(/^(layer_).*(_marks)$/)
      );
      for (let item of groups) {
        chartColoredItems = chartColoredItems.concat(item.items);
      }
    });
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

export const formatRuleType = (matchingRuleType: string) => {
  const logType = ruleTypes.find(
    (ruleType) => ruleType.label.toLowerCase() === matchingRuleType.toLowerCase()
  );

  if (logType) {
    return `${logType.category}: ${_.capitalize(logType.label)}`;
  }

  return DEFAULT_EMPTY_DATA;
};

export const getSeverityBadge = (severity: string) => {
  const severityLevel = ruleSeverity.find((sev) => sev.value === severity);
  return (
    <EuiBadge color={severityLevel?.color.background} style={{ color: severityLevel?.color.text }}>
      {severity || DEFAULT_EMPTY_DATA}
    </EuiBadge>
  );
};

export function formatToLogTypeOptions(logTypesByCategories: { [category: string]: LogType[] }) {
  return logTypeCategories.map((category) => {
    const logTypes = logTypesByCategories[category];
    return {
      label: category,
      value: category,
      options: logTypes
        .map(({ name }) => ({
          label: getLogTypeLabel(name),
          value: name.toLowerCase(),
        }))
        .sort((a, b) => (a.label < b.label ? -1 : a.label > b.label ? 1 : 0)),
    };
  });
}

export async function getLogTypeOptions() {
  await DataStore.logTypes.getLogTypes();
  return formatToLogTypeOptions(logTypesByCategories);
}

export function getLogTypeFilterOptions() {
  const options: any[] = [];
  formatToLogTypeOptions(logTypesByCategories).forEach((categoryData) => {
    const categoryName = categoryData.label;
    const logTypes = categoryData.options;

    for (let i = 0; i < logTypes.length; i++) {
      if (i === 0) {
        options.push({
          value: logTypes.map((logType) => logType.value).join(' or '),
          view: <LogCategoryOptionView categoryName={categoryName} />,
        });
      }

      options.push({
        value: logTypes[i].value,
        view: (
          <span className="euiFlexItem euiFilterSelectItem__content" style={{ paddingLeft: 20 }}>
            {_.capitalize(logTypes[i].label)}
          </span>
        ),
      });
    }
  });

  return options;
}

export function getLogTypeCategoryOptions(): any[] {
  return logTypeCategoryDescription.map(({ name, description }) => ({
    value: name,
    inputDisplay: name,
    dropdownDisplay: (
      <>
        <strong>{name}</strong>
        <EuiText size="s" color="subdued">
          <p className="ouiTextColor--subdued">{description}</p>
        </EuiText>
      </>
    ),
  }));
}
