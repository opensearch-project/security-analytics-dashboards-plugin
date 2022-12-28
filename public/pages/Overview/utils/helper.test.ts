import { getChartTimeUnit, TimeUnits } from './helpers';

describe('helper utilities spec', () => {
  describe('tests getChartTimeUnit function', () => {
    const defaultTimeUnit = {
      timeUnit: { unit: 'yearmonthdatehoursminutes', step: 1 },
      dateFormat: '%Y-%m-%d %H:%M',
    };
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
});
