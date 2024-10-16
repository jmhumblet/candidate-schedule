import { Candidate, Duration, InterviewParameters } from './parameters';
import Time from './time';
import { TimeSlot } from './timeSlot'

export interface Slot {
    timeSlot : TimeSlot;
}

export class InterviewSlot implements Slot {
    public timeSlot : TimeSlot;
    casusStartTime: Time;
    correctionStartTime: Time;
    meetingStartTime: Time;
    debriefingStartTime: Time;

    constructor(
        public candidate: Candidate, 
        startTime: Time, 
        interviewParameters: InterviewParameters
    ){
        const endTime = startTime.later(interviewParameters.totalDuration);
        this.timeSlot = new TimeSlot(startTime, endTime);
        
        this.casusStartTime = startTime.later(interviewParameters.welcomeDuration);
        this.correctionStartTime = this.casusStartTime.later(interviewParameters.casusDuration);
        this.meetingStartTime = this.correctionStartTime.later(interviewParameters.correctionDuration);
        this.debriefingStartTime = this.meetingStartTime.later(interviewParameters.interviewDuration);
    }
}

export class JuryWelcomeSlot implements Slot {
    private static DURATION : Duration = new Duration(0,15);

    static ToBeReadyAt(correctionStartTime: Time) {
        return new JuryWelcomeSlot(correctionStartTime.earlier(this.DURATION));
    }
    public timeSlot : TimeSlot;

    constructor(startTime: Time){
        this.timeSlot = new TimeSlot(startTime, startTime.later(JuryWelcomeSlot.DURATION));
    }
}

export class LunchSlot implements Slot {
    public timeSlot: TimeSlot;

    constructor(startTime : Time, duration : Duration){
        this.timeSlot = new TimeSlot(startTime, startTime.later(duration));
    }
}

export class FinalDebriefingSlot implements Slot {
    public timeSlot : TimeSlot;

    constructor(startTime : Time, duration : Duration){
        this.timeSlot = new TimeSlot(startTime, startTime.later(duration));
    }
}