import Duration from "./duration";

export default class Time {
    constructor(public hour: number, public minute: number) {}

    static Parse(time: string){
        const parsed = time.split(':');
        var hour = Number(parsed[0]);
        var minute = Number(parsed[1]);
        return new Time(hour, minute);
    }

    public later(duration : Duration) : Time {
        const totalMinutes = this.minute + duration.minutes;
        const newMinutes = totalMinutes % 60;
        const newHour = this.hour + duration.hours + Math.floor(totalMinutes / 60);
        return new Time(newHour, newMinutes)
    }

    public earlier(duration : Duration) : Time {
        let newMinute = this.minute - duration.minutes;
        let newHour = this.hour - duration.hours;

        if (newMinute < 0){
            newMinute += 60;
            newHour -= 1;
        }

        return new Time(newHour, newMinute);
    }

    public isLaterThan(other: Time) : boolean {
        return this.hour > other.hour
            || (this.hour === other.hour && this.minute > other.minute)
    }

    public toString() : string {
        return `${this.hour.toLocaleString('fr-BE', {minimumIntegerDigits: 2, useGrouping:false})}h${this.minute.toLocaleString('fr-BE', {minimumIntegerDigits: 2, useGrouping:false})}`
    }

}