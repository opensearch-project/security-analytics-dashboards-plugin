import { getChartTimeUnit } from './helpers';
import { TimeUnitsMap } from './constants';

describe('helper utilities spec', () => {
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
