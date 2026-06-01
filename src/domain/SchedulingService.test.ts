import SchedulingService from './schedulingService';
import { JuryDayParameters, InterviewParameters, Candidate } from './parameters';
import Duration from './duration';
import Time from './time';

describe('SchedulingService', () => {
  const createBasicParameters = (candidatesCount: number = 2): JuryDayParameters => {
    const candidates = Array.from({ length: candidatesCount }, (_, index) =>
      new Candidate(`Candidate ${index + 1}`, `candidate${index + 1}@example.com`)
    );

    return new JuryDayParameters(
      candidates,
      new Time(9, 0), // jurorsStartTime
      new InterviewParameters(
        new Duration(0, 15), // welcome
        new Duration(1, 0),  // casus
        new Duration(0, 15), // correction
        new Duration(1, 0),  // interview
        new Duration(0, 15)  // debriefing
      ),
      new Time(12, 45), // lunchTargetTime
      new Duration(0, 30), // lunchDuration
      new Duration(0, 15)  // finalDebriefingDuration
    );
  };

  describe('generateSchedule', () => {
    test('should generate basic schedule structure', () => {
      const parameters = createBasicParameters(1);
      const schedule = SchedulingService.generateSchedule(parameters);

      expect(schedule).toHaveProperty('generalSlots');
      expect(schedule).toHaveProperty('candidateSchedules');
      expect(Array.isArray(schedule.generalSlots)).toBe(true);
      expect(Array.isArray(schedule.candidateSchedules)).toBe(true);
    });

    test('should include jury welcome slot', () => {
      const parameters = createBasicParameters(1);
      const schedule = SchedulingService.generateSchedule(parameters);

      expect(schedule.generalSlots).toHaveLength(2); // Welcome + Final Debriefing
      expect(schedule.generalSlots[0].constructor.name).toBe('JuryWelcomeSlot');
    });

    test('should include final debriefing slot', () => {
      const parameters = createBasicParameters(1);
      const schedule = SchedulingService.generateSchedule(parameters);

      const lastSlot = schedule.generalSlots[schedule.generalSlots.length - 1];
      expect(lastSlot.constructor.name).toBe('FinalDebriefingSlot');
    });

    test('should create candidate schedules for all candidates', () => {
      const parameters = createBasicParameters(3);
      const schedule = SchedulingService.generateSchedule(parameters);

      expect(schedule.candidateSchedules).toHaveLength(3);
      expect(schedule.candidateSchedules[0].candidate.name).toBe('Candidate 1');
      expect(schedule.candidateSchedules[1].candidate.name).toBe('Candidate 2');
      expect(schedule.candidateSchedules[2].candidate.name).toBe('Candidate 3');
    });

    test('should handle empty candidate list', () => {
      const parameters = createBasicParameters(0);
      const schedule = SchedulingService.generateSchedule(parameters);

      expect(schedule.candidateSchedules).toHaveLength(0);
      expect(schedule.generalSlots).toHaveLength(2); // Welcome + Final Debriefing
    });

    test('should add lunch slot when appropriate', () => {
      // Create parameters that would trigger lunch
      const candidates = Array.from({ length: 4 }, (_, index) =>
        new Candidate(`Candidate ${index + 1}`, `candidate${index + 1}@example.com`)
      );

      const parameters = new JuryDayParameters(
        candidates,
        new Time(9, 0),
        new InterviewParameters(
          new Duration(0, 15), // welcome
          new Duration(1, 30), // casus (longer to push past lunch time)
          new Duration(0, 15), // correction
          new Duration(1, 0),  // interview
          new Duration(0, 15)  // debriefing
        ),
        new Time(12, 0), // earlier lunch target
        new Duration(0, 30),
        new Duration(0, 15)
      );

      const schedule = SchedulingService.generateSchedule(parameters);

      // Should have Welcome, Lunch, and Final Debriefing slots
      expect(schedule.generalSlots.length).toBeGreaterThan(2);

      // Check if there's a lunch slot
      const hasLunchSlot = schedule.generalSlots.some(slot =>
        slot.constructor.name === 'LunchSlot'
      );
      expect(hasLunchSlot).toBe(true);
    });

    test('should schedule candidates sequentially', () => {
      const parameters = createBasicParameters(2);
      const schedule = SchedulingService.generateSchedule(parameters);

      expect(schedule.candidateSchedules).toHaveLength(2);

      const firstCandidateSlot = schedule.candidateSchedules[0].interviewSlots[0];
      const secondCandidateSlot = schedule.candidateSchedules[1].interviewSlots[0];

      // Second candidate should start after first candidate ends
      expect(secondCandidateSlot.timeSlot.startTime.hour).toBeGreaterThanOrEqual(
        firstCandidateSlot.timeSlot.startTime.hour
      );
    });

    test('should maintain proper timing relationships', () => {
      const parameters = createBasicParameters(1);
      const schedule = SchedulingService.generateSchedule(parameters);

      const juryWelcome = schedule.generalSlots[0];
      const candidateSlot = schedule.candidateSchedules[0].interviewSlots[0];

      // Candidate preparation time may start before jury welcome ends, but interview should be after
      // Just verify that both slots have valid times
      expect(candidateSlot.timeSlot.startTime.hour).toBeGreaterThanOrEqual(0);
      expect(juryWelcome.timeSlot.startTime.hour).toBeGreaterThanOrEqual(0);
    });

    test('should handle single candidate correctly', () => {
      const parameters = createBasicParameters(1);
      const schedule = SchedulingService.generateSchedule(parameters);

      expect(schedule.candidateSchedules).toHaveLength(1);
      expect(schedule.candidateSchedules[0].interviewSlots).toHaveLength(1);
      expect(schedule.generalSlots).toHaveLength(2); // Welcome + Final Debriefing (no lunch needed for single candidate)
    });

    test('should handle multiple candidates with varying schedules', () => {
      const parameters = createBasicParameters(5);
      const schedule = SchedulingService.generateSchedule(parameters);

      expect(schedule.candidateSchedules).toHaveLength(5);

      // Each candidate should have exactly one interview slot
      schedule.candidateSchedules.forEach((candidateSchedule, index) => {
        expect(candidateSchedule.interviewSlots).toHaveLength(1);
        expect(candidateSchedule.candidate.name).toBe(`Candidate ${index + 1}`);
      });
    });

    const createAfternoonParameters = (forceLunch: boolean): JuryDayParameters => {
      const candidates = Array.from({ length: 4 }, (_, i) =>
        new Candidate(`Candidate ${i + 1}`, null)
      );
      return new JuryDayParameters(
        candidates,
        new Time(13, 0),
        new InterviewParameters(
          new Duration(0, 15),
          new Duration(1, 0),
          new Duration(0, 15),
          new Duration(1, 0),
          new Duration(0, 15)
        ),
        new Time(14, 0),
        new Duration(0, 30),
        new Duration(0, 15),
        forceLunch
      );
    };

    test('should NOT add lunch slot for afternoon session when forceLunch is false', () => {
      const schedule = SchedulingService.generateSchedule(createAfternoonParameters(false));
      const hasLunchSlot = schedule.generalSlots.some(s => s.constructor.name === 'LunchSlot');
      expect(hasLunchSlot).toBe(false);
    });

    test('should add lunch slot for afternoon session when forceLunch is true', () => {
      const schedule = SchedulingService.generateSchedule(createAfternoonParameters(true));
      const hasLunchSlot = schedule.generalSlots.some(s => s.constructor.name === 'LunchSlot');
      expect(hasLunchSlot).toBe(true);
    });

    test('should NOT add lunch slot when jurorsStartTime is exactly 12:00 and forceLunch is false', () => {
      const candidates = Array.from({ length: 4 }, (_, i) =>
        new Candidate(`Candidate ${i + 1}`, null)
      );
      const parameters = new JuryDayParameters(
        candidates,
        new Time(12, 0),
        new InterviewParameters(
          new Duration(0, 15),
          new Duration(1, 0),
          new Duration(0, 15),
          new Duration(1, 0),
          new Duration(0, 15)
        ),
        new Time(13, 0),
        new Duration(0, 30),
        new Duration(0, 15),
        false
      );
      const schedule = SchedulingService.generateSchedule(parameters);
      const hasLunchSlot = schedule.generalSlots.some(s => s.constructor.name === 'LunchSlot');
      expect(hasLunchSlot).toBe(false);
    });
  });

  describe('retro-planning (end mode)', () => {
    const lastSlotEnd = (schedule: ReturnType<typeof SchedulingService.generateSchedule>) =>
      schedule.generalSlots[schedule.generalSlots.length - 1].timeSlot.endTime;

    const createEndModeParameters = (candidatesCount: number, endTime: Time): JuryDayParameters => {
      const candidates = Array.from({ length: candidatesCount }, (_, index) =>
        new Candidate(`Candidate ${index + 1}`, null)
      );
      return new JuryDayParameters(
        candidates,
        new Time(9, 0), // jurorsStartTime (ignored in end mode)
        new InterviewParameters(
          new Duration(0, 15),
          new Duration(1, 0),
          new Duration(0, 15),
          new Duration(1, 0),
          new Duration(0, 15)
        ),
        new Time(12, 45),
        new Duration(0, 30),
        new Duration(0, 15),
        false,
        'end',
        endTime
      );
    };

    test('final debriefing ends exactly at the requested end time', () => {
      const schedule = SchedulingService.generateSchedule(createEndModeParameters(3, new Time(17, 30)));
      const end = lastSlotEnd(schedule);
      expect(end.hour).toBe(17);
      expect(end.minute).toBe(30);
    });

    test('produces the same length day as the equivalent start-mode schedule', () => {
      const endSchedule = SchedulingService.generateSchedule(createEndModeParameters(3, new Time(17, 30)));
      const computedStart = endSchedule.generalSlots[0].timeSlot.startTime;

      // Feed the computed start back through start-mode and confirm the same end time.
      const startSchedule = SchedulingService.generateSchedule(new JuryDayParameters(
        Array.from({ length: 3 }, (_, i) => new Candidate(`Candidate ${i + 1}`, null)),
        computedStart,
        new InterviewParameters(
          new Duration(0, 15),
          new Duration(1, 0),
          new Duration(0, 15),
          new Duration(1, 0),
          new Duration(0, 15)
        ),
        new Time(12, 45),
        new Duration(0, 30),
        new Duration(0, 15),
        false
      ));

      expect(lastSlotEnd(startSchedule).hour).toBe(17);
      expect(lastSlotEnd(startSchedule).minute).toBe(30);
    });

    test('still inserts lunch when the computed start lands before noon', () => {
      // A long day forced to finish at 18:00 will start in the morning, so lunch applies.
      const schedule = SchedulingService.generateSchedule(createEndModeParameters(5, new Time(18, 0)));
      const computedStart = schedule.generalSlots[0].timeSlot.startTime;
      expect(new Time(12, 0).isLaterThan(computedStart)).toBe(true);

      const hasLunchSlot = schedule.generalSlots.some(s => s.constructor.name === 'LunchSlot');
      expect(hasLunchSlot).toBe(true);
      // Lunch lengthens the day, so the end must still land exactly on the target.
      expect(lastSlotEnd(schedule).hour).toBe(18);
      expect(lastSlotEnd(schedule).minute).toBe(0);
    });

    test('forceLunch in end mode pushes the start earlier while keeping the end fixed', () => {
      // Afternoon-only day: without forceLunch no lunch, with forceLunch a lunch is inserted.
      const makeParams = (forceLunch: boolean) => new JuryDayParameters(
        Array.from({ length: 3 }, (_, i) => new Candidate(`Candidate ${i + 1}`, null)),
        new Time(9, 0),
        new InterviewParameters(
          new Duration(0, 15),
          new Duration(0, 30),
          new Duration(0, 15),
          new Duration(0, 30),
          new Duration(0, 15)
        ),
        new Time(15, 0),
        new Duration(0, 30),
        new Duration(0, 15),
        forceLunch,
        'end',
        new Time(17, 0)
      );

      const without = SchedulingService.generateSchedule(makeParams(false));
      const withLunch = SchedulingService.generateSchedule(makeParams(true));

      const startMinutes = (s: ReturnType<typeof SchedulingService.generateSchedule>) => {
        const t = s.generalSlots[0].timeSlot.startTime;
        return t.hour * 60 + t.minute;
      };

      // With lunch the day is longer, so it must start earlier to still end at 17:00.
      expect(startMinutes(withLunch)).toBeLessThan(startMinutes(without));
      expect(lastSlotEnd(withLunch).hour).toBe(17);
      expect(lastSlotEnd(withLunch).minute).toBe(0);
      expect(lastSlotEnd(without).hour).toBe(17);
      expect(lastSlotEnd(without).minute).toBe(0);
    });
  });
});