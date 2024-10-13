import Schedule from "./schedule";
import { InterviewSlot } from "./interviewSlot";
import { TimeSlot } from "./simeSlot";

export default class SchedulingService {
    public static generateSchedule(
        candidateCount: number,
        startTime: Date,
        endTime: Date
    ) : Schedule {
        const schedule = new Schedule(candidateCount);

        const totalMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
        const slotDuration = totalMinutes / candidateCount;
    
        let currentTime = startTime;
    
        for (let i = 0; i < candidateCount; i++){
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