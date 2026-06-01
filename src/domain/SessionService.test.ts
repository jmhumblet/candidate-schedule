import { SessionService } from './session';
import { JuryDayParameters, InterviewParameters, Duration, Candidate } from './parameters';
import Time from './time';

describe('SessionService', () => {
    it('mapToModel should convert Candidate instances to plain objects', () => {
        const candidate1 = new Candidate('Alice', 'alice@example.com');
        const candidate2 = new Candidate('Bob', null);

        const params = new JuryDayParameters(
            [candidate1, candidate2],
            new Time(9, 0),
            new InterviewParameters(
                new Duration(0, 5),
                new Duration(0, 15),
                new Duration(0, 5),
                new Duration(0, 20),
                new Duration(0, 5)
            ),
            new Time(12, 0),
            new Duration(1, 0),
            new Duration(0, 15)
        );

        const model = SessionService.mapToModel(params);

        // Check that candidates in the model are plain objects, not instances of Candidate
        expect(model.candidates[0]).not.toBeInstanceOf(Candidate);
        expect(model.candidates[1]).not.toBeInstanceOf(Candidate);

        // Verify values are preserved
        expect(model.candidates[0]).toEqual({ name: 'Alice', email: 'alice@example.com' });
        expect(model.candidates[1]).toEqual({ name: 'Bob', email: null });

        // Double check using prototype to be absolutely sure what Firestore would see
        expect(Object.getPrototypeOf(model.candidates[0])).toBe(Object.prototype);
    });

    it('mapToModel should preserve forceLunch', () => {
        const params = new JuryDayParameters(
            [],
            new Time(14, 0),
            new InterviewParameters(
                new Duration(0, 15),
                new Duration(1, 0),
                new Duration(0, 15),
                new Duration(1, 0),
                new Duration(0, 15)
            ),
            new Time(15, 0),
            new Duration(0, 30),
            new Duration(0, 15),
            true
        );
        const model = SessionService.mapToModel(params);
        expect(model.forceLunch).toBe(true);
    });

    it('mapFromModel should preserve forceLunch and default to false when absent', () => {
        const baseModel = {
            candidates: [],
            jurorsStartTime: '14:00',
            interviewParameters: {
                welcomeDuration: '00:15',
                casusDuration: '01:00',
                correctionDuration: '00:15',
                interviewDuration: '01:00',
                debriefingDuration: '00:15',
            },
            lunchTargetTime: '15:00',
            lunchDuration: '00:30',
            finalDebriefingDuration: '00:15',
        };

        const withForce = SessionService.mapFromModel({ ...baseModel, forceLunch: true });
        expect(withForce.forceLunch).toBe(true);

        const withoutForce = SessionService.mapFromModel({ ...baseModel });
        expect(withoutForce.forceLunch).toBe(false);
    });
});
