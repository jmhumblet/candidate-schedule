import { InterviewParameters, Candidate, JuryDayParameters } from './parameters';
import Duration from './duration';
import Time from './time';

describe('InterviewParameters', () => {
  describe('constructor and calculated properties', () => {
    test('should calculate candidateDuration correctly', () => {
      const welcomeDuration = new Duration(0, 15);
      const casusDuration = new Duration(1, 0);
      const correctionDuration = new Duration(0, 15);
      const interviewDuration = new Duration(1, 0);
      const debriefingDuration = new Duration(0, 15);

      const params = new InterviewParameters(
        welcomeDuration,
        casusDuration,
        correctionDuration,
        interviewDuration,
        debriefingDuration
      );

      // candidateDuration = welcome + casus + correction + interview
      // 0:15 + 1:00 + 0:15 + 1:00 = 2:30
      expect(params.candidateDuration.hours).toBe(2);
      expect(params.candidateDuration.minutes).toBe(30);
    });

    test('should calculate juryDuration correctly', () => {
      const welcomeDuration = new Duration(0, 15);
      const casusDuration = new Duration(1, 0);
      const correctionDuration = new Duration(0, 15);
      const interviewDuration = new Duration(1, 0);
      const debriefingDuration = new Duration(0, 15);

      const params = new InterviewParameters(
        welcomeDuration,
        casusDuration,
        correctionDuration,
        interviewDuration,
        debriefingDuration
      );

      // juryDuration = correction + interview + debriefing
      // 0:15 + 1:00 + 0:15 = 1:30
      expect(params.juryDuration.hours).toBe(1);
      expect(params.juryDuration.minutes).toBe(30);
    });

    test('should calculate totalDuration correctly', () => {
      const welcomeDuration = new Duration(0, 15);
      const casusDuration = new Duration(1, 0);
      const correctionDuration = new Duration(0, 15);
      const interviewDuration = new Duration(1, 0);
      const debriefingDuration = new Duration(0, 15);

      const params = new InterviewParameters(
        welcomeDuration,
        casusDuration,
        correctionDuration,
        interviewDuration,
        debriefingDuration
      );

      // totalDuration = candidateDuration + debriefing
      // 2:30 + 0:15 = 2:45
      expect(params.totalDuration.hours).toBe(2);
      expect(params.totalDuration.minutes).toBe(45);
    });

    test('should handle minimum durations', () => {
      const minDuration = new Duration(0, 1);
      const params = new InterviewParameters(
        minDuration,
        minDuration,
        minDuration,
        minDuration,
        minDuration
      );

      expect(params.candidateDuration.hours).toBe(0);
      expect(params.candidateDuration.minutes).toBe(4);
      expect(params.juryDuration.hours).toBe(0);
      expect(params.juryDuration.minutes).toBe(3);
    });
  });
});

describe('Candidate', () => {
  test('should create candidate with name and email', () => {
    const candidate = new Candidate('John Doe', 'john@example.com');

    expect(candidate.name).toBe('John Doe');
    expect(candidate.email).toBe('john@example.com');
  });

  test('should create candidate with name and null email', () => {
    const candidate = new Candidate('Jane Smith', null);

    expect(candidate.name).toBe('Jane Smith');
    expect(candidate.email).toBeNull();
  });
});

describe('JuryDayParameters', () => {
  test('should create jury day parameters with all required properties', () => {
    const candidates = [
      new Candidate('John Doe', 'john@example.com'),
      new Candidate('Jane Smith', 'jane@example.com')
    ];
    const jurorsStartTime = new Time(9, 0);
    const interviewParams = new InterviewParameters(
      new Duration(0, 15),
      new Duration(1, 0),
      new Duration(0, 15),
      new Duration(1, 0),
      new Duration(0, 15)
    );
    const lunchTargetTime = new Time(12, 45);
    const lunchDuration = new Duration(0, 30);
    const finalDebriefingDuration = new Duration(0, 15);

    const juryDayParams = new JuryDayParameters(
      candidates,
      jurorsStartTime,
      interviewParams,
      lunchTargetTime,
      lunchDuration,
      finalDebriefingDuration
    );

    expect(juryDayParams.candidates).toEqual(candidates);
    expect(juryDayParams.jurorsStartTime).toEqual(jurorsStartTime);
    expect(juryDayParams.interviewParameters).toEqual(interviewParams);
    expect(juryDayParams.lunchTargetTime).toEqual(lunchTargetTime);
    expect(juryDayParams.lunchDuration).toEqual(lunchDuration);
    expect(juryDayParams.finalDebriefingDuration).toEqual(finalDebriefingDuration);
  });

  test('should handle empty candidates array', () => {
    const candidates: Candidate[] = [];
    const jurorsStartTime = new Time(9, 0);
    const interviewParams = new InterviewParameters(
      new Duration(0, 15),
      new Duration(1, 0),
      new Duration(0, 15),
      new Duration(1, 0),
      new Duration(0, 15)
    );
    const lunchTargetTime = new Time(12, 45);
    const lunchDuration = new Duration(0, 30);
    const finalDebriefingDuration = new Duration(0, 15);

    const juryDayParams = new JuryDayParameters(
      candidates,
      jurorsStartTime,
      interviewParams,
      lunchTargetTime,
      lunchDuration,
      finalDebriefingDuration
    );

    expect(juryDayParams.candidates).toHaveLength(0);
  });
});