import {
  addInteractiveLegends,
  DateOpts,
  getAlertsVisualizationSpec,
  getChartTimeUnit,
  getFindingsVisualizationSpec,
  getOverviewVisualizationSpec,
  getTimeTooltip,
  getTimeWithMinPrecision,
  getVisualizationSpec,
  getXAxis,
  getYAxis,
  legendSelectionCfg,
  parseDateString,
  TimeUnits,
} from './helpers';
import _ from 'lodash';
import dateMath from '@elastic/datemath';
import { DEFAULT_DATE_RANGE } from '../../../utils/constants';
import moment from 'moment';

describe('helper utilities spec', () => {
  const description = 'Visualization';
  const defaultTimeUnit = {
    timeUnit: { unit: 'yearmonthdatehoursminutes', step: 1 },
    dateFormat: '%Y-%m-%d %H:%M',
  };
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

  const dateOpts: DateOpts = {
    timeUnit: {
      unit: 'yearmonthdatehoursminutes',
      step: 1,
    },
    dateFormat: '%Y-%m-%d %H:%M',
  };

  describe('tests getChartTimeUnit function', () => {
    it(' - function should return default timeUnit if fn params are invalid', () => {
      const timeUnits = getChartTimeUnit('', '');
      expect(timeUnits.dateFormat).toBe(defaultTimeUnit.dateFormat);
      expect(timeUnits.timeUnit.unit).toBe(defaultTimeUnit.timeUnit.unit);
      expect(timeUnits.timeUnit.step).toBe(defaultTimeUnit.timeUnit.step);
    });

    it(' - function should return default timeUnit if one is passed as param', () => {
      const defaultFormat = 'yearmonthdatehoursminutes';
      const timeUnits = getChartTimeUnit('', '', defaultFormat);
      expect(timeUnits.timeUnit.unit).toBe(defaultFormat);
    });

    const timeUnitsExpected: {
      [key: string]: TimeUnits;
    } = {
      minutes: {
        dateFormat: '%Y-%m-%d %H:%M',
        timeUnit: { step: 1, unit: 'yearmonthdatehoursminutes' },
      },
      hours: {
        dateFormat: '%Y-%m-%d %H:%M',
        timeUnit: { step: 1, unit: 'yearmonthdatehours' },
      },
      days: {
        dateFormat: '%Y-%m-%d',
        timeUnit: { step: 1, unit: 'yearmonthdate' },
      },
      weeks: {
        dateFormat: '%Y-%m-%d',
        timeUnit: { step: 1, unit: 'yearmonthdate' },
      },
      months: {
        dateFormat: '%Y-%m-%d',
        timeUnit: { step: 1, unit: 'yearmonthdate' },
      },
      years: {
        dateFormat: '%Y',
        timeUnit: { step: 1, unit: 'year' },
      },
    };

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

    const validateTimeUnit = (timeUnit: TimeUnits, expectedTimeUnit: TimeUnits) => {
      expect(timeUnit.dateFormat).toBe(expectedTimeUnit.dateFormat);
      expect(timeUnit.timeUnit.unit).toBe(expectedTimeUnit.timeUnit.unit);
      expect(timeUnit.timeUnit.step).toBe(expectedTimeUnit.timeUnit.step);
    };

    for (const [unit, start] of Object.entries(timeUnits)) {
      it(` - filter ${start} should return valid timeUnit object`, () => {
        const timeUnitResult = getChartTimeUnit(start, 'now');
        validateTimeUnit(timeUnitResult, timeUnitsExpected[unit]);
      });
    }
  });

  describe('tests addInteractiveLegends function', () => {
    const result = _.defaultsDeep(layer, legendSelectionCfg);
    it(' - function should return updated layer', () => {
      expect(addInteractiveLegends(layer)).toBe(result);
    });
  });

  describe('tests parseDateString function', () => {
    it(' - function should return datetime in ms', () => {
      const mockTime = moment('2023-01-25T10:05:00');
      jest.spyOn(dateMath, 'parse').mockReturnValue(mockTime);
      jest.fn().mockImplementation('parseDateString', () => mockTime.milliseconds());
      expect(parseDateString(DEFAULT_DATE_RANGE.start)).toBe(mockTime._d.getTime());
    });
  });

  describe('tests getYAxis function', () => {
    it(' - function should return Y axis config', () => {
      const yAxisConfig = getYAxis('xField', 'Y axis title', false);
      const expectedYAxisConfig = {
        aggregate: 'sum',
        field: 'xField',
        type: 'quantitative',
        title: 'Y axis title',
        axis: { grid: false },
      };
      const isEqual = _.isEqual(yAxisConfig, expectedYAxisConfig);
      expect(isEqual).toBe(true);
    });
  });

  describe('tests getXAxis function', () => {
    it(' - function should return X axis config', () => {
      const xAxisConfig = getXAxis(dateOpts, {});
      const expectedXAxisConfig = {
        timeUnit: dateOpts.timeUnit,
        field: 'time',
        title: '',
        type: 'temporal',
        axis: { grid: false, format: dateOpts.dateFormat },
        scale: {
          domain: dateOpts.domain,
        },
      };
      const isEqual = _.isEqual(xAxisConfig, expectedXAxisConfig);
      expect(isEqual).toBe(true);
    });
  });

  describe('tests getTimeTooltip function', () => {
    it(' - function should return time tooltip config', () => {
      const tooltip = getTimeTooltip(dateOpts);
      const expectedTooltip = {
        timeUnit: dateOpts.timeUnit,
        field: 'time',
        type: 'temporal',
        title: 'Time',
        format: '%Y-%m-%d %H:%M:%S',
      };
      const isEqual = _.isEqual(tooltip, expectedTooltip);
      expect(isEqual).toBe(true);
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

  describe('tests getTimeWithMinPrecision function', () => {
    const result = getTimeWithMinPrecision('2022/12/01 01:01:01');
    it(' - test should be with ms and seconds eq to 0', () => {
      const ms = new Date(result).getMilliseconds();
      const seconds = new Date(result).getSeconds();
      expect(ms).toBe(0);
      expect(seconds).toBe(0);
    });
  });
});
