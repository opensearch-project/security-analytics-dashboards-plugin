/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiCompressedFormRow,
  EuiLink,
  EuiCompressedSelect,
  EuiSelectOption,
  EuiSpacer,
  EuiText,
  EuiBadge,
  euiPaletteColorBlind,
} from '@elastic/eui';
import moment from 'moment';
import { PeriodSchedule } from '../../models/interfaces';
import React from 'react';
import {
  ALERT_SEVERITY_OPTIONS,
  ALERT_SEVERITY_PROPS,
  BREADCRUMBS,
  DEFAULT_EMPTY_DATA,
  defaultColorForVisualizations,
  logTypeCategories,
  logTypeCategoryDescription,
  logTypesByCategories,
  scheduleUnitText,
} from './constants';
import {
  RuleItem,
  RuleItemInfo,
} from '../pages/CreateDetector/components/DefineDetector/components/DetectionRules/types/interfaces';
import { RuleInfo } from '../../server/models/interfaces';
import {
  ChromeBreadcrumb,
  CoreStart,
  NotificationsStart,
  SavedObject,
} from 'opensearch-dashboards/public';
import {
  AlertsService,
  FieldMappingService,
  IndexPatternsService,
  IndexService,
  LogTypeService,
  NotificationsService,
  OpenSearchService,
} from '../services';
import { ruleSeverity, ruleTypes } from '../pages/Rules/utils/constants';
import _ from 'lodash';
import { AlertCondition, DateTimeFilter, Duration, LogType } from '../../types';
import { DataStore } from '../store/DataStore';
import { LogCategoryOptionView } from '../components/Utility/LogCategoryOption';
import { getLogTypeLabel } from '../pages/LogTypes/utils/helpers';
import { euiThemeVars } from '@osd/ui-shared-deps/theme';
import dateMath from '@elastic/datemath';
import { IocLabel, ThreatIntelIocType } from '../../common/constants';
import { parse, View } from 'vega/build-es5/vega.js';
import { compile } from 'vega-lite';
import { Handler } from 'vega-tooltip';
import { expressionInterpreter as vegaExpressionInterpreter } from 'vega-interpreter/build/vega-interpreter';
import {
  getBreadCrumbsSetter,
  getBrowserServices,
  getContentManagement,
  getUseUpdatedUx,
  setBrowserServices,
  getDataSourceManagementPlugin,
} from '../services/utils/constants';
import DetectorsService from '../services/DetectorService';
import CorrelationService from '../services/CorrelationService';
import FindingsService from '../services/FindingsService';
import RuleService from '../services/RuleService';
import SavedObjectService from '../services/SavedObjectService';
import MetricsService from '../services/MetricsService';
import ThreatIntelService from '../services/ThreatIntelService';
import { BrowserServices } from '../models/interfaces';
import { IndexPatternsService as CoreIndexPatternsService } from '../../../../src/plugins/data/common/index_patterns';
import semver from 'semver';
import * as pluginManifest from '../../opensearch_dashboards.json';
import { DataSourceThreatAlertsCard } from '../components/DataSourceThreatAlertsCard/DataSourceThreatAlertsCard';
import { DataSourceAttributes } from '../../../../src/plugins/data_source/common/data_sources';

export const parseStringsToOptions = (strings: string[]) => {
  return strings.map((str) => ({ id: str, label: str }));
};

export const renderTime = (time: number | string) => {
  const momentTime = moment(time);
  if (time && momentTime.isValid()) return momentTime.format('MM/DD/YY h:mm a');
  return DEFAULT_EMPTY_DATA;
};

export function createTextDetailsGroup(
  data: { label: string; content: any; url?: string; target?: string }[]
) {
  const createFormRow = (
    label: string,
    content: string,
    url?: string,
    target: string = '_self'
  ) => {
    const dataTestSubj = label.toLowerCase().replace(/ /g, '-');
    return (
      <EuiCompressedFormRow fullWidth label={label}>
        {url ? (
          <EuiLink
            href={url}
            data-test-subj={`text-details-group-content-${dataTestSubj}`}
            target={target}
          >
            {content ?? DEFAULT_EMPTY_DATA}
          </EuiLink>
        ) : (
          <EuiText data-test-subj={`text-details-group-content-${dataTestSubj}`} size="s">
            {content ?? DEFAULT_EMPTY_DATA}
          </EuiText>
        )}
      </EuiCompressedFormRow>
    );
  };
  return data.length <= 1 ? (
    !data.length ? null : (
      <>
        {createFormRow(data[0].label, data[0].content, data[0].url, data[0].target)}
        <EuiSpacer size={'l'} />
      </>
    )
  ) : (
    <>
      <EuiFlexGroup className={'detailsFormRow'}>
        {data.map(({ label, content, url, target }, index) => {
          return (
            <EuiFlexItem key={index} grow={true}>
              {createFormRow(label, content, url, target)}
            </EuiFlexItem>
          );
        })}
      </EuiFlexGroup>
      <EuiSpacer size={'l'} />
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

export async function renderVisualization(spec: any, containerId: string) {
  let view;

  try {
    setDefaultColors(spec);
    renderVegaSpec(compile({ ...spec, width: 'container', height: 400 }).spec).catch((err: Error) =>
      console.error(err)
    );
  } catch (error) {
    console.error(error);
  }

  async function renderVegaSpec(spec: {}) {
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
    view = new View(parse(spec, undefined, { expr: vegaExpressionInterpreter } as any), {
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
        <EuiCompressedSelect
          id={id}
          options={options}
          value={value}
          onChange={onChange}
          prepend="Group by"
        />
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
    (ruleType) => ruleType.value.toLowerCase() === matchingRuleType.toLowerCase()
  );

  if (logType) {
    return `${logType.category}: ${getLogTypeLabel(logType.value)}`;
  }

  return DEFAULT_EMPTY_DATA;
};

export const getSeverityBadge = (severity: string) => {
  const severityLevel = ruleSeverity.find((sev) => sev.value === severity);
  return (
    <EuiBadge color={severityLevel?.color.background} style={{ color: severityLevel?.color.text }}>
      {severityLevel?.name || DEFAULT_EMPTY_DATA}
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
            {getLogTypeLabel(logTypes[i].label)}
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

/**
 * Removes the given detectionType from the list of types inside the given trigger
 * and returns the new list of detectionTypes
 */
export function removeDetectionType(
  trigger: AlertCondition,
  detectionType: 'rules' | 'threat_intel'
): string[] {
  const detectionTypes = new Set(trigger.detection_types);
  detectionTypes.delete(detectionType);
  return Array.from(detectionTypes);
}

/**
 * Add the given detectionType to the list of types inside the given trigger
 * and returns the new list of detectionTypes
 */
export function addDetectionType(
  trigger: AlertCondition,
  detectionType: 'rules' | 'threat_intel'
): string[] {
  const detectionTypes = new Set(trigger.detection_types);
  detectionTypes.add(detectionType);
  return Array.from(detectionTypes);
}

export function isThreatIntelQuery(queryId: string) {
  return queryId?.startsWith('threat_intel_');
}

export async function getDataSources(
  indexService: IndexService,
  notifications: any
): Promise<
  | {
      ok: true;
      dataSources: { label: string; options: { label: string; value: string; index?: string }[] }[];
    }
  | { ok: false; error: string }
> {
  const dataSourceOptions = [];
  try {
    const aliasesResponse = await indexService.getAliases();
    const indicesResponse = await indexService.getIndices();

    if (aliasesResponse.ok) {
      const aliases = aliasesResponse.response.aliases.filter(
        ({ index }) => !index.startsWith('.')
      );
      const aliasOptions = aliases.map(({ alias, index }) => ({
        label: alias,
        index: index,
        value: alias,
      }));

      dataSourceOptions.push({
        label: 'Aliases',
        options: aliasOptions,
      });
    } else {
      errorNotificationToast(notifications, 'retrieve', 'aliases', aliasesResponse.error);
      return { ok: false, error: aliasesResponse.error };
    }

    if (indicesResponse.ok) {
      const indices = indicesResponse.response.indices;
      const indexOptions = indices
        .map(({ index }) => ({ label: index, value: index }))
        .filter(({ label }) => !label.startsWith('.'));

      dataSourceOptions.push({
        label: 'Indices',
        options: indexOptions,
      });
    } else {
      errorNotificationToast(notifications, 'retrieve', 'indices', indicesResponse.error);

      return { ok: false, error: indicesResponse.error };
    }

    return {
      ok: true,
      dataSources: dataSourceOptions,
    };
  } catch (error: any) {
    errorNotificationToast(notifications, 'retrieve', 'indices', error);

    return {
      ok: false,
      error,
    };
  }
}

/**
 * Sets default colors in the vega-lite spec unless individual spec provides them.
 */
function setDefaultColors(spec: any) {
  const setValue = getValueSetter(spec.config);

  // Default category coloring to the OpenSearch color scheme
  setValue(euiPaletteColorBlind(), 'range', 'category');

  // Vega-Lite: set default color, works for fill and strike --  config: { mark:  { color: '#54B399' }}
  setValue(defaultColorForVisualizations, 'mark', 'color');
  // By default text marks should use theme-aware text color
  setValue(euiThemeVars.euiTextColor, 'text', 'fill');

  // provide right colors for light and dark themes
  setValue(euiThemeVars.euiColorDarkestShade, 'title', 'color');
  setValue(euiThemeVars.euiColorDarkShade, 'style', 'guide-label', 'fill');
  setValue(euiThemeVars.euiColorDarkestShade, 'style', 'guide-title', 'fill');
  setValue(euiThemeVars.euiColorDarkestShade, 'style', 'group-title', 'fill');
  setValue(euiThemeVars.euiColorDarkestShade, 'style', 'group-subtitle', 'fill');
  setValue(euiThemeVars.euiColorChartLines, 'axis', 'tickColor');
  setValue(euiThemeVars.euiColorChartLines, 'axis', 'domainColor');
  setValue(euiThemeVars.euiColorChartLines, 'axis', 'gridColor');
  setValue('transparent', 'background');
  setValue(euiThemeVars.euiColorDarkestShade, 'legend', 'titleColor');
  setValue(euiThemeVars.euiColorDarkShade, 'legend', 'labelColor');
}

/**
 * Returns a function that sets value if it doesn't exist.
 */
function getValueSetter(baseObject: any) {
  // Given an object, and an array of fields, ensure that obj.fld1.fld2. ... .fldN is set to value if it doesn't exist.
  return function (value: unknown, ...fields: string[]) {
    let o = baseObject;
    for (let i = 0; i < fields.length - 1; i++) {
      const field = fields[i];
      const subObj = o[field];
      if (subObj === undefined) {
        o[field] = {};
      } else if (!_.isPlainObject(subObj)) {
        return;
      }
      o = o[field];
    }
    const lastField = fields[fields.length - 1];
    if (o[lastField] === undefined) {
      o[lastField] = value;
    }
  };
}

export function getDuration({ startTime, endTime }: DateTimeFilter): Duration {
  const startMoment = dateMath.parse(startTime)!;
  const endMoment = dateMath.parse(endTime)!;

  return {
    startTime: startMoment.valueOf(),
    endTime: endMoment.valueOf(),
  };
}

let isNotificationPluginInstalled = false;
export function setIsNotificationPluginInstalled(isInstalled: boolean) {
  isNotificationPluginInstalled = isInstalled;
}

export function getIsNotificationPluginInstalled(): boolean {
  return isNotificationPluginInstalled;
}

export async function getFieldsForIndex(
  fieldMappingService: FieldMappingService,
  indexName: string
): Promise<{ label: string; value: string }[]> {
  let fields: {
    label: string;
    value: string;
  }[] = [];

  if (indexName) {
    const result = await fieldMappingService.getIndexAliasFields(indexName);
    if (result?.ok) {
      fields = result.response?.map((field) => ({
        label: field,
        value: field,
      }));
    }

    return fields;
  }

  return fields;
}

export function renderIoCType(iocType: ThreatIntelIocType) {
  return IocLabel[iocType] || DEFAULT_EMPTY_DATA;
}

export function setBreadcrumbs(crumbs: ChromeBreadcrumb[]) {
  getBreadCrumbsSetter()(getUseUpdatedUx() ? crumbs : [BREADCRUMBS.SECURITY_ANALYTICS, ...crumbs]);
}

export function dataSourceFilterFn(dataSource: SavedObject<DataSourceAttributes>) {
  const dataSourceVersion = dataSource?.attributes?.dataSourceVersion || '';
  const installedPlugins = dataSource?.attributes?.installedPlugins || [];
  return (
    semver.satisfies(dataSourceVersion, pluginManifest.supportedOSDataSourceVersions) &&
    pluginManifest.requiredOSDataSourcePlugins.every((plugin) => installedPlugins.includes(plugin))
  );
}

export function getSeverityText(severity: string) {
  return _.get(_.find(ALERT_SEVERITY_OPTIONS, { value: severity }), 'text');
}

export function getBadgeText(severity: string) {
  return ALERT_SEVERITY_PROPS[severity]?.badgeLabel || DEFAULT_EMPTY_DATA;
}

export function getAlertSeverityColor(severity: string) {
  return ALERT_SEVERITY_PROPS[severity]?.color || { background: 'white', text: 'black' };
}

export function getAlertSeverityBadge(severity: string) {
  const severityColor = getAlertSeverityColor(severity);
  return (
    <EuiBadge
      color={severityColor.background}
      style={{ padding: '1px 5px', color: severityColor.text }}
    >
      {getBadgeText(severity)}
    </EuiBadge>
  );
}

export const getTruncatedText = (text: string, textLength: number = 14) => {
  return `${text.slice(0, textLength)}${text.length > textLength ? '...' : ''}`;
};

export function registerThreatAlertsCard() {
  getContentManagement().registerContentProvider({
    id: `analytics_all_recent_threat_alerts_card_content`,
    getTargetArea: () => 'all_overview/service_cards',
    getContent: () => ({
      id: 'analytics_all_recent_threat_alerts_card',
      kind: 'custom',
      order: 20,
      render: () => (
        <DataSourceThreatAlertsCard
          getDataSourceMenu={getDataSourceManagementPlugin()?.ui.getDataSourceMenu}
          detectorService={getBrowserServices().detectorsService}
        />
      ),
    }),
  });
}

export function initializeServices(coreStart: CoreStart, indexPattern: CoreIndexPatternsService) {
  const { http, savedObjects } = coreStart;

  const detectorsService = new DetectorsService(http);
  const correlationsService = new CorrelationService(http);
  const indexService = new IndexService(http);
  const findingsService = new FindingsService(http, coreStart.notifications);
  const opensearchService = new OpenSearchService(http, savedObjects.client);
  const fieldMappingService = new FieldMappingService(http);
  const alertsService = new AlertsService(http, coreStart.notifications);
  const ruleService = new RuleService(http);
  const notificationsService = new NotificationsService(http);
  const savedObjectsService = new SavedObjectService(savedObjects.client, indexService);
  const indexPatternsService = new IndexPatternsService(indexPattern);
  const logTypeService = new LogTypeService(http);
  const metricsService = new MetricsService(http);
  const threatIntelService = new ThreatIntelService(http, coreStart.notifications);

  const services: BrowserServices = {
    detectorsService,
    correlationsService,
    indexService,
    fieldMappingService,
    findingsService,
    opensearchService,
    ruleService,
    alertService: alertsService,
    notificationsService,
    savedObjectsService,
    indexPatternsService,
    logTypeService,
    metricsService,
    threatIntelService,
  };
  setBrowserServices(services);
  DataStore.init(services, coreStart.notifications);
}
