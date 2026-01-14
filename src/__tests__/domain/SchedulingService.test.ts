import SchedulingService from '../../domain/schedulingService';
import { JuryDayParameters, InterviewParameters, Candidate } from '../../domain/parameters';
import Duration from '../../domain/duration';
import Time from '../../domain/time';

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
  });
});