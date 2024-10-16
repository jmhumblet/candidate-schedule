import Duration from "./duration";
import Time from "./time";

export class TimeSlot {
    public duration : Duration;

    constructor (public startTime: Time, public endTime: Time){
        const d = endTime.earlier(new Duration(startTime.hour, startTime.minute));
        this.duration = new Duration(d.hour, d.minute);
    }

    public toString = (): string => `${this.startTime.toString()} - ${this.endTime.toString()}`;

}