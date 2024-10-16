import Duration from "./duration";

export class TimeSlot {
    public duration : Duration;

    constructor (public startTime: Date, public endTime: Date){
        this.duration = new Duration(0, this.endTime.getTime() - this.startTime.getTime() / (1000 * 60));
    }

    public toString = (): string => `${this.prettyDateString(this.startTime)} - ${this.prettyDateString(this.endTime)}`;

    private prettyDateString = (date: Date) => date.toTimeString().substring(0, 5);
}