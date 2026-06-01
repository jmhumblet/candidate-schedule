import { FinalDebriefingSlot, InterviewSlot, JuryWelcomeSlot, LunchSlot } from "./interviewSlot";
import { JuryDayParameters } from "./parameters";
import { StructuredSchedule, CandidateSchedule } from "./scheduleTypes";
import Time from "./time";

export default class SchedulingService {
    public static generateSchedule(
        parameters : JuryDayParameters
    ) : StructuredSchedule {
        
        const structuredSchedule: StructuredSchedule = {
            generalSlots: [],
            candidateSchedules: [],
        };

        const juryWelcome = new JuryWelcomeSlot(parameters.jurorsStartTime);
        structuredSchedule.generalSlots.push(juryWelcome);

        let lunchHasHappened = false;
        let lastSlotEndTime = juryWelcome.timeSlot.endTime;
        const startsBeforeNoon = new Time(12, 0).isLaterThan(parameters.jurorsStartTime);

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
}
