export default class Duration {
    constructor(public hours: number, public minutes: number){
        if (this.minutes > 60){
            this.hours += Math.floor(this.minutes / 60);
            this.minutes = this.minutes % 60;
        }
    }

    public add(other: Duration) : Duration {
        return new Duration(this.hours + other.hours, this.minutes + other.minutes);
    }
}