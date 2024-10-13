import moment from 'moment';
import { InterviewerTiming, CandidateTiming, SupervisorTiming } from './Timings.js';

class Timeslot {
    interviewerSummary() { }

    candidateSummary() { }

    supervisorSummary() { }
}

class InterviewTimeslot extends Timeslot {
    constructor(candidate, startTime, welcomeDuration, casusDuration, correctionDuration, meetingDuration, debriefDuration, templateProvider) {
        super();
        this.candidate = candidate;
        this.startTime = startTime;
        this.welcomeDuration = welcomeDuration;
        this.casusStartTime = this.startTime.after(welcomeDuration);
        this.correctionStartTime = this.casusStartTime.after(casusDuration);
        this.meetingStartTime = this.correctionStartTime.after(correctionDuration);
        this.debriefStartTime = this.meetingStartTime.after(meetingDuration);
        this.endTime = this.debriefStartTime.after(debriefDuration);

        this.interviewerTiming = new InterviewerTiming(this.candidate, this.correctionStartTime, this.meetingStartTime, this.debriefStartTime, this.endTime);
        this.candidateTiming = new CandidateTiming(this.candidate, this.startTime, this.welcomeDuration, this.casusStartTime, this.correctionStartTime, this.meetingStartTime, this.debriefStartTime, templateProvider);
        this.supervisorTiming = new SupervisorTiming(this.candidate, this.startTime, this.correctionStartTime);
    }

    summary() {
        return `<tr>
						<td>${this.candidate.toString()}</td>
						<td>${this.startTime.toString()}</td>
						<td>${this.casusStartTime.toString()} - ${this.correctionStartTime.toString()}</td>
						<td>${this.correctionStartTime.toString()} - ${this.meetingStartTime.toString()}</td>
						<td>${this.meetingStartTime.toString()} - ${this.debriefStartTime.toString()}</td>
						<td>${this.debriefStartTime.toString()} - ${this.endTime.toString()}</td>
						<td></td>
						</tr>`
    }

    interviewerSummary() {
        return this.interviewerTiming.summary();
    }

    candidateSummary() {
        return this.candidateTiming.summary();
    }

    supervisorSummary() {
        return this.supervisorTiming.summary();
    }
}

class LunchTimeslot extends Timeslot {
    constructor(startTime, lunchDuration) {
        super();
        this.startTime = startTime;
        this.endTime = this.startTime.after(lunchDuration);
    }

    summary() {
        return this.internalSummary(5);
    }


    interviewerSummary() {
        return this.internalSummary(4);
    }

    internalSummary(colspan) {
        return `<tr>
						<td></td>
						
						<td colspan="${colspan}" class="text-center"><i class="glyphicon glyphicon-pause"></i> <b>Pause midi (${this.startTime.toString()} - ${this.endTime.toString()})</b></td>
						<td></td>
						</tr>`
    }

    candidateSummary() { }
}

class GlobalDebriefingTimeslot extends Timeslot {
    constructor(startTime, duration) {
        super();
        this.startTime = startTime;
        this.endTime = startTime.after(duration);
    }

    summary() {
        return this.internalSummary(5);
    }


    interviewerSummary() {
        return this.internalSummary(4);
    }

    candidateSummary() { }

    internalSummary(colspan) {
        return `<tr>
						<td></td>
						<td colspan="${colspan}" class="text-center"><i class="glyphicon glyphicon-edit"></i> <b>Debriefing final (${this.startTime.toString()} - ${this.endTime.toString()})</b></td>
						<td></td>
						</tr>`
    }
}

class JuryWelcomeTimeslot extends Timeslot {
    static welcomeDuration = new Timespan({ hour: 0, minute: 15 });

    constructor(startTime) {
        super();
        this.startTime = startTime;
        this.endTime = startTime.after(JuryWelcomeTimeslot.welcomeDuration);
    }

    static ToBeReadyAt(time) {
        return new JuryWelcomeTimeslot(time.earlier(JuryWelcomeTimeslot.welcomeDuration))
    }


    summary() {
        return this.internalSummary(5);
    }


    interviewerSummary() {
        return this.internalSummary(4);
    }

    candidateSummary() { }

    internalSummary(colspan) {
        return `<tr>
						<td></td>
						<td colspan="${colspan}" class="text-center"><i class="glyphicon glyphicon-user"></i> <b>Accueil du jury (${this.startTime.toString()} - ${this.endTime.toString()})</b></td>
						<td></td>
						</tr>`
    }
}


export { InterviewTimeslot, LunchTimeslot, GlobalDebriefingTimeslot, JuryWelcomeTimeslot };