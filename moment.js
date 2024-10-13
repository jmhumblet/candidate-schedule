class Moment {
    static FromDuration(startTime, duration) {
        this.startTime = startTime;
        this.duration = duration;
        this.endTime = startTime.after(duration);
    }

    static FromTime(startTime, endTime) {
        if (this.startTime.isLaterThan(endTime)) throw Exception();

        this.startTime = startTime;
        this.duration = new Timespan(this.endTime.earlier(startTime));
        this.endTime = endTime;
    }
}

class Timespan {
    constructor({hour,minute}){
        this.hour = hour;
        this.minute = minute;
    }

    static Parse(time){
        return new Timespan(Time.Parse(time));
    }

    plus({hour,minute}){
        var totalMinutes = this.minute + minute;
        var minutes = totalMinutes % 60;
        var hours = this.hour + hour + ~~(totalMinutes / 60);
        return new Timespan({hour:hours, minute: 	minutes});
    }

    half(){
        const totalMinutes = this.hour * 60 + this.minute;
        const halfMinutes = totalMinutes / 2;
        const hour = ~~(halfMinutes / 60);
        const minutes = halfMinutes % 60;
        return new Timespan({hour:hour, minute:minutes});
    }
}

class Time {
    constructor(hour,minute){
        this.hour = hour;
        this.minute = minute;
    }

    static Parse(time){
        const parsed = time.split(':');
        var hour = Number(parsed[0]);
        var minute = Number(parsed[1]);
        return new Time(hour, minute);
    }

    after(other){
        var totalMinutes = this.minute + other.minute;
        var minutes = totalMinutes % 60;
        var hour = this.hour + other.hour + ~~(totalMinutes / 60);
        return new Time(hour, minutes);
    }

    earlier(other){
        var totalMinutes = this.minute - other.minute;
        var hour = this.hour - other.hour;
        if (totalMinutes < 0){
            totalMinutes = totalMinutes+60;
            hour -= 1;
        }
        return new Time(hour, totalMinutes)
    }

    

    isLaterThan(other){
        return this.hour > other.hour || (this.hour == other.hour && this.minute > other.minute);
    }

    toString() {
        return `${this.hour.toLocaleString('fr-BE', {minimumIntegerDigits: 2, useGrouping:false})}h${this.minute.toLocaleString('fr-BE', {minimumIntegerDigits: 2, useGrouping:false})}`
    }
}


export { Moment, Timespan, Time };