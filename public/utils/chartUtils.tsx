/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { euiPaletteColorBlind, euiPaletteForStatus } from '@elastic/eui';
import {
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  Legend,
  LinearScale,
  TimeScale,
  Title,
  Tooltip,
  LineElement,
  PointElement,
  LineController,
  ArcElement,
  DoughnutController,
} from 'chart.js';
import datemath from '@elastic/datemath';
import moment from 'moment';
import 'chartjs-adapter-moment';
import { DEFAULT_DATE_RANGE, FindingTabId } from './constants';
import { alertsGroupByOptions } from '../pages/Alerts/containers/Alerts/Alerts';
import { groupByOptionsByTabId } from '../pages/Findings/containers/Findings/Findings';
import { summaryGroupByOptions } from '../pages/Overview/utils/constants';

export const createBarChartWrapper = (
  data: any[],
  groupBy: string,
  container: string = 'myBarChart',
  dateTimeFilter = {
    startTime: DEFAULT_DATE_RANGE.start,
    endTime: DEFAULT_DATE_RANGE.end,
  }
) => {
  try {
    createBarChart(data, groupBy, container, dateTimeFilter);
  } catch (e) {
    console.error(`Error while compiling bar chart ${container}`, e);
    return <>{/*TODO: hurneyt Error panel of some kind*/}</>;
  }
};

const createBarChart = (
  data: any[],
  groupBy: string,
  container: string = 'myBarChart',
  dateTimeFilter = {
    startTime: DEFAULT_DATE_RANGE.start,
    endTime: DEFAULT_DATE_RANGE.end,
  }
) => {
  // Register the required components
  Chart.register(
    CategoryScale,
    LinearScale,
    BarController,
    BarElement,
    Title,
    Tooltip,
    Legend,
    TimeScale
  );

  const groupByOption = getGroupByText(groupBy);

  const defaultColorPalette = euiPaletteColorBlind();
  const severityColorPalette = euiPaletteForStatus(5);

  // Calculate the time difference in milliseconds
  const start = datemath.parse(dateTimeFilter.startTime)!;
  const end = datemath.parse(dateTimeFilter.endTime)!;
  const diffInHours = end?.diff(start, 'hour') || 0;

  // Determine the appropriate time unit and format based on the range
  let timeUnit: 'hour' | 'day' | 'week' | 'month';
  let displayFormat: string;
  let tickLimit: number;
  let stepSize: number;

  if (diffInHours <= 24) {
    // Last 24 hours - show hourly ticks
    timeUnit = 'hour';
    displayFormat = 'HH:mm';
    tickLimit = 24;
    stepSize = 1; // Show every hour
  } else if (diffInHours <= 72) {
    // Last 3 days - show every 3 hours
    timeUnit = 'hour';
    displayFormat = 'MMM D HH:mm';
    tickLimit = 24;
    stepSize = 3; // Show every 3 hours
  } else if (diffInHours <= 168) {
    // Last week - show daily ticks
    timeUnit = 'day';
    displayFormat = 'MMM D';
    tickLimit = 7;
    stepSize = 6; // Show every 6 hours
  } else {
    // More than a week - show weekly ticks
    timeUnit = 'week';
    displayFormat = 'MMM D';
    tickLimit = 10;
    stepSize = 12; // Show every 12 hours
  }
  // Destroy existing chart if it exists
  const existingChart = Chart.getChart(container);
  if (existingChart) {
    existingChart.destroy();
  }

  // Group data by the selected field
  const uniqueGroups = [...new Set(data.map((item) => (item as any)[groupBy]))];

  // Group data by time periods
  const timeLabels = [...new Set(data.map((item) => item.time))]
    .sort((a, b) => a - b)
    .map((time) => new Date(time).toLocaleString());

  // Create datasets for each group
  const datasets = uniqueGroups.map((group, idx) => {
    const color = groupBy.includes('severity')
      ? severityColorPalette[idx % severityColorPalette.length]
      : defaultColorPalette[idx % defaultColorPalette.length];

    const counts: Record<number, number> = {};
    return {
      label: group,
      data: data
        .filter((item: any) => item[groupBy] === group)
        .map((item) => {
          counts[item.time] = (counts[item.time] || 0) + 1;
          return {
            x: moment(item.time).toDate(), // Convert to JavaScript Date object
            y: counts[item.time],
          };
        }),
      backgroundColor: color,
      borderColor: color,
      borderWidth: 1,
    };
  });

  const ctx = document.getElementById(container) as HTMLCanvasElement;
  if (!ctx) {
    return;
  }

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: timeLabels,
      datasets: datasets,
    },
    options: {
      responsive: true,
      scales: {
        x: {
          type: 'time',
          time: {
            unit: timeUnit, // or 'hour', 'day', etc.
            displayFormats: {
              minute: 'HH:mm',
              hour: 'HH:mm',
              day: 'MMM d',
              week: 'MMM d',
              month: 'MMM yyyy',
              quarter: 'MMM yyyy',
              year: 'yyyy',
            },
          },
          bounds: 'ticks',
          offset: true,
          ticks: {
            source: 'auto',
            autoSkip: true,
            maxRotation: 45,
            maxTicksLimit: tickLimit, // Adjust this to show more/fewer labels
            stepSize: stepSize,
            major: {
              enabled: true,
            },
            callback: function (value) {
              // Format the tick label
              return moment(value).format(displayFormat);
            },
          },
          min: start.valueOf(), // Add start time
          max: end.valueOf(), // Add end time
          stacked: true,
          title: {
            display: true,
            text: 'Time',
          },
        },
        y: {
          stacked: true,
          beginAtZero: true,
          title: {
            display: true,
            text: 'Count',
          },
          ticks: {
            stepSize: 1,
            precision: 0, // This prevents decimal places
          },
        },
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function (context: any) {
              const label = context.dataset.label || '';
              const value = context.parsed.y;
              const timeLabel = context.label;
              return `${groupByOption.text}: ${label}
  Count: ${value}
  Time: ${timeLabel}`;
            },
          },
        },
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: `Grouped by ${groupByOption.text}`,
        },
      },
    },
  });
};

export const createBarAndLineChartWrapper = (
  alertData: any[],
  findingData: any[],
  groupBy: string,
  container: string = 'myBarAndLineChart',
  dateTimeFilter = {
    startTime: DEFAULT_DATE_RANGE.start,
    endTime: DEFAULT_DATE_RANGE.end,
  }
) => {
  try {
    createBarAndLineChart(alertData, findingData, groupBy, container, dateTimeFilter);
  } catch (e) {
    console.error(`Error while compiling bar/line chart ${container}`, e);
    return <>{/*TODO: hurneyt Error panel of some kind*/}</>;
  }
};

const createBarAndLineChart = (
  alertData: any[],
  findingData: any[],
  groupBy: string,
  container: string = 'myChart',
  dateTimeFilter = {
    startTime: DEFAULT_DATE_RANGE.start,
    endTime: DEFAULT_DATE_RANGE.end,
  }
) => {
  // Register the required components
  Chart.register(
    CategoryScale,
    LinearScale,
    BarController,
    BarElement,
    Title,
    Tooltip,
    Legend,
    TimeScale,
    LineElement,
    PointElement,
    LineController
  );

  const groupByOption = getGroupByText(groupBy);

  const defaultColorPalette = euiPaletteColorBlind();
  const severityColorPalette = euiPaletteForStatus(5);

  // Calculate the time difference in milliseconds
  const start = datemath.parse(dateTimeFilter.startTime)!;
  const end = datemath.parse(dateTimeFilter.endTime)!;
  const diffInHours = end?.diff(start, 'hour') || 0;

  // Determine the appropriate time unit and format based on the range
  let timeUnit: 'hour' | 'day' | 'week' | 'month';
  let displayFormat: string;
  let tickLimit: number;
  let stepSize: number;

  if (diffInHours <= 24) {
    // Last 24 hours - show hourly ticks
    timeUnit = 'hour';
    displayFormat = 'HH:mm';
    tickLimit = 24;
    stepSize = 1; // Show every hour
  } else if (diffInHours <= 72) {
    // Last 3 days - show every 3 hours
    timeUnit = 'hour';
    displayFormat = 'MMM D HH:mm';
    tickLimit = 24;
    stepSize = 3; // Show every 3 hours
  } else if (diffInHours <= 168) {
    // Last week - show daily ticks
    timeUnit = 'day';
    displayFormat = 'MMM D';
    tickLimit = 7;
    stepSize = 6; // Show every 6 hours
  } else {
    // More than a week - show weekly ticks
    timeUnit = 'week';
    displayFormat = 'MMM D';
    tickLimit = 10;
    stepSize = 12; // Show every 12 hours
  }
  // Destroy existing chart if it exists
  const existingChart = Chart.getChart(container);
  if (existingChart) {
    existingChart.destroy();
  }

  // Group data by the selected field
  const uniqueGroups =
    groupBy === 'logType'
      ? [...new Set(findingData.map((item) => (item as any)[groupBy]))]
      : ['All findings'];

  // Group data by time periods
  const timeLabels = [...new Set(findingData.map((item) => item.time))]
    .sort((a, b) => a - b)
    .map((time) => new Date(time).toLocaleString());

  // Create datasets for each group
  const datasets = uniqueGroups.map((group, idx) => {
    const color = groupBy.includes('severity')
      ? severityColorPalette[idx % severityColorPalette.length]
      : defaultColorPalette[idx % defaultColorPalette.length];

    const counts: Record<number, number> = {};
    return {
      type: 'bar',
      order: 2,
      label: group,
      data: findingData
        // Overview page only supports grouping by logType, otherwise all findings should be mapped
        .filter((item: any) => groupBy !== 'logType' || item[groupBy] === group)
        .map((item) => {
          counts[item.time] = (counts[item.time] || 0) + 1;
          return {
            x: moment(item.time).toDate(), // Convert to JavaScript Date object
            y: counts[item.time],
          };
        }),
      backgroundColor: color,
      borderColor: color,
      borderWidth: 1,
    };
  });

  const alertCounts: Record<number, number> = {};
  alertData.forEach((item) => {
    alertCounts[item.time] = (alertCounts[item.time] || 0) + 1;
  });
  const transData = Object.entries(alertCounts).map(([time, count]) => {
    return {
      x: moment(time).toDate(), // Convert to JavaScript Date object
      y: count,
    };
  });
  console.info(`hurneyt transData =`, transData);
  const alertsDataset = {
    type: 'line',
    order: 1,
    label: 'Alerts',
    data: transData,
    backgroundColor: 'warning',
    borderColor: 'warning',
    borderWidth: 1,
  };

  const ctx = document.getElementById(container) as HTMLCanvasElement;
  if (!ctx) {
    return;
  }

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: timeLabels,
      datasets: [...datasets, alertsDataset],
    },
    options: {
      responsive: true,
      scales: {
        x: {
          type: 'time',
          time: {
            unit: timeUnit, // or 'hour', 'day', etc.
            displayFormats: {
              minute: 'HH:mm',
              hour: 'HH:mm',
              day: 'MMM d',
              week: 'MMM d',
              month: 'MMM yyyy',
              quarter: 'MMM yyyy',
              year: 'yyyy',
            },
          },
          bounds: 'ticks',
          offset: true,
          ticks: {
            source: 'auto',
            autoSkip: true,
            maxRotation: 45,
            maxTicksLimit: tickLimit, // Adjust this to show more/fewer labels
            stepSize: stepSize,
            major: {
              enabled: true,
            },
            callback: function (value) {
              // Format the tick label
              return moment(value).format(displayFormat);
            },
          },
          min: start.valueOf(), // Add start time
          max: end.valueOf(), // Add end time
          stacked: true,
          title: {
            display: true,
            text: 'Time',
          },
        },
        y: {
          stacked: true,
          beginAtZero: true,
          title: {
            display: true,
            text: 'Count',
          },
          ticks: {
            stepSize: 1,
            precision: 0, // This prevents decimal places
          },
        },
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function (context: any) {
              const label = context.dataset.label || '';
              const value = context.parsed.y;
              const timeLabel = context.label;
              return `${groupByOption.text}: ${label}
  Count: ${value}
  Time: ${timeLabel}`;
            },
          },
        },
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: `Grouped by ${groupByOption.text}`,
        },
      },
    },
  });
};

export const createDoughnutChartWrapper = (
  visData: {
    ruleName: string;
    count: number;
  }[] = [],
  container: string = 'myDoughnutChart'
) => {
  try {
    createDoughnutChart(visData, container);
  } catch (e) {
    console.error(`Error while compiling doughnut chart ${container}`, e);
    return <>{/*TODO: hurneyt Error panel of some kind*/}</>;
  }
};

const createDoughnutChart = (
  visData: {
    ruleName: string;
    count: number;
  }[] = [],
  container: string = 'myDoughnutChart'
) => {
  // Register the required components
  Chart.register(
    DoughnutController, // for doughnut charts
    ArcElement, // for doughnut/pie charts
    Tooltip,
    Legend
  );

  const ctx = document.getElementById(container) as HTMLCanvasElement;
  if (!ctx) {
    return;
  }

  const labels: string[] = [];
  const counts: number[] = [];
  visData.forEach((item) => {
    labels.push(item.ruleName);
    counts.push(item.count);
  });
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [
        {
          data: counts,
          backgroundColor: euiPaletteColorBlind(labels.length),
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const label = context.label || '';
              const value = context.parsed;
              return `${label}: ${value}`;
            },
          },
        },
      },
    },
  });
};

const getGroupByText = (groupByValue: string) => {
  const allOptions = [
    ...alertsGroupByOptions,
    ...groupByOptionsByTabId[FindingTabId.DetectionRules],
    ...groupByOptionsByTabId[FindingTabId.ThreatIntel],
    ...summaryGroupByOptions,
  ];
  return allOptions.filter((item) => item.value === groupByValue)[0] || { text: '-', value: '-' };
};
