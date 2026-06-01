import { FinalDebriefingSlot, InterviewSlot, JuryWelcomeSlot, LunchSlot } from "./interviewSlot";
import { JuryDayParameters } from "./parameters";
import { StructuredSchedule, CandidateSchedule } from "./scheduleTypes";
import Duration from "./duration";
import Time from "./time";

export default class SchedulingService {
    public static generateSchedule(
        parameters : JuryDayParameters
    ) : StructuredSchedule {
        const effectiveStartTime = parameters.scheduleMode === 'end' && parameters.endTime
            ? this.computeStartForEndTime(parameters, parameters.endTime)
            : parameters.jurorsStartTime;

        return this.buildForward(parameters, effectiveStartTime);
    }

    private static buildForward(
        parameters : JuryDayParameters,
        startTime : Time
    ) : StructuredSchedule {

        const structuredSchedule: StructuredSchedule = {
            generalSlots: [],
            candidateSchedules: [],
        };

        const juryWelcome = new JuryWelcomeSlot(startTime);
        structuredSchedule.generalSlots.push(juryWelcome);

        let lunchHasHappened = false;
        let lastSlotEndTime = juryWelcome.timeSlot.endTime;
        const startsBeforeNoon = new Time(12, 0).isLaterThan(startTime);

        for (const candidate of parameters.candidates){
            const referenceStart = lastSlotEndTime;
            const nextStartTime = referenceStart
                .earlier(parameters.interviewParameters.casusDuration)
                .earlier(parameters.interviewParameters.welcomeDuration);

            const appearance = new InterviewSlot(candidate, nextStartTime, parameters.interviewParameters);

            const candidateSchedule: CandidateSchedule = {
                candidate: candidate,
                interviewSlots: [appearance],
            };
            structuredSchedule.candidateSchedules.push(candidateSchedule);
            lastSlotEndTime = appearance.timeSlot.endTime;

            if (!lunchHasHappened
                && (startsBeforeNoon || parameters.forceLunch)
                && appearance.timeSlot.endTime
                    .later(parameters.interviewParameters.juryDuration.half())
                    .isLaterThan(parameters.lunchTargetTime)
            ) {
                const lunchSlot = new LunchSlot(appearance.timeSlot.endTime, parameters.lunchDuration);
                structuredSchedule.generalSlots.push(lunchSlot);
                lastSlotEndTime = lunchSlot.timeSlot.endTime;
                lunchHasHappened = true;
            }
        }

        structuredSchedule.generalSlots.push(new FinalDebriefingSlot(lastSlotEndTime, parameters.finalDebriefingDuration));

        return structuredSchedule;
    }

    // Retro-planning: find the latest start time such that the final debriefing ends exactly
    // at the requested end time. Iterates because the day length can change once (lunch
    // insertion depends on whether the start is before noon).
    private static computeStartForEndTime(
        parameters : JuryDayParameters,
        endTime : Time
    ) : Time {
        const toMinutes = (t: Time) => t.hour * 60 + t.minute;

        let start = endTime;
        for (let i = 0; i < 5; i++) {
            const schedule = this.buildForward(parameters, start);
            const debriefEnd = schedule.generalSlots[schedule.generalSlots.length - 1].timeSlot.endTime;
            const spanMinutes = toMinutes(debriefEnd) - toMinutes(start);
            const nextStart = endTime.earlier(new Duration(Math.floor(spanMinutes / 60), spanMinutes % 60));

            if (toMinutes(nextStart) === toMinutes(start)) {
                break;
            }
            start = nextStart;
        }

        return start;
    }
}
