import { Candidate } from './candidate';
import { Slot, InterviewSlot } from './interviewSlot';

export interface StructuredSchedule {
  generalSlots: Slot[]; // For JuryWelcome, Lunch, FinalDebriefing
  candidateSchedules: CandidateSchedule[];
}

export interface CandidateSchedule {
  candidate: Candidate;
  interviewSlots: InterviewSlot[]; // All slots directly related to this candidate
}
