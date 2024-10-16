class JuryDayParameters {
    constructor(
        public juryDate : Date,
        public jobTitle : string,
        public candidates : Candidate[],
        public jurorsStartTime : Date,
        public interviewParameters : InterviewParameters,
        public lunchTargetTime : Date,
        public lunchDuration : Duration,
        public finalDebriefingDuration : Duration
    ) {}
}

class InterviewParameters {
    constructor(
        public welcomeDuration : Duration,
        public casusDuration : Duration,
        public correctionDuration : Duration,
        public interviewDuration : Duration,
        public debrifingDuration : Duration
    ){}
}

class Duration {
    constructor(
        public minutes : number
    ){}

    static fromTime(time: string) : Duration {
        const [hours, minutes] = time.split(':').map(Number);
        return new Duration(hours * 60 + minutes);
    }
}

class Candidate {
    constructor(
        public name : string,
        public email : string | null
    ){}
}

export {JuryDayParameters, InterviewParameters, Duration, Candidate}