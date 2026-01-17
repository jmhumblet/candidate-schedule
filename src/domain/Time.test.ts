import Time from './time';
import Duration from './duration';

describe('Time', () => {
  describe('constructor', () => {
    test('should create time with valid hour and minute', () => {
      const time = new Time(14, 30);
      expect(time.hour).toBe(14);
      expect(time.minute).toBe(30);
    });

    test('should handle edge cases', () => {
      const time = new Time(0, 0);
      expect(time.hour).toBe(0);
      expect(time.minute).toBe(0);
    });
  });

  describe('Parse method', () => {
    test('should parse valid time string', () => {
      const time = Time.Parse('14:30');
      expect(time.hour).toBe(14);
      expect(time.minute).toBe(30);
    });

    test('should parse time with zero padding', () => {
      const time = Time.Parse('09:05');
      expect(time.hour).toBe(9);
      expect(time.minute).toBe(5);
    });

    test('should parse time without zero padding', () => {
      const time = Time.Parse('9:5');
      expect(time.hour).toBe(9);
      expect(time.minute).toBe(5);
    });

    test('should parse midnight', () => {
      const time = Time.Parse('00:00');
      expect(time.hour).toBe(0);
      expect(time.minute).toBe(0);
    });

    test('should parse late evening', () => {
      const time = Time.Parse('23:59');
      expect(time.hour).toBe(23);
      expect(time.minute).toBe(59);
    });
  });

  describe('later method', () => {
    test('should add duration without hour overflow', () => {
      const time = new Time(10, 30);
      const duration = new Duration(1, 15);
      const result = time.later(duration);

      expect(result.hour).toBe(11);
      expect(result.minute).toBe(45);
    });

    test('should add duration with minute overflow', () => {
      const time = new Time(10, 45);
      const duration = new Duration(0, 30);
      const result = time.later(duration);

      expect(result.hour).toBe(11);
      expect(result.minute).toBe(15);
    });

    test('should add duration with hour overflow', () => {
      const time = new Time(23, 45);
      const duration = new Duration(0, 30);
      const result = time.later(duration);

      expect(result.hour).toBe(24);
      expect(result.minute).toBe(15);
    });

    test('should handle zero duration addition', () => {
      const time = new Time(12, 30);
      const duration = new Duration(0, 0);
      const result = time.later(duration);

      expect(result.hour).toBe(12);
      expect(result.minute).toBe(30);
    });

    test('should handle complex duration addition', () => {
      const time = new Time(8, 45);
      const duration = new Duration(2, 30);
      const result = time.later(duration);

      expect(result.hour).toBe(11);
      expect(result.minute).toBe(15);
    });
  });

  describe('earlier method', () => {
    test('should subtract duration without underflow', () => {
      const time = new Time(14, 30);
      const duration = new Duration(1, 15);
      const result = time.earlier(duration);

      expect(result.hour).toBe(13);
      expect(result.minute).toBe(15);
    });

    test('should subtract duration with minute underflow', () => {
      const time = new Time(14, 15);
      const duration = new Duration(0, 30);
      const result = time.earlier(duration);

      expect(result.hour).toBe(13);
      expect(result.minute).toBe(45);
    });

    test('should subtract duration with hour underflow', () => {
      const time = new Time(1, 15);
      const duration = new Duration(2, 0);
      const result = time.earlier(duration);

      expect(result.hour).toBe(-1);
      expect(result.minute).toBe(15);
    });

    test('should handle zero duration subtraction', () => {
      const time = new Time(12, 30);
      const duration = new Duration(0, 0);
      const result = time.earlier(duration);

      expect(result.hour).toBe(12);
      expect(result.minute).toBe(30);
    });

    test('should handle complex minute underflow', () => {
      const time = new Time(10, 5);
      const duration = new Duration(0, 20);
      const result = time.earlier(duration);

      expect(result.hour).toBe(9);
      expect(result.minute).toBe(45);
    });
  });

  describe('isLaterThan method', () => {
    test('should return true when hour is later', () => {
      const time1 = new Time(15, 30);
      const time2 = new Time(14, 45);

      expect(time1.isLaterThan(time2)).toBe(true);
    });

    test('should return true when hour is same but minute is later', () => {
      const time1 = new Time(14, 45);
      const time2 = new Time(14, 30);

      expect(time1.isLaterThan(time2)).toBe(true);
    });

    test('should return false when hour is earlier', () => {
      const time1 = new Time(13, 30);
      const time2 = new Time(14, 15);

      expect(time1.isLaterThan(time2)).toBe(false);
    });

    test('should return false when hour is same but minute is earlier', () => {
      const time1 = new Time(14, 30);
      const time2 = new Time(14, 45);

      expect(time1.isLaterThan(time2)).toBe(false);
    });

    test('should return false when times are equal', () => {
      const time1 = new Time(14, 30);
      const time2 = new Time(14, 30);

      expect(time1.isLaterThan(time2)).toBe(false);
    });
  });

  describe('toString method', () => {
    test('should format time with French locale', () => {
      const time = new Time(14, 30);
      const result = time.toString();

      expect(result).toBe('14h30');
    });

    test('should format time with zero padding', () => {
      const time = new Time(9, 5);
      const result = time.toString();

      expect(result).toBe('09h05');
    });

    test('should format midnight', () => {
      const time = new Time(0, 0);
      const result = time.toString();

      expect(result).toBe('00h00');
    });

    test('should format late evening', () => {
      const time = new Time(23, 59);
      const result = time.toString();

      expect(result).toBe('23h59');
    });
  });
});