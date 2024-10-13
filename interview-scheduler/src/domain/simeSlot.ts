export class TimeSlot {
    constructor (public startTime: Date, public endTime: Date){}

    public duration(): number {
        return (this.endTime.getTime() - this.startTime.getTime()) / (1000 * 60);
    }

    public toString = (): string => `${this.prettyDateString(this.startTime)} - ${this.prettyDateString(this.endTime)}`;

    private prettyDateString = (date: Date) => date.toTimeString().substring(0, 5);
}