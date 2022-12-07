import { getChartTimeUnit, getDateFormatByTimeUnit } from './helpers';
import { TimeUnitsMap } from './constants';

describe('helper utilities spec', () => {
  describe('tests getDateFormatByTimeUnit function', () => {
    const yearFormat = '%Y-%m-%d';
    const dayFormat = '%H:%M:%S';
    const fullFormat = '%Y-%m-%d %H:%M';

    const timeFormats: {
      [key: string]: string;
    } = {
      'now-15m': dayFormat,
      'now-15h': fullFormat,
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
    const defaultTimeUnit = 'yearmonthdatehoursminutes';
    it(' - function should return default timeUnit if fn params are invalid', () => {
      expect(getChartTimeUnit('', '')).toBe(defaultTimeUnit);
    });

    it(' - function should return default timeUnit if one is passed as param', () => {
      const defaultFormat = 'yearmonthdate';
      expect(getChartTimeUnit('', '', defaultFormat)).toBe(defaultFormat);
    });

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

    for (const [unit, start] of Object.entries(timeUnits)) {
      it(` - function should return ${TimeUnitsMap[unit]} if unit is ${unit}`, () => {
        expect(getChartTimeUnit(start, 'now')).toBe(TimeUnitsMap[unit]);
      });
    }
  });
});
