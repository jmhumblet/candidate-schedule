import { FinalDebriefingSlot, InterviewSlot, JuryWelcomeSlot, LunchSlot, Slot } from "./interviewSlot";
import { JuryDayParameters } from "./parameters";

export default class SchedulingService {
    public static generateSchedule(
        parameters : JuryDayParameters
    ) : Slot[] {
        
        const schedule : Slot[] = [];
        const juryWelcome = new JuryWelcomeSlot(parameters.jurorsStartTime);
        schedule.push(juryWelcome);

        let lunchHasHappened = false;
                
        for (const candidate of parameters.candidates){
            const referenceStart = schedule.length > 0 ? schedule.at(-1)!.timeSlot.endTime : parameters.jurorsStartTime;
            const nextStartTime = referenceStart
                .earlier(parameters.interviewParameters.casusDuration)
                .earlier(parameters.interviewParameters.welcomeDuration);

            const appearance = new InterviewSlot(candidate, nextStartTime, parameters.interviewParameters);
            schedule.push(appearance);

            if (!lunchHasHappened
                && appearance.timeSlot.endTime
                    .later(parameters.interviewParameters.juryDuration.half())
                    .isLaterThan(parameters.lunchTargetTime)
            ) {
                const lunchSlot = new LunchSlot(appearance.timeSlot.endTime, parameters.lunchDuration);
                schedule.push(lunchSlot);
            }
        }

        schedule.push(new FinalDebriefingSlot(schedule.at(-1)!.timeSlot.endTime, parameters.finalDebriefingDuration))

        return schedule;
    }
}