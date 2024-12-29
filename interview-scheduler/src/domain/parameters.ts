import Duration from "./duration";
import Time from "./time";

class JuryDayParameters {
    constructor(
        public candidates : Candidate[],
        public jurorsStartTime : Time,
        public interviewParameters : InterviewParameters,
        public lunchTargetTime : Time,
        public lunchDuration : Duration,
        public finalDebriefingDuration : Duration
    ) {}
}

class InterviewParameters {
    public candidateDuration : Duration;
    public juryDuration : Duration;
    public totalDuration: any;

    constructor(
        public welcomeDuration : Duration,
        public casusDuration : Duration,
        public correctionDuration : Duration,
        public interviewDuration : Duration,
        public debriefingDuration : Duration
    ){
        this.candidateDuration = welcomeDuration.plus(casusDuration).plus(correctionDuration).plus(interviewDuration);
        this.juryDuration = correctionDuration.plus(interviewDuration).plus(debriefingDuration);
        this.totalDuration = this.candidateDuration.plus(debriefingDuration);
    }
}

class Candidate {
    constructor(
        public name : string,
        public email : string | null
    ){}
}

export {JuryDayParameters, InterviewParameters, Duration, Candidate}