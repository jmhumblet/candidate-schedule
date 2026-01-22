import { Candidate, Duration, InterviewParameters } from './parameters';
import Time from './time';
import { TimeSlot } from './timeSlot'

export type SlotType = 'interview' | 'jury_welcome' | 'lunch' | 'final_debriefing';

export interface Slot {
    timeSlot : TimeSlot;
    readonly type: SlotType;
}

export class InterviewSlot implements Slot {
    readonly type = 'interview' as const;
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
    readonly type = 'jury_welcome' as const;
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
    readonly type = 'lunch' as const;
    public timeSlot: TimeSlot;

    constructor(startTime : Time, duration : Duration){
        this.timeSlot = new TimeSlot(startTime, startTime.later(duration));
    }
}

export class FinalDebriefingSlot implements Slot {
    readonly type = 'final_debriefing' as const;
    public timeSlot : TimeSlot;

    constructor(startTime : Time, duration : Duration){
        this.timeSlot = new TimeSlot(startTime, startTime.later(duration));
    }
}
