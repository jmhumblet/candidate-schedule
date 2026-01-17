import Duration from './duration';

describe('Duration', () => {
  describe('constructor', () => {
    test('should create duration with valid hours and minutes', () => {
      const duration = new Duration(1, 30);
      expect(duration.hours).toBe(1);
      expect(duration.minutes).toBe(30);
    });

    test('should normalize minutes over 60', () => {
      const duration = new Duration(0, 75);
      expect(duration.hours).toBe(1);
      expect(duration.minutes).toBe(15);
    });

    test('should handle multiple hour overflow', () => {
      const duration = new Duration(1, 150);
      expect(duration.hours).toBe(3);
      expect(duration.minutes).toBe(30);
    });

    test('should handle zero values', () => {
      const duration = new Duration(0, 0);
      expect(duration.hours).toBe(0);
      expect(duration.minutes).toBe(0);
    });
  });

  describe('Parse method', () => {
    test('should parse valid time string with hours and minutes', () => {
      const duration = Duration.Parse('01:30');
      expect(duration.hours).toBe(1);
      expect(duration.minutes).toBe(30);
    });

    test('should parse time string with zero padding', () => {
      const duration = Duration.Parse('00:15');
      expect(duration.hours).toBe(0);
      expect(duration.minutes).toBe(15);
    });

    test('should parse time string without zero padding', () => {
      const duration = Duration.Parse('2:45');
      expect(duration.hours).toBe(2);
      expect(duration.minutes).toBe(45);
    });

    test('should handle edge cases', () => {
      const duration = Duration.Parse('0:0');
      expect(duration.hours).toBe(0);
      expect(duration.minutes).toBe(0);
    });
  });

  describe('plus method', () => {
    test('should add two durations without overflow', () => {
      const duration1 = new Duration(1, 15);
      const duration2 = new Duration(0, 30);
      const result = duration1.plus(duration2);

      expect(result.hours).toBe(1);
      expect(result.minutes).toBe(45);
    });

    test('should add durations with minute overflow', () => {
      const duration1 = new Duration(1, 30);
      const duration2 = new Duration(0, 45);
      const result = duration1.plus(duration2);

      expect(result.hours).toBe(2);
      expect(result.minutes).toBe(15);
    });

    test('should add durations with multiple hour overflow', () => {
      const duration1 = new Duration(2, 45);
      const duration2 = new Duration(1, 30);
      const result = duration1.plus(duration2);

      expect(result.hours).toBe(4);
      expect(result.minutes).toBe(15);
    });

    test('should handle adding zero duration', () => {
      const duration1 = new Duration(1, 30);
      const duration2 = new Duration(0, 0);
      const result = duration1.plus(duration2);

      expect(result.hours).toBe(1);
      expect(result.minutes).toBe(30);
    });
  });

  describe('half method', () => {
    test('should halve even duration', () => {
      const duration = new Duration(2, 30);
      const result = duration.half();

      expect(result.hours).toBe(1);
      expect(result.minutes).toBe(15);
    });

    test('should halve odd minutes duration', () => {
      const duration = new Duration(1, 15);
      const result = duration.half();

      expect(result.hours).toBe(0);
      expect(result.minutes).toBe(37.5);
    });

    test('should halve duration with only hours', () => {
      const duration = new Duration(2, 0);
      const result = duration.half();

      expect(result.hours).toBe(1);
      expect(result.minutes).toBe(0);
    });

    test('should halve duration with only minutes', () => {
      const duration = new Duration(0, 30);
      const result = duration.half();

      expect(result.hours).toBe(0);
      expect(result.minutes).toBe(15);
    });

    test('should handle odd total minutes', () => {
      const duration = new Duration(0, 45);
      const result = duration.half();

      expect(result.hours).toBe(0);
      expect(result.minutes).toBe(22.5);
    });
  });
});