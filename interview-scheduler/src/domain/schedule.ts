import { InterviewSlot } from "./interviewSlot";

class Schedule {
    private slots: InterviewSlot[] = [];

    constructor(public candidateCount: number){}

    public addSlot(slot: InterviewSlot){
        this.slots.push(slot);
    }

    public getSlots() : InterviewSlot[] {
        return this.slots;
    }
}

export default Schedule;