import { JuryDayParameters, Candidate, InterviewParameters, Duration } from "./parameters";
import Time from "./time";

export interface SavedSession {
    id: string;
    createdAt: string; // ISO Date string
    juryDate: string;
    jobTitle: string;
    parameters: JuryDayParametersModel; // Serializable version of JuryDayParameters
    confirmedCandidates: string[]; // List of confirmed candidate names
}

// We need a serializable version of the parameters because the domain classes (Duration, Time) have methods
// and we need to reconstruct them after loading from JSON.
export interface JuryDayParametersModel {
    candidates: { name: string; email: string | null }[];
    jurorsStartTime: string;
    interviewParameters: {
        welcomeDuration: string; // "HH:mm"
        casusDuration: string;
        correctionDuration: string;
        interviewDuration: string;
        debriefingDuration: string;
    };
    lunchTargetTime: string;
    lunchDuration: string;
    finalDebriefingDuration: string;
}

export class SessionService {
    static mapToModel(params: JuryDayParameters): JuryDayParametersModel {
        return {
            candidates: params.candidates.map(c => ({ name: c.name, email: c.email })),
            jurorsStartTime: params.jurorsStartTime.toInputString(),
            interviewParameters: {
                welcomeDuration: params.interviewParameters.welcomeDuration.toInputString(),
                casusDuration: params.interviewParameters.casusDuration.toInputString(),
                correctionDuration: params.interviewParameters.correctionDuration.toInputString(),
                interviewDuration: params.interviewParameters.interviewDuration.toInputString(),
                debriefingDuration: params.interviewParameters.debriefingDuration.toInputString(),
            },
            lunchTargetTime: params.lunchTargetTime.toInputString(),
            lunchDuration: params.lunchDuration.toInputString(),
            finalDebriefingDuration: params.finalDebriefingDuration.toInputString(),
        };
    }

    static mapFromModel(model: JuryDayParametersModel): JuryDayParameters {
        const candidates = model.candidates.map(c => new Candidate(c.name, c.email));

        const interviewParams = new InterviewParameters(
            Duration.Parse(model.interviewParameters.welcomeDuration),
            Duration.Parse(model.interviewParameters.casusDuration),
            Duration.Parse(model.interviewParameters.correctionDuration),
            Duration.Parse(model.interviewParameters.interviewDuration),
            Duration.Parse(model.interviewParameters.debriefingDuration)
        );

        return new JuryDayParameters(
            candidates,
            Time.Parse(model.jurorsStartTime),
            interviewParams,
            Time.Parse(model.lunchTargetTime),
            Duration.Parse(model.lunchDuration),
            Duration.Parse(model.finalDebriefingDuration)
        );
    }
}
