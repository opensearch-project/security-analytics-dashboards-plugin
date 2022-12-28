import {
  addInteractiveLegends,
  DateOpts,
  getAlertsVisualizationSpec,
  getChartTimeUnit,
  getDateFormatByTimeUnit,
  getFindingsVisualizationSpec,
  getOverviewVisualizationSpec,
  getVisualizationSpec,
  legendSelectionCfg,
} from './helpers';
import { TimeUnitsMap } from './constants';
import moment from 'moment';
import _ from 'lodash';

describe('helper utilities spec', () => {
  const description = 'Visualization';
  const defaultTimeUnit = 'yearmonthdatehoursminutes';
  const layer = {
    x: {
      field: 'xField',
    },
    y: {
      field: 'yField',
    },
  };

  const data = [
    {
      xField: 1,
      yField: 1,
    },
  ];

  const timeUnits: {
    [key: string]: string;
  } = {
    minutes: 'now-15m',
    hours: 'now-15h',
    days: 'now-15d',
    weeks: 'now-15w',
    months: 'now-5M',
    years: 'now-15y',
  };

  const dateOpts: DateOpts = {
    timeUnit: 'yearmonthdatehoursminutes',
    dateFormat: '%Y-%m-%d %H:%M',
  };

  describe('tests getDateFormatByTimeUnit function', () => {
    const yearFormat = '%Y-%m-%d';
    const dayFormat = '%H:%M:%S';
    const fullFormat = '%Y-%m-%d %H:%M';
    const hoursAgo = moment().subtract(15, 'hours');

    const timeFormats: {
      [key: string]: string;
    } = {
      'now-15m': dayFormat,
      'now-15h': hoursAgo.date() === moment().date() ? dayFormat : fullFormat,
      'now-15d': fullFormat,
      'now-2M': yearFormat,
      'now-2y': fullFormat,
    };

    it(` - function should return default format ${fullFormat} if dates are not valid`, () => {
      expect(getDateFormatByTimeUnit('', '')).toBe(fullFormat);
    });

    for (const [start, format] of Object.entries(timeFormats)) {
      it(` - function should return ${format} if start date is ${start}`, () => {
        expect(getDateFormatByTimeUnit(start, 'now')).toBe(format);
      });
    }
  });

  describe('tests getChartTimeUnit function', () => {
    it(' - function should return default timeUnit if fn params are invalid', () => {
      expect(getChartTimeUnit('', '')).toBe(defaultTimeUnit);
    });

    it(' - function should return default timeUnit if one is passed as param', () => {
      const defaultFormat = 'yearmonthdate';
      expect(getChartTimeUnit('', '', defaultFormat)).toBe(defaultFormat);
    });

    for (const [unit, start] of Object.entries(timeUnits)) {
      it(` - function should return ${TimeUnitsMap[unit]} if unit is ${unit}`, () => {
        expect(getChartTimeUnit(start, 'now')).toBe(TimeUnitsMap[unit]);
      });
    }
  });

  describe('tests addInteractiveLegends function', () => {
    const result = _.defaultsDeep(layer, legendSelectionCfg);
    it(' - function should return updated layer', () => {
      expect(addInteractiveLegends(layer)).toBe(result);
    });
  });

  describe('tests getVisualizationSpec function', () => {
    const result = getVisualizationSpec(description, data, [layer]);
    it(' - snapshot test', () => {
      expect(result).toMatchSnapshot('should match visualization spec');
    });
  });

  describe('tests getOverviewVisualizationSpec function', () => {
    const result = getOverviewVisualizationSpec([], '', dateOpts);
    it(' - snapshot test', () => {
      expect(result).toMatchSnapshot('should match overview spec');
    });
  });

  describe('tests getFindingsVisualizationSpec function', () => {
    const result = getFindingsVisualizationSpec([], '', dateOpts);
    it(' - snapshot test', () => {
      expect(result).toMatchSnapshot('should match findings spec');
    });
  });

  describe('tests getAlertsVisualizationSpec function', () => {
    const result = getAlertsVisualizationSpec([], '', dateOpts);
    it(' - snapshot test', () => {
      expect(result).toMatchSnapshot('should match alerts spec');
    });
  });
});
