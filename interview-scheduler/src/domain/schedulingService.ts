import Schedule from "./schedule";
import { InterviewSlot } from "./interviewSlot";
import { TimeSlot } from "./timeSlot";
import { JuryDayParameters } from "./parameters";

export default class SchedulingService {
    public static generateSchedule(
        parameters : JuryDayParameters
    ) : Schedule {
        const candidatesCount = parameters.candidates.length;
        const schedule = new Schedule(candidatesCount);

        const totalMinutes = 600;
        const slotDuration = totalMinutes / candidatesCount;
    
        let currentTime = parameters.jurorsStartTime;
    
        for (let i = 0; i < candidatesCount; i++){
            const slotStart = new Date(currentTime);
            const slotEnd = new Date(currentTime.getTime() + slotDuration * 60 * 1000);

            const timeslot = new TimeSlot(slotStart, slotEnd);
            const interviewSlot = new InterviewSlot(i+1, timeslot);
            schedule.addSlot(interviewSlot);

            currentTime = slotEnd;

        }

        return schedule;
    }
}