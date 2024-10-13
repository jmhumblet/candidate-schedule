import Emailer from './Emailer.js';

class InterviewerTiming {
	constructor(candidate, correctionStartTime, meetingStartTime, debriefStartTime, endTime) {
		this.candidate = candidate;
		this.startTime = correctionStartTime;
		this.meetingStartTime = meetingStartTime;
		this.debriefStartTime = debriefStartTime;
		this.endTime = endTime;
	}

	summary() {
		return `<tr>
						<td>${this.startTime.toString()}</td>
						<td>${this.meetingStartTime.toString()}</td>
						<td>${this.debriefStartTime.toString()}</td>
						<td>${this.endTime.toString()}</td>
						</tr>`
	}
}

class CandidateTiming {
	constructor(candidate, startTime, welcomeDuration, casusStartTime, correctionStartTime, meetingStartTime, debriefStartTime, templateProvider) {
		this.candidate = candidate;
		this.startTime = startTime;
		this.welcomeDuration = welcomeDuration;
		this.casusStartTime = casusStartTime;
		this.pauseStartTime = correctionStartTime;
		this.meetingStartTime = meetingStartTime;
		this.endTime = debriefStartTime;
		this.templateProvider = templateProvider;
	}

	summary() {
		return `<tr>
						<td>
							<a href="${this.generateMailTo()}">
								<span class="glyphicon glyphicon-envelope"></span>
								${this.candidate.name} 
							</a>
							
						</td>
						<td>${this.startTime.toString()}</td>
						<td>${this.pauseStartTime.toString()}</td>
						<td>${this.meetingStartTime.toString()}</td>
						<td>${this.endTime.toString()}</td>
						</tr>`
	}

	generateMailTo() {
		const emailer = new Emailer(this.templateProvider());
		const subject = emailer.buildSubject(this);
		const body = emailer.buildBody(this);

		const br = "%0D%0A";
		return `mailto:${this.candidate.email ?? ""}?subject=${subject}&body=${body}`
	}

}

class SupervisorTiming {
	constructor(candidate, startTime, endTime) {
		this.candidate = candidate;
		this.startTime = startTime;
		this.endTime = endTime;
	}

	summary() {
		return `<tr>
						<td>${this.candidate.toString()}</td>
						<td>${this.startTime.toString()}</td>
						<td>${this.endTime.toString()}</td>
						</tr>`
	}
}

export { InterviewerTiming, CandidateTiming, SupervisorTiming }